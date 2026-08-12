-- Lets the public order form record which curated color palette the customer
-- picked (src/lib/themePalettes.ts) so it flows into the admin Inbox and
-- auto-fills CustomerForm's theme fields when a customer website is created
-- from a submission, without the admin needing to repick colors manually.
-- Nullable since older submissions predate this field — CustomerForm falls
-- back to its existing hardcoded defaults for those.
alter table submissions add column theme_palette_id text;
alter table submissions add column primary_color text;
alter table submissions add column secondary_color text;
alter table submissions add column accent_color text;
