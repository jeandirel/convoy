-- GastyConvoy professional workspace schema
-- Run this in Supabase SQL editor or with Supabase CLI migrations.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'particulier' check (type in ('particulier', 'professionnel')),
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reservation', 'devis', 'contrat', 'facture', 'document', 'mission')),
  status text not null default 'draft' check (status in ('draft', 'new', 'in_progress', 'sent', 'signed', 'paid', 'done', 'cancelled')),
  title text not null,
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  client_email text,
  client_phone text,
  vehicle text,
  pickup_address text,
  delivery_address text,
  scheduled_date date,
  amount numeric(12,2),
  document_url text,
  signature_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.record_tasks (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.business_records(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.record_documents (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.business_records(id) on delete cascade,
  type text not null default 'document',
  title text not null,
  url text not null,
  signed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  path text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_business_records_updated_at on public.business_records;
create trigger set_business_records_updated_at
before update on public.business_records
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.business_records enable row level security;
alter table public.record_tasks enable row level security;
alter table public.record_documents enable row level security;
alter table public.visitor_events enable row level security;

-- First version: authenticated Supabase users are admins.
-- Create the admin user in Supabase Auth, then connect from /admin.
create policy "authenticated manage clients" on public.clients
  for all to authenticated using (true) with check (true);

create policy "authenticated manage records" on public.business_records
  for all to authenticated using (true) with check (true);

create policy "authenticated manage tasks" on public.record_tasks
  for all to authenticated using (true) with check (true);

create policy "authenticated manage documents" on public.record_documents
  for all to authenticated using (true) with check (true);

create policy "public insert visitor events" on public.visitor_events
  for insert to anon, authenticated with check (true);

create policy "authenticated read visitor events" on public.visitor_events
  for select to authenticated using (true);