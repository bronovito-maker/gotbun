create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.categories (
  id text primary key,
  label text not null,
  icon text not null default '',
  position integer not null default 0,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pills (
  id text primary key,
  label text not null,
  color_class text not null default 'pill-neutral',
  icon text not null default '',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  description text not null default '',
  image_url text,
  category_id text not null references public.categories(id) on update cascade on delete restrict,
  pill_id text references public.pills(id) on update cascade on delete set null,
  is_popular boolean not null default false,
  is_available boolean not null default true,
  position integer not null default 0,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_menu_items_category_position on public.menu_items(category_id, position);
create index if not exists idx_menu_items_available on public.menu_items(is_available);
create index if not exists idx_menu_items_popular on public.menu_items(is_popular);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key text not null unique check (key in ('promo_2x1', 'promo_10')),
  is_active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_promotions_key on public.promotions(key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_pills_updated_at on public.pills;
create trigger trg_pills_updated_at before update on public.pills
for each row execute function public.set_updated_at();

drop trigger if exists trg_menu_items_updated_at on public.menu_items;
create trigger trg_menu_items_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_promotions_updated_at on public.promotions;
create trigger trg_promotions_updated_at before update on public.promotions
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.pills enable row level security;
alter table public.menu_items enable row level security;
alter table public.promotions enable row level security;

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select on public.categories
for select to anon, authenticated
using (true);

drop policy if exists pills_public_select on public.pills;
create policy pills_public_select on public.pills
for select to anon, authenticated
using (true);

drop policy if exists menu_items_public_select on public.menu_items;
create policy menu_items_public_select on public.menu_items
for select to anon, authenticated
using (true);

drop policy if exists promotions_public_select on public.promotions;
create policy promotions_public_select on public.promotions
for select to anon, authenticated
using (true);

drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert on public.categories
for insert to authenticated
with check (public.is_admin());

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update on public.categories
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete on public.categories
for delete to authenticated
using (public.is_admin());

drop policy if exists pills_admin_insert on public.pills;
create policy pills_admin_insert on public.pills
for insert to authenticated
with check (public.is_admin());

drop policy if exists pills_admin_update on public.pills;
create policy pills_admin_update on public.pills
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists pills_admin_delete on public.pills;
create policy pills_admin_delete on public.pills
for delete to authenticated
using (public.is_admin());

drop policy if exists menu_items_admin_insert on public.menu_items;
create policy menu_items_admin_insert on public.menu_items
for insert to authenticated
with check (public.is_admin());

drop policy if exists menu_items_admin_update on public.menu_items;
create policy menu_items_admin_update on public.menu_items
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists menu_items_admin_delete on public.menu_items;
create policy menu_items_admin_delete on public.menu_items
for delete to authenticated
using (public.is_admin());

drop policy if exists promotions_admin_insert on public.promotions;
create policy promotions_admin_insert on public.promotions
for insert to authenticated
with check (public.is_admin());

drop policy if exists promotions_admin_update on public.promotions;
create policy promotions_admin_update on public.promotions
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists promotions_admin_delete on public.promotions;
create policy promotions_admin_delete on public.promotions
for delete to authenticated
using (public.is_admin());
