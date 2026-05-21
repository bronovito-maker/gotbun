-- GotBun Supabase schema for coupon leads (Airtable migration target)
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.coupon_leads (
  id uuid primary key default gen_random_uuid(),
  coupon_code text not null,
  name text,
  email text,
  phone text,
  coupon_type text not null default '2x1',
  brand text,
  source text,
  campaign text,
  privacy_consent boolean not null default false,
  marketing_consent boolean not null default false,
  created_at timestamptz,
  expires_at timestamptz,
  status text not null default 'Active',
  notes text,
  qr_url text,
  qr_content text,
  usage_limit integer not null default 1,
  redeemed_at_text text,
  redeemed_by text,
  redeem_attempts integer not null default 0,
  last_redeem_attempt_at timestamptz,
  promo_days text,
  promo_hours text,
  redeem_token text,
  redeem_url text,
  qr_image_url text,
  redemption_mode text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint coupon_leads_coupon_code_key unique (coupon_code),
  constraint coupon_leads_status_check check (
    status in ('Active', 'Email Sent', 'Redeemed', 'Expired', 'Invalid')
  ),
  constraint coupon_leads_usage_limit_check check (usage_limit >= 1),
  constraint coupon_leads_redeem_attempts_check check (redeem_attempts >= 0)
);

create index if not exists idx_coupon_leads_status on public.coupon_leads (status);
create index if not exists idx_coupon_leads_expires_at on public.coupon_leads (expires_at);
create index if not exists idx_coupon_leads_email on public.coupon_leads (email);
create index if not exists idx_coupon_leads_redeem_token on public.coupon_leads (redeem_token);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_coupon_leads_set_updated_at on public.coupon_leads;
create trigger trg_coupon_leads_set_updated_at
before update on public.coupon_leads
for each row execute function public.set_updated_at();
