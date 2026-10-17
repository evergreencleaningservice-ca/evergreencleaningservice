-- Sign-in codes for the admin (/admin/sign-in/).
--
-- WHY. The admin was first put behind Cloudflare Access, which needs the
-- account's Zero Trust organisation, and its Free plan asks for a payment
-- card. The admin signs people in itself instead, the way Access's one-time
-- PIN does: an address on ADMIN_EMAILS asks for a code, the Worker emails a
-- six-digit code through Resend (the same key and sender as the lead
-- notifications), and the code, entered within ten minutes, gives a signed
-- session cookie for twelve hours. See src/lib/admin/session.ts.
--
-- One row per code sent. Only a keyed hash of the code is kept, never the
-- code. A code allows five tries and is used once. Rows are not needed after
-- they expire; the Worker deletes them a day later.
--
-- STATUS. APPLIED 2026-10-17 to Neon project long-firefly-62771888, database
-- `evergreen`, with 0009–0011 as one transaction: `staging`
-- (br-lucky-flower-avmh5qid) first, verified, then `main`
-- (br-small-union-av5ypk4e). The snapshot limit was reached, so the backup
-- taken first is the no-compute branch backup-main-before-admin-20261017
-- (br-shy-fog-avjvm29r), made from `main` before any of the three ran.
--
-- Rollback: DROP TABLE IF EXISTS admin_sign_in_codes;

CREATE TABLE IF NOT EXISTS admin_sign_in_codes (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  used_at     TIMESTAMPTZ,
  ip_country  TEXT
);

CREATE INDEX IF NOT EXISTS admin_sign_in_codes_email_idx
  ON admin_sign_in_codes (email, created_at DESC);
