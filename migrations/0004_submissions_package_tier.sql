-- Lets the public order form record which package the customer picked
-- (basic vs business_kit) so the WhatsApp confirmation message and the
-- admin Inbox can show it. Nullable since older submissions predate this
-- field. See submitOrderAction in src/app/pesan/actions.ts.
alter table submissions add column package_tier text;
