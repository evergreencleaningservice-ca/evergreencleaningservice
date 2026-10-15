-- Lead outcomes: qualified, quote issued, won — the stages after the form.
--
-- WHY. The site reports one conversion, `lead_form_submission`, and that is
-- the number Google Ads bids on. A form fill is not a customer: some are
-- residential enquiries, job seekers, vendors or out-of-area. Without a record
-- of what happened next, Smart Bidding optimises for form fills of any quality.
-- These columns let the business record the outcome of each lead and export
-- the good ones back to Google Ads (offline conversion import, keyed on the
-- `gclid` the site already stores) as SECONDARY or value-based conversions.
--
-- NOTHING ON THE WEBSITE WRITES THESE COLUMNS. They are updated by a person
-- (or a CRM sync) after the lead has been handled. The Worker's INSERT is
-- unchanged and every new column is nullable or defaulted, so this migration
-- is safe to apply before or after the deploy that ships the code.
--
-- STATUS. NOT YET APPLIED to Neon project long-firefly-62771888. Apply with
-- explicit approval, after a snapshot, to each branch that holds leads.
--
-- Rollback: every statement is additive. To undo, drop the view and the
-- columns (data in them is lost):
--   DROP VIEW IF EXISTS lead_offline_conversions;
--   ALTER TABLE leads DROP COLUMN IF EXISTS lead_status, ... ;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_status        TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_reason      TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualified_at       TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_issued_at    TIMESTAMPTZ;
-- Annual or one-off contract value in CAD, as quoted. Optional.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_value_cad    NUMERIC(12, 2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS won_at             TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS won_value_cad      NUMERIC(12, 2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outcome_updated_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_lead_status_ck') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_lead_status_ck CHECK (
      lead_status IN (
        'new',          -- not yet reviewed
        'qualified',    -- a real commercial enquiry in the service area
        'unqualified',  -- residential, job seeker, vendor, out of area, spam
        'quote_issued', -- a written proposal was sent
        'won',          -- contract signed / work booked
        'lost'          -- quoted, not won
      )
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (lead_status, created_at DESC);

-- One row per (lead, stage reached), in the shape Google Ads' offline
-- conversion upload expects. Conversion names must match conversion actions
-- created in Google Ads (see docs/growth/tracking-spec.md). Only leads with a
-- Google click id can be uploaded; times are emitted in UTC with offset.
--
-- The Worker stores an ABSENT click id as '' (lead-fields.ts `safeStr`), not
-- NULL, so every id goes through NULLIF before it is tested or exported: a
-- bare COALESCE(gclid, gbraid, …) stops at gclid = '' and silently drops
-- leads that carry only a gbraid or wbraid (iOS app and web-to-app clicks).
CREATE OR REPLACE VIEW lead_offline_conversions AS
SELECT id AS lead_id, NULLIF(gclid, '') AS gclid, NULLIF(gbraid, '') AS gbraid, NULLIF(wbraid, '') AS wbraid,
       'Evergreen - Qualified lead' AS conversion_name,
       qualified_at AS conversion_time,
       NULL::NUMERIC AS conversion_value, 'CAD' AS currency
  FROM leads
 WHERE qualified_at IS NOT NULL AND COALESCE(NULLIF(gclid, ''), NULLIF(gbraid, ''), NULLIF(wbraid, '')) IS NOT NULL
UNION ALL
SELECT id, NULLIF(gclid, ''), NULLIF(gbraid, ''), NULLIF(wbraid, ''),
       'Evergreen - Quote issued', quote_issued_at, quote_value_cad, 'CAD'
  FROM leads
 WHERE quote_issued_at IS NOT NULL AND COALESCE(NULLIF(gclid, ''), NULLIF(gbraid, ''), NULLIF(wbraid, '')) IS NOT NULL
UNION ALL
SELECT id, NULLIF(gclid, ''), NULLIF(gbraid, ''), NULLIF(wbraid, ''),
       'Evergreen - Customer won', won_at, won_value_cad, 'CAD'
  FROM leads
 WHERE won_at IS NOT NULL AND COALESCE(NULLIF(gclid, ''), NULLIF(gbraid, ''), NULLIF(wbraid, '')) IS NOT NULL;
