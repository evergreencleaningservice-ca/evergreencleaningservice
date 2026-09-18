-- /lp/commercial-cleaning-quote/ asks two qualifying questions rather than one:
-- square footage, which `facility_size` already held, and the kind of building.
-- Office, clinic, warehouse and retail are cleaned by different crews on
-- different schedules, so it is what decides who answers the lead — not a
-- detail to fold into a free-text field.
--
-- Applied to Neon project long-firefly-62771888, database `evergreen`.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS facility_type TEXT;
