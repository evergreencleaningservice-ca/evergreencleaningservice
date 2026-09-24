-- Comments and testimonials — the site's two non-lead forms.
--
-- WHY NOT THE `leads` TABLE. Everything that posts to /api/submit-lead is a
-- sales enquiry, and the whole analytics story of this site is that
-- `lead_form_submission` is its ONE conversion event. A blog comment is not a
-- conversion, a testimonial is not a conversion, and putting either in `leads`
-- would inflate the number the client's Google Ads spend is judged on. They
-- also carry different fields and, unlike a lead, they are published — so they
-- need a moderation state a lead has never needed.
--
-- WHAT THEY REPLACE. Both forms posted to `action="#"`: they validated in the
-- browser, reloaded the page, and the comment or testimonial was gone. No
-- error, no notice, nothing stored. HANDOFF §7.1 and _research/gaps.md have
-- carried that as an open gap since the port began. A captcha in front of a
-- form that discards the submission would have been protection theatre over a
-- hole, so the storage lands in the same commit as the captcha.
--
-- ONE TABLE, TWO KINDS. A comment and a testimonial are the same shape — a
-- person, a way to reach them, some prose, and a decision about whether it
-- gets published. `kind` separates them; the columns only one uses are
-- nullable.
--
-- STATUS DEFAULTS TO 'pending' AND THAT IS THE POINT. Nothing a stranger
-- types appears on the site because they typed it. Today the port renders
-- neither comment threads nor submitted testimonials, so nothing published
-- can leak while the moderation surface is still to be built — but the state
-- is in the schema from the first row rather than retrofitted onto a table
-- that already trusted its contents.
--
-- Applied to Neon project long-firefly-62771888, database `evergreen`.

CREATE TABLE IF NOT EXISTS submissions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 'comment' or 'review'.
  kind            TEXT NOT NULL,
  -- 'pending' until a person says otherwise.
  status          TEXT NOT NULL DEFAULT 'pending',

  -- Comments only: the post being commented on, as its public slug.
  post_slug       TEXT,

  author_name     TEXT NOT NULL,
  -- Collected, never published. Both forms say so on the page.
  author_email    TEXT NOT NULL,
  -- Comments only, and optional there.
  author_url      TEXT,
  -- Testimonials only: "Facilities Manager, Acme Dental".
  business_title  TEXT,

  body            TEXT NOT NULL,

  page_url        TEXT,
  ip_country      TEXT,
  user_agent      TEXT,

  CONSTRAINT submissions_kind_ck
    CHECK (kind IN ('comment', 'review')),
  CONSTRAINT submissions_status_ck
    CHECK (status IN ('pending', 'approved', 'spam', 'rejected'))
);

-- The moderation queue is the only read this table has until there is an
-- admin surface: oldest pending first, per kind.
CREATE INDEX IF NOT EXISTS submissions_pending_idx
  ON submissions (kind, created_at DESC)
  WHERE status = 'pending';

-- Reading a post's approved comments back, once there is somewhere to show
-- them.
CREATE INDEX IF NOT EXISTS submissions_post_slug_idx
  ON submissions (post_slug, created_at DESC)
  WHERE status = 'approved' AND post_slug IS NOT NULL;
