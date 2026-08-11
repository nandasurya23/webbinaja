-- Lets an admin suspend a website (e.g. non-payment, dispute) without
-- deleting its data — a suspended site 404s publicly but stays fully
-- intact in the `customers` table, ready to reactivate. See
-- toggleCustomerSuspendedAction in src/app/[token]/actions.ts and
-- getCustomerFromDb in src/lib/db.ts (excludes suspended rows).
alter table customers add column suspended boolean not null default false;
