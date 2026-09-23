-- Lead submissions from the PPC landing pages and, in time, the site's other
-- forms. One row per submission; nothing is updated after insert.
--
-- Postgres, on Neon. It was SQLite for D1 until the Cloudflare account turned
-- out to be at its 10-database limit with every one of them a live client
-- database. Neon's serverless driver speaks HTTP rather than raw TCP, so a
-- Worker reaches it with no tunnel, no pooler and nothing of ours running.
--
-- The attribution columns are the point of the table as much as the contact
-- details are: without gclid and the utm_* values, Google Ads cannot tell which
-- click produced which lead, which is the gap Section 4 of the overhaul
-- specification exists to close.
--
-- Applied to project long-firefly-62771888, database `evergreen`.

CREATE TABLE IF NOT EXISTS leads (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
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
CREATE INDEX IF NOT EXISTS idx_leads_gclid ON leads (gclid)
  WHERE gclid IS NOT NULL AND gclid <> '';
