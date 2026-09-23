# Separating the staging and production lead databases

**Status: recommendation only. Nothing has been changed.** No branch created,
no schema altered, no secret rotated, no row touched. This document exists so
the decision can be made before the DNS cutover, not during it.

---

## What exists today

| | |
| --- | --- |
| Neon project | `long-firefly-62771888`, named `evergreencleaningservice` |
| Owner | `brandingcentres.ca@gmail.com`, org `org-lively-mode-86729145` |
| Plan | **free_v3** |
| Postgres | 17, region `aws-us-east-1` |
| Branches | **one**, `main` — no staging/production separation exists |
| Databases | `postgres`, `evergreen` |
| Branch limit | 10 |
| History retention | **21,600 seconds — six hours** |
| Snapshots | none |
| `leads` table | 38 columns, **20 rows** |

Those 20 rows are all test data, counted by `page_url` on 21 Sep 2026:

| Origin | Rows | ids |
| --- | --- | --- |
| staging hostname | 12 | 2–20 |
| no `page_url` — direct API probe | 7 | 3–17 |
| `https://example.com/lp/...?gclid=VERIFY_GCLID` | 1 | 1 |

**Zero carry a production `page_url`.** The newest is **row 20**, written by
the Phase 9 staging check (`full_name` "ZZTEST", `business_name` "ZZ TEST —
Phase 9 staging check, not a real lead"); it has deliberately not been
deleted. The database has never received a real enquiry.

*(An earlier revision of this document said "11 staging, 8 probes" and
attributed the probes to `form_id = 'probe'`. That was wrong on both counts —
only three rows carry that `form_id`, and seven have no `page_url` at all.
The table above is counted from the live database.)*

One Worker reads it, through the `DATABASE_URL` secret. That Worker serves
staging today and will serve production after the cutover. **So unless
something changes, the first real customer enquiry will land in the same table
as the probe rows, reached by the same credential.**

## Why that matters

Three specific risks, in the order they are likely to bite:

1. **A staging test writes into production data.** After the cutover, every
   form submission made while checking the site is a real row among real
   leads. Filtering them out later means trusting `form_id` and `page_url`,
   which is a convention, not a constraint.
2. **A migration run against staging runs against production.** There is one
   connection string. Migration `0004` was applied to it by hand; the next one
   will be too, and on a free plan the only undo is a six-hour PITR window.
3. **A credential shared between environments cannot be rotated
   independently.** If the staging secret leaks, the production data is
   exposed by the same string.

None of this is urgent today, because there is no production data. It stops
being reversible the moment there is.

---

## The recommendation — simplest safe option

**Use a Neon branch for staging and keep `main` as production.**

| | |
| --- | --- |
| Cost | **none** — branching is included, the limit is 10 and one is in use |
| Effort | one branch, one secret, one delete |
| Reversible | yes, until the first real lead lands |

Steps, in order:

1. **Snapshot `main` first.** One `create_snapshot` call. This is the step
   that was skipped before migration `0004`, and on a six-hour retention
   window it is the only thing standing between a bad `ALTER` and a rebuild.
2. **Create a branch named `staging` from `main`.** It inherits the schema —
   all 38 columns, both indexes — and the 20 rows.
3. **Delete the 19 test rows from `main`.** `TRUNCATE leads` on the branch
   that will become production, so production starts empty. The rows survive
   on `staging` if anyone wants them.
4. **Point the preview Worker at the staging branch.** `wrangler secret put
   DATABASE_URL` for the preview environment, using the branch's connection
   string. `main`'s string stays on the production Worker.
5. **Verify from outside**: submit a test lead on staging, confirm the row
   appears on the `staging` branch and **not** on `main`.

### Why a branch rather than a second project

A separate Neon project would also work and is arguably cleaner — fully
independent quotas, independent billing, no chance of a fat-fingered branch
delete taking both. It is more to set up and more to keep in step, and on the
free plan two projects means two sets of limits to watch rather than one.

A branch keeps the schema in one place by construction: `staging` is created
*from* `main`, so it cannot silently drift the way two hand-migrated projects
can. That is the property worth having here, because schema drift between
environments is exactly what caused the "which database did 0004 go to?"
question in the first place.

**If the client ever wants staging and production genuinely isolated — different
billing, different access — a second project is the right answer and this
should be revisited.**

---

## Migration and rollback procedure, once separated

Every schema change, in this order, no exceptions:

1. **Snapshot `main`.** Record the snapshot id in the migration file's header,
   beside the "applied to" line that migrations `0002`–`0004` already carry.
2. **Apply to `staging` first.** Run the migration file verbatim.
3. **Deploy the preview Worker** and exercise the code path the migration
   exists for — a real form submission, not a `SELECT`.
4. **Apply to `main`.** Same file, unmodified.
5. **Read the schema back from `information_schema`** and confirm it matches
   what the file asked for. This is what caught nothing last time because it
   was done, and it is cheap.

**Rollback.** Additive, nullable migrations — which is all four so far — need
no rollback: the previous code ignores the new columns and the new code
tolerates nulls. For anything that is *not* additive:

- **Within six hours**: restore the branch to a point in time before the
  change. This is the free plan's whole window.
- **After six hours**: restore from the snapshot taken at step 1. This is why
  step 1 is not optional.
- **Never** hand-write a reverse migration against production without first
  proving it on a branch created from a snapshot.

---

## What needs Paolo's approval

1. **The plan.** Everything above fits inside **free_v3** at no cost. Worth
   knowing what the free plan does *not* give you:
   - **History retention is six hours.** Paid plans extend PITR to 7 days and
     up. Six hours is short enough that a migration applied on a Friday
     evening is unrecoverable by Saturday morning except from a snapshot.
   - **No project-level point-in-time beyond that window**, and no automated
     scheduled snapshots — `set_snapshot_schedule` exists but the retention
     that backs it does not stretch on free.
   - Branch limit **10 per organisation**, of which this project uses **one**
     (`main`, `br-small-union-av5ypk4e`) and the org's other project
     (`autumn-bar-26388127`, `10xid`) uses its own. Ample either way.
   - **Per-branch logical size limit 0.5 GiB** (`branch_logical_size_limit`
     512 MB). The `leads` branch is currently 31.1 MB.
   - The compute-hour allowance is **not exposed** by the project or
     organisation API and is therefore not stated here. What is visible is
     this project's usage in the current period (1 Sep – 1 Oct 2026):
     **1,189 s of compute time, 4,692 s active**, on a fixed 0.25 CU
     endpoint with `suspend_timeout_seconds: 0`. Read the current allowance
     off the Neon billing page before relying on headroom.

   *(Re-verified against the live project on 21 Sep 2026, per the Phase 9
   instruction to confirm the plan limits before anything is executed.
   Nothing was changed.)*

   **If the lead database is going to hold real customer enquiries — which it
   is — six hours of recovery is the thing I would raise.** A paid tier buys a
   longer window. Whether that is worth it is a business call, not a technical
   one, and it does not block the separation above.

2. **Whether to keep the 20 test rows at all.** The recommendation keeps them
   on `staging` and clears `main`. Deleting them outright is also defensible.
   Row 20 in particular is a Phase 9 check left in place pending a decision.

3. **Whether a second project is wanted instead of a branch**, per the
   trade-off above.

4. **When.** This should happen **before the DNS cutover** and after the
   current round of staging testing is finished — separating mid-test just
   moves the confusion.

---

## What this does not cover

- Backups of lead data for CRA or retention purposes. Neon's PITR is a
  recovery mechanism, not an archive, and nothing here exports rows anywhere.
- Who may read the lead table. Access is whoever holds the Neon account and
  whoever holds `DATABASE_URL`; there is no per-role separation.
- Deletion requests. There is no mechanism to find and remove one person's
  enquiry on request, which is worth having before the site collects real
  ones at volume.
