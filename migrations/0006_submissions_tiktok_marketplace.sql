-- Lets the public order form record TikTok and marketplace (Shopee/Tokopedia/
-- etc.) links alongside the existing instagram/facebook fields, so they flow
-- into the admin Inbox and the eventual customer site. Nullable since older
-- submissions predate these fields. See submitOrderAction in
-- src/app/pesan/actions.ts.
alter table submissions add column tiktok text;
alter table submissions add column marketplace text;
