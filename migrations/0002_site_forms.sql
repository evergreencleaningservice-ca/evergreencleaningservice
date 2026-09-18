-- The site's own forms join the PPC form on this table, and they ask for more
-- than it does. Without these columns a quote request would store a name, an
-- email and a phone number and silently drop the business, the address of the
-- site to be cleaned, the services ticked and whatever the visitor actually
-- wrote — which is most of what makes a quote request answerable.
--
-- Nullable throughout: the PPC form fills none of them, and a lead with a
-- missing business name is still a lead.
--
-- Applied to Neon project long-firefly-62771888, database `evergreen`.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address       TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS services      TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message       TEXT;
