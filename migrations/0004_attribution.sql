-- Phase 3 — first-touch and latest-touch attribution.
--
-- The table already had gclid, utm_source, utm_medium, utm_campaign and
-- referrer. Those keep their meaning: the click that produced the enquiry.
-- What they could not express is (a) the rest of the identifiers Google and
-- Microsoft now send, (b) where the visitor landed as opposed to where they
-- submitted, and (c) the first touch, which is a different question from the
-- last one and the only one that says what introduced this customer.
--
-- All nullable, all additive. The existing INSERT keeps working against this
-- schema, and this schema keeps working against the existing rows.
--
-- Applied to Neon project long-firefly-62771888, database `evergreen`.

-- --- latest touch: the click that produced this enquiry --------------------
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gbraid        TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wbraid        TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS msclkid       TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gad_source    TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gclsrc        TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term      TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content   TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_id        TEXT;

-- Where the visitor arrived, which is not where they submitted. page_url is
-- the form's page; this is the entry point the ad paid for.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS touch_at      TIMESTAMPTZ;

-- --- first touch: what introduced this customer ----------------------------
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_gclid         TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_msclkid       TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_utm_source    TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_utm_medium    TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_utm_campaign  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_landing_page  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_referrer      TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_touch_at      TIMESTAMPTZ;

-- The two questions campaigns are actually judged on.
CREATE INDEX IF NOT EXISTS leads_gclid_idx            ON leads (gclid)            WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_first_utm_source_idx ON leads (first_utm_source) WHERE first_utm_source IS NOT NULL;
