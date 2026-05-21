-- One-time import script from Airtable-style CSV exported columns.
-- Assumes a temp table loaded with the exact Airtable header names.

create temp table if not exists tmp_airtable_coupon_leads (
  "Coupon Code" text,
  "Name" text,
  "Email" text,
  "Phone" text,
  "Coupon Type" text,
  "Brand" text,
  "Source" text,
  "Campaign" text,
  "Privacy Consent" text,
  "Marketing Consent" text,
  "Created At" text,
  "Expires At" text,
  "Status" text,
  "Notes" text,
  "QR Url" text,
  "QR Content" text,
  "Usage Limit" text,
  "Redeemed At" text,
  "Redeemed By" text,
  "Redeem Attempts" text,
  "Last Redeem Attempt At" text,
  "Promo Days" text,
  "Promo Hours" text,
  "Redeem Token" text,
  "Redeem URL" text,
  "QR Image URL" text,
  "Redemption Mode" text
);

-- In Supabase SQL editor:
-- 1) use Table Editor import OR insert rows manually in tmp table.
-- 2) run the statement below.

insert into public.coupon_leads (
  coupon_code,
  name,
  email,
  phone,
  coupon_type,
  brand,
  source,
  campaign,
  privacy_consent,
  marketing_consent,
  created_at,
  expires_at,
  status,
  notes,
  qr_url,
  qr_content,
  usage_limit,
  redeemed_at_text,
  redeemed_by,
  redeem_attempts,
  last_redeem_attempt_at,
  promo_days,
  promo_hours,
  redeem_token,
  redeem_url,
  qr_image_url,
  redemption_mode
)
select
  nullif(trim("Coupon Code"), ''),
  nullif(trim("Name"), ''),
  nullif(lower(trim("Email")), ''),
  nullif(trim("Phone"), ''),
  coalesce(nullif(trim("Coupon Type"), ''), '2x1'),
  nullif(trim("Brand"), ''),
  nullif(trim("Source"), ''),
  nullif(trim("Campaign"), ''),
  lower(coalesce(trim("Privacy Consent"), '')) in ('checked', 'true', '1', 'yes', 'si'),
  lower(coalesce(trim("Marketing Consent"), '')) in ('checked', 'true', '1', 'yes', 'si'),
  case
    when nullif(trim("Created At"), '') is null then null
    else to_timestamp(trim("Created At"), 'MM/DD/YYYY HH12:MIam') at time zone 'Europe/Rome'
  end,
  case
    when nullif(trim("Expires At"), '') is null then null
    else to_timestamp(trim("Expires At"), 'MM/DD/YYYY HH12:MIam') at time zone 'Europe/Rome'
  end,
  coalesce(nullif(trim("Status"), ''), 'Active'),
  nullif(trim("Notes"), ''),
  nullif(trim("QR Url"), ''),
  nullif(trim("QR Content"), ''),
  coalesce(nullif(trim("Usage Limit"), '')::integer, 1),
  nullif(trim("Redeemed At"), ''),
  nullif(trim("Redeemed By"), ''),
  coalesce(nullif(trim("Redeem Attempts"), '')::integer, 0),
  case
    when nullif(trim("Last Redeem Attempt At"), '') is null then null
    else to_timestamp(trim("Last Redeem Attempt At"), 'MM/DD/YYYY HH12:MIam') at time zone 'Europe/Rome'
  end,
  nullif(trim("Promo Days"), ''),
  nullif(trim("Promo Hours"), ''),
  nullif(trim("Redeem Token"), ''),
  nullif(trim("Redeem URL"), ''),
  nullif(trim("QR Image URL"), ''),
  nullif(trim("Redemption Mode"), '')
from tmp_airtable_coupon_leads
where nullif(trim("Coupon Code"), '') is not null
on conflict (coupon_code) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  coupon_type = excluded.coupon_type,
  brand = excluded.brand,
  source = excluded.source,
  campaign = excluded.campaign,
  privacy_consent = excluded.privacy_consent,
  marketing_consent = excluded.marketing_consent,
  created_at = excluded.created_at,
  expires_at = excluded.expires_at,
  status = excluded.status,
  notes = excluded.notes,
  qr_url = excluded.qr_url,
  qr_content = excluded.qr_content,
  usage_limit = excluded.usage_limit,
  redeemed_at_text = excluded.redeemed_at_text,
  redeemed_by = excluded.redeemed_by,
  redeem_attempts = excluded.redeem_attempts,
  last_redeem_attempt_at = excluded.last_redeem_attempt_at,
  promo_days = excluded.promo_days,
  promo_hours = excluded.promo_hours,
  redeem_token = excluded.redeem_token,
  redeem_url = excluded.redeem_url,
  qr_image_url = excluded.qr_image_url,
  redemption_mode = excluded.redemption_mode;
