# Supabase Migration Notes (GotBun)

## 1) Apply schema
Run `supabase/001_coupon_leads_schema.sql` in Supabase SQL Editor.

## 2) Import CSV data
Recommended in dashboard:
1. Create/load temporary table `tmp_airtable_coupon_leads` with headers from `airtable.csv`.
2. Paste/import rows from CSV.
3. Run `supabase/002_coupon_leads_import_from_airtable.sql`.

## 3) Verify
Run `supabase/003_coupon_leads_verification.sql`.

## 4) n8n compatibility (next step)
- gotbun.json: replace Airtable create with Supabase insert on `coupon_leads`.
- gotbun-redeem.json: replace Airtable search/update with Supabase select+conditional update.
- Keep fields equivalent:
  - Coupon Code -> coupon_code
  - Redeem Token -> redeem_token
  - Status -> status
  - Redeemed At -> redeemed_at_text
  - Redeem Attempts -> redeem_attempts

## 5) Security baseline
- Enable RLS before production writes.
- Use service role key only in secure server-side contexts (n8n/edge functions), never in browser.
