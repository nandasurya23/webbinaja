-- Customers created via the admin panel in production (src/app/[token]/actions.ts
-- createCustomerAction). The original file-based system (src/customers/<slug>/config.ts)
-- only works from a developer machine with a writable filesystem — Vercel's
-- production filesystem is read-only, so admins couldn't create customers
-- there at all. This table is the new source of truth for customers created
-- from now on; the handful of existing demo sites (src/customers/*) stay as
-- files since they're template showcases linked from the homepage, not real
-- orders, and don't need to be editable from production.
create table customers (
  slug text primary key,
  config jsonb not null,
  custom_domain text unique,
  created_at timestamptz not null default now()
);

-- resolveCustomerByHost (src/lib/customers.ts) looks up by custom_domain on
-- every request for a non-subdomain hostname, so this needs an index despite
-- also being unique (the unique constraint above already implies a btree
-- index on custom_domain, but null values — customers with no custom domain —
-- aren't indexed under a plain unique index in a way queries rely on; this
-- partial index covers the actual lookup pattern: `where custom_domain = $1`).
create index customers_custom_domain_idx
  on customers (custom_domain)
  where custom_domain is not null;
