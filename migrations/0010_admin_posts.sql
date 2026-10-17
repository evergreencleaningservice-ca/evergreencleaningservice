-- The admin's blog posts, and jobs that need no post.
--
-- WHY. /admin/blog/create-blog/ writes posts the way UiD by Rana does for the
-- wrap shops (10xid-com/10xid-id-preview, prototypes/control-room-rana): the
-- job is filled in once, and from it the stage writes the website post and a
-- post for each social platform. A post published there is live at once. The
-- Worker serves it from this table at /<slug>/ and lists it on /insights/,
-- the sitemap and the RSS feed, with no rebuild and no deploy.
--
-- NOT THE `posts` TABLE. `posts` (0008) mirrors the Markdown in the repo, and
-- its sync deletes any slug the repo does not have, so a post written here
-- would be removed within six hours. The repo's posts stay the master copy of
-- themselves; these are the master copy of themselves. A slug the build
-- already serves can never be published here (the Worker checks the assets
-- first), so the two never collide on the site.
--
-- `draft` is the editor's whole document (the job, edited fields, blocks,
-- social links, thumbnail), kept as the page sent it. The columns beside it
-- are what the site reads, written on publish from that document, so a draft
-- being edited never changes the live post until it is published again.
--
-- `version` is bumped on every save. A save that names an older version is
-- refused with the newer copy, so two devices editing the same post cannot
-- silently overwrite each other.
--
-- STATUS. NOT YET APPLIED. Apply after 0009 (the Jobs page reads its
-- lead_status), after a snapshot, to `staging` (br-lucky-flower-avmh5qid)
-- first and then `main` (br-small-union-av5ypk4e).
--
-- Rollback (posts written here are lost):
--   DROP TABLE IF EXISTS admin_posts;
--   ALTER TABLE leads DROP COLUMN IF EXISTS post_skipped_at;

CREATE TABLE IF NOT EXISTS admin_posts (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Who saved it last: the Cloudflare Access address.
  updated_by    TEXT,
  version       INTEGER NOT NULL DEFAULT 1,
  -- 'draft' until published; 'draft' again once taken off the site.
  status        TEXT NOT NULL DEFAULT 'draft',
  -- The job this post is about, when it was started from /admin/jobs/.
  lead_id       BIGINT REFERENCES leads (id) ON DELETE SET NULL,
  draft         JSONB NOT NULL,

  -- What the site serves. Set on publish.
  slug          TEXT,
  title         TEXT,
  excerpt       TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  image         TEXT,
  image_alt     TEXT,
  html          TEXT,
  published_at  TIMESTAMPTZ,

  CONSTRAINT admin_posts_status_ck CHECK (status IN ('draft', 'published')),
  CONSTRAINT admin_posts_slug_ck CHECK (slug IS NULL OR slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  CONSTRAINT admin_posts_live_ck CHECK (
    status <> 'published' OR (slug IS NOT NULL AND title IS NOT NULL AND html IS NOT NULL AND published_at IS NOT NULL)
  )
);

-- One live post per address.
CREATE UNIQUE INDEX IF NOT EXISTS admin_posts_live_slug_idx
  ON admin_posts (slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS admin_posts_published_idx
  ON admin_posts (published_at DESC) WHERE status = 'published';
-- One post per job: "Start post" inserts with ON CONFLICT on this index, so
-- two clicks at once cannot make two posts.
CREATE UNIQUE INDEX IF NOT EXISTS admin_posts_lead_idx
  ON admin_posts (lead_id) WHERE lead_id IS NOT NULL;

-- A won job that should not get a post ("No post needed" on /admin/jobs/).
-- Cleared again with "Undo".
ALTER TABLE leads ADD COLUMN IF NOT EXISTS post_skipped_at TIMESTAMPTZ;
