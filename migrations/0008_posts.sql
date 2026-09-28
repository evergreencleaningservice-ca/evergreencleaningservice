-- Blog posts, mirrored into the database.
--
-- THE REPO IS THE MASTER COPY. Posts are written and edited as Markdown in
-- src/content/blog/, and the site is built from those files exactly as before.
-- This table is a mirror of them, so the database holds the site's full
-- content alongside its form submissions (house standard: every migrated site
-- gets a database holding form submissions, gallery items and blog posts).
-- Nothing reads it to render a page. Editing a row here changes nothing on
-- the site, and the next sync puts the file's version back.
--
-- HOW IT IS KEPT IN STEP. Every build publishes /data/blog-posts.json
-- (src/pages/data/blog-posts.json.ts). The Worker's scheduled handler reads
-- that file from its own assets every six hours and, on BOTH branches, upserts
-- any post whose content_hash differs and deletes any slug no longer in the
-- repo. See src/lib/posts-sync.ts. The database credentials never leave the
-- Worker.
--
-- `image` and any image in `body_markdown` are the absolute URLs the site
-- serves (img-evergreencleaningservice…), not repo paths — scripts/images.mjs
-- rewrites the JSON with the rest of the build.
--
-- Applied to Neon project long-firefly-62771888, database `evergreen`:
--   branch `staging` (br-lucky-flower-avmh5qid) first, then branch `main`
--   (br-small-union-av5ypk4e), 2026-09-28. Snapshot of `main` beforehand:
--   snap-plain-frost-avyakpjp.

CREATE TABLE IF NOT EXISTS posts (
  -- The public slug: the post lives at https://www.evergreencleaningservice.ca/<slug>/
  slug            TEXT PRIMARY KEY,
  url             TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  pub_date        TIMESTAMPTZ NOT NULL,
  image           TEXT,
  image_alt       TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  body_markdown   TEXT NOT NULL,
  -- sha256 of the fields above, computed by the Worker from what it read. A
  -- row is rewritten only when this changes, so a sync with nothing new
  -- writes nothing.
  content_hash    TEXT NOT NULL,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_pub_date_idx ON posts (pub_date DESC);
