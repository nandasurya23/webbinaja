-- Lets the public order form record opening hours ("Jam Operasional") so it
-- flows into the admin Inbox and, once a customer is created, into
-- config.business.openingHours (consumed by JSON-LD SEO structured data
-- and rendered on the customer site). Nullable since older submissions
-- predate this field. See submitOrderAction in src/app/pesan/actions.ts.
alter table submissions add column opening_hours text;
