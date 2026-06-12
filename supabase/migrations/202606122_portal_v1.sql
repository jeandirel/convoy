-- GastyConvoy V1 portal schema: client, driver, admin.
-- Run after the initial admin workspace migration.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'client' check (role in ('client', 'driver', 'admin')),
  full_name text,
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name, phone, company)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer;

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  license_number text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  driver_id uuid references public.profiles(id) on delete set null,
  status text not null default 'request_received' check (status in ('request_received', 'quote_sent', 'quote_accepted', 'driver_assigned', 'in_progress', 'completed', 'invoice_sent', 'paid', 'cancelled')),
  service_type text not null default 'conduite',
  client_name text,
  client_email text,
  client_phone text,
  vehicle text,
  pickup_address text not null,
  delivery_address text not null,
  scheduled_date date,
  amount numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete set null,
  reference text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'cancelled')),
  amount numeric(12,2),
  external_url text,
  signature_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'cancelled')),
  external_url text,
  signature_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete set null,
  reference text,
  status text not null default 'sent' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  amount numeric(12,2),
  payment_url text,
  external_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete set null,
  amount numeric(12,2),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text,
  external_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  mission_id uuid references public.missions(id) on delete cascade,
  type text not null default 'document',
  title text not null,
  url text not null,
  signed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mission_photos (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  driver_id uuid references public.profiles(id) on delete set null,
  type text not null default 'delivery' check (type in ('before', 'after', 'delivery')),
  url text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  section text primary key,
  title text,
  body text,
  media_url text,
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public) values
  ('client-documents', 'client-documents', true),
  ('mission-photos', 'mission-photos', true),
  ('generated-documents', 'generated-documents', true),
  ('site-media', 'site-media', true)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
-- Updated-at triggers.
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_missions_updated_at on public.missions;
create trigger set_missions_updated_at before update on public.missions for each row execute function public.set_updated_at();
drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();
drop trigger if exists set_contracts_updated_at on public.contracts;
create trigger set_contracts_updated_at before update on public.contracts for each row execute function public.set_updated_at();
drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at before update on public.testimonials for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.missions enable row level security;
alter table public.quotes enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.mission_photos enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_content enable row level security;

-- Idempotent policies.
drop policy if exists "profiles read own admin" on public.profiles;
create policy "profiles read own admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid() or public.is_admin());
drop policy if exists "profiles update own admin" on public.profiles;
create policy "profiles update own admin" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "drivers admin read" on public.drivers;
create policy "drivers admin read" on public.drivers for all to authenticated using (public.is_admin() or profile_id = auth.uid()) with check (public.is_admin() or profile_id = auth.uid());

drop policy if exists "missions scoped" on public.missions;
create policy "missions scoped" on public.missions for select to authenticated using (public.is_admin() or client_id = auth.uid() or driver_id = auth.uid());
drop policy if exists "missions create client admin" on public.missions;
create policy "missions create client admin" on public.missions for insert to authenticated with check (public.is_admin() or client_id = auth.uid());
drop policy if exists "missions update scoped" on public.missions;
create policy "missions update scoped" on public.missions for update to authenticated using (public.is_admin() or driver_id = auth.uid() or client_id = auth.uid()) with check (public.is_admin() or driver_id = auth.uid() or client_id = auth.uid());
drop policy if exists "missions delete admin" on public.missions;
create policy "missions delete admin" on public.missions for delete to authenticated using (public.is_admin());

-- Client-owned commercial records.
drop policy if exists "quotes scoped" on public.quotes;
create policy "quotes scoped" on public.quotes for all to authenticated using (public.is_admin() or client_id = auth.uid()) with check (public.is_admin() or client_id = auth.uid());
drop policy if exists "contracts scoped" on public.contracts;
create policy "contracts scoped" on public.contracts for all to authenticated using (public.is_admin() or client_id = auth.uid()) with check (public.is_admin() or client_id = auth.uid());
drop policy if exists "invoices scoped" on public.invoices;
create policy "invoices scoped" on public.invoices for all to authenticated using (public.is_admin() or client_id = auth.uid()) with check (public.is_admin() or client_id = auth.uid());
drop policy if exists "payments scoped" on public.payments;
create policy "payments scoped" on public.payments for all to authenticated using (public.is_admin() or client_id = auth.uid()) with check (public.is_admin() or client_id = auth.uid());

drop policy if exists "documents scoped" on public.documents;
create policy "documents scoped" on public.documents for all to authenticated using (public.is_admin() or owner_id = auth.uid()) with check (public.is_admin() or owner_id = auth.uid());
drop policy if exists "mission photos scoped" on public.mission_photos;
create policy "mission photos scoped" on public.mission_photos for all to authenticated using (public.is_admin() or driver_id = auth.uid() or exists (select 1 from public.missions m where m.id = mission_id and (m.client_id = auth.uid() or m.driver_id = auth.uid()))) with check (public.is_admin() or driver_id = auth.uid());

drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials for select to anon, authenticated using (published = true or public.is_admin());
drop policy if exists "testimonials admin write" on public.testimonials;
create policy "testimonials admin write" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "site content public read" on public.site_content;
create policy "site content public read" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "site content admin write" on public.site_content;
create policy "site content admin write" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Public storage read and authenticated upload paths.
drop policy if exists "public read storage" on storage.objects;
create policy "public read storage" on storage.objects for select to anon, authenticated using (bucket_id in ('client-documents', 'mission-photos', 'generated-documents', 'site-media'));
drop policy if exists "authenticated upload portal storage" on storage.objects;
create policy "authenticated upload portal storage" on storage.objects for insert to authenticated with check (bucket_id in ('client-documents', 'mission-photos', 'generated-documents', 'site-media'));
drop policy if exists "authenticated update portal storage" on storage.objects;
create policy "authenticated update portal storage" on storage.objects for update to authenticated using (bucket_id in ('client-documents', 'mission-photos', 'generated-documents', 'site-media')) with check (bucket_id in ('client-documents', 'mission-photos', 'generated-documents', 'site-media'));

-- Promote the known owner account to admin if it exists. No password is stored here.
insert into public.profiles (id, email, full_name, role)
select id, email, coalesce(raw_user_meta_data->>'full_name', email), 'admin'
from auth.users
where lower(email) = lower('franck-mambi@hotmail.fr')
on conflict (id) do update set role = 'admin', email = excluded.email;
