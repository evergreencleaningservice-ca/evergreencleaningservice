-- Express marketing consent, captured on the quote forms.
--
-- WHY A COLUMN AND NOT A FLAG IN `message`. Canada's anti-spam law is the
-- reason this is worth storing properly. CASL requires express consent before
-- a commercial electronic message, and in a dispute the burden of proving it
-- sits with the sender. A boolean answers "did they agree"; it does not answer
-- "to what", which is the question that actually gets asked.
--
-- So `consent_text` stores the exact wording shown beside the box at the
-- moment it was ticked. Change the copy later and old rows still say what
-- their sender actually agreed to, rather than what the form says today.
--
-- NOT REQUIRED, AND UNTICKED BY DEFAULT. A pre-ticked box is not express
-- consent under CASL, and a required one is a hard gate on a paid click. The
-- enquiry itself is handled under PIPEDA's implied consent — someone asking
-- for a quote plainly expects a reply — so this box governs marketing only.
--
-- NOT NULL DEFAULT false is deliberate: the 20 rows already in this table
-- predate the checkbox and nobody ticked anything, so false is the truthful
-- value for them, not NULL.
--
-- Applied to Neon project long-firefly-62771888, database `evergreen`.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_text      TEXT;

-- The list the client can lawfully email.
CREATE INDEX IF NOT EXISTS leads_marketing_consent_idx
  ON leads (created_at DESC)
  WHERE marketing_consent;
