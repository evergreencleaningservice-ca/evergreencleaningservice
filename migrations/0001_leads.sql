-- Lead submissions from the PPC landing pages and, in time, the site's other
-- forms. One row per submission; nothing is updated after insert.
--
-- The attribution columns are the point of the table as much as the contact
-- details are: without gclid and the utm_* values, Google Ads cannot tell which
-- click produced which lead, which is the gap Section 4 of the overhaul
-- specification exists to close.
CREATE TABLE IF NOT EXISTS leads (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  form_id        TEXT NOT NULL,

  full_name      TEXT NOT NULL,
  work_email     TEXT NOT NULL,
  phone          TEXT NOT NULL,
  facility_size  TEXT,

  page_url       TEXT,
  referrer       TEXT,
  gclid          TEXT,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,

  ip_country     TEXT,
  user_agent     TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_gclid      ON leads (gclid) WHERE gclid <> '';
