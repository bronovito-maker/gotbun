-- Post-migration verification queries

select count(*) as total_rows from public.coupon_leads;

select
  status,
  count(*) as cnt
from public.coupon_leads
group by status
order by status;

select
  count(*) filter (where coupon_code is null or coupon_code = '') as missing_coupon_code,
  count(*) filter (where redeem_token is null or redeem_token = '') as missing_redeem_token,
  count(*) filter (where expires_at is null) as missing_expires_at
from public.coupon_leads;

select
  coupon_code,
  status,
  redeem_attempts,
  redeemed_at_text,
  redeem_token
from public.coupon_leads
order by inserted_at desc
limit 20;
