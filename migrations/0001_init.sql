-- Initial schema for the /pesan (public order form), /status (public
-- lookup), and /[token] (admin panel) features. Mirrors the shapes read
-- and written by src/lib/db.ts — keep this file and that file in sync.

create extension if not exists pgcrypto;

-- Public order submissions ---------------------------------------------

create table submissions (
  id uuid primary key,
  status text not null default 'pending'
    check (status in ('pending', 'processed')),
  business_name text not null,
  template text,
  tagline text,
  description text,
  whatsapp text not null,
  address text,
  maps_link text,
  instagram text,
  facebook text,
  logo_filename text,
  hero_filename text,
  ambiance_filename text,
  gallery jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  catalog jsonb not null default '[]'::jsonb,
  processed_slug text,
  work_status text not null default 'not_started'
    check (work_status in ('not_started', 'in_progress', 'done')),
  payment_status text not null default 'unchecked'
    check (payment_status in ('unchecked', 'confirmed', 'rejected')),
  queue_number integer unique,
  lookup_code text not null unique,
  created_at timestamptz not null default now()
);

-- Public status lookup (src/app/status/actions.ts) matches on both fields
-- together, so a composite index serves that query directly.
create index submissions_whatsapp_lookup_code_idx
  on submissions (whatsapp, lookup_code);

create index submissions_created_at_idx
  on submissions (created_at desc);

-- Assigns queue numbers atomically when payment is confirmed
-- (see updateSubmissionStatus in src/lib/db.ts).
create sequence queue_number_seq start 1;

-- Admin accounts ----------------------------------------------------------

create table admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'super_admin')),
  created_by uuid references admins(id),
  created_at timestamptz not null default now()
);

-- IP rate limiting (src/lib/db.ts: isRateLimited / recordRateLimitHit) -----

create table rate_limits (
  id bigserial primary key,
  bucket text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

-- Every rate-limit check filters by (bucket, ip, created_at > ...), so this
-- composite index covers it directly instead of falling back to a seq scan
-- once the table has any real volume.
create index rate_limits_bucket_ip_idx
  on rate_limits (bucket, ip, created_at);
