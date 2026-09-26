-- ==============================================================================
-- LEADFORGE AI - SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Com sistema de proteção e isenção de Proprietário (Owner) e Roles
-- ==============================================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- 2. Tabela de Perfis de Usuários (profiles)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null default 'Usuário LeadForge',
  email text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  account_type text not null default 'customer' check (account_type in ('customer', 'owner')),
  plan text not null default 'gratis' check (plan in ('gratis', 'pro', 'premium')),
  searches_remaining integer not null default 5,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Leads Salvos (leads)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  category text not null,
  city text not null,
  state text not null,
  country text not null default 'Brasil',
  phone text,
  whatsapp text,
  address text,
  website text,
  google_maps_url text,
  rating numeric(2,1) default 0.0,
  review_count integer default 0,
  has_website boolean not null default false,
  status text not null default 'Novo' check (status in ('Novo', 'Contatado', 'Em negociação', 'Cliente', 'Perdido')),
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Projetos de Sites (projects)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'Rascunho' check (status in ('Rascunho', 'Em edição', 'Publicado')),
  website_url text,
  site_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Assinaturas (subscriptions)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'gratis' check (plan in ('gratis', 'basic', 'pro', 'premium')),
  status text not null default 'active' check (status in ('active', 'pending', 'canceled', 'paused', 'past_due', 'expired')),
  payment_method text not null default 'pix' check (payment_method in ('pix', 'cartao', 'gratis')),
  mercado_pago_subscription_id text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Clientes Mercado Pago (customers)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  mercado_pago_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabela de Planos (plans)
create table if not exists public.plans (
  id text primary key, -- 'gratis', 'basic', 'pro'
  name text not null,
  price_monthly numeric(10,2) not null default 0.00,
  searches_limit integer not null default 5,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserção dos planos oficiais
insert into public.plans (id, name, price_monthly, searches_limit)
values 
  ('gratis', 'Grátis', 0.00, 5),
  ('basic', 'Basic', 19.90, 50),
  ('pro', 'Pro', 39.90, 200)
on conflict (id) do update set 
  price_monthly = excluded.price_monthly,
  searches_limit = excluded.searches_limit;

-- 8. Tabela de Pagamentos (payments)
create table if not exists public.payments (
  id text primary key, -- ID interno (pay_xxx)
  customer_id uuid not null references auth.users(id) on delete cascade,
  customer_name text,
  customer_email text,
  plan_id text not null references public.plans(id),
  amount numeric(10,2) not null,
  currency text not null default 'BRL',
  payment_method text not null check (payment_method in ('pix', 'cartao', 'gratis')),
  status text not null check (status in ('approved', 'pending', 'in_process', 'rejected', 'cancelled', 'refunded')),
  mercado_pago_id text not null,
  subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone
);

-- 9. Tabela de Eventos de Webhook (payment_events) - Idempotência
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  mercado_pago_id text not null,
  payload jsonb default '{}'::jsonb,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (mercado_pago_id, event_type)
);

-- 10. Tabela de Transações Financeiras (financial_transactions)
create table if not exists public.financial_transactions (
  id text primary key,
  payment_id text references public.payments(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  plan text not null,
  amount numeric(10,2) not null,
  net_amount numeric(10,2),
  fee numeric(10,2) default 0.00,
  payment_method text not null check (payment_method in ('pix', 'cartao')),
  status text not null,
  mercado_pago_id text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  renewal_date timestamp with time zone
);

-- 11. Tabela de Histórico de Buscas (searches)
create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country text not null default 'Brasil',
  state text not null,
  city text not null,
  category text not null,
  filter text not null default 'Todos' check (filter in ('Sem site', 'Com site', 'Todos')),
  results_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & OWNER SECURITY
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.searches enable row level security;

-- Helper security function to check if current user is admin/owner
create or replace function public.is_admin_or_owner()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- PROFILES POLICIES
create policy "Users can view their own profile or admins can view all"
  on public.profiles for select
  using (auth.uid() = user_id or public.is_admin_or_owner());

-- Normal users CANNOT change role, account_type, searches_remaining or plan!
-- Only admins or trigger functions can update those protected columns.
create policy "Users can update only their own basic profile info"
  on public.profiles for update
  using (auth.uid() = user_id or public.is_admin_or_owner())
  with check (
    -- If user is NOT admin/owner, they cannot change role or account_type
    case 
      when not public.is_admin_or_owner() then
        role = (select role from public.profiles where user_id = auth.uid()) and
        account_type = (select account_type from public.profiles where user_id = auth.uid()) and
        searches_remaining = (select searches_remaining from public.profiles where user_id = auth.uid()) and
        plan = (select plan from public.profiles where user_id = auth.uid())
      else true
    end
  );

create policy "Service or trigger can insert profiles"
  on public.profiles for insert
  with check (auth.uid() = user_id or public.is_admin_or_owner());

-- LEADS POLICIES
create policy "Users manage their own leads or admin/owner has full access"
  on public.leads for all
  using (auth.uid() = user_id or public.is_admin_or_owner())
  with check (auth.uid() = user_id or public.is_admin_or_owner());

-- PROJECTS POLICIES
create policy "Users manage their own projects or admin/owner has full access"
  on public.projects for all
  using (auth.uid() = user_id or public.is_admin_or_owner())
  with check (auth.uid() = user_id or public.is_admin_or_owner());

-- SUBSCRIPTIONS POLICIES
create policy "Users view their own subscriptions or admin/owner has full access"
  on public.subscriptions for all
  using (auth.uid() = user_id or public.is_admin_or_owner())
  with check (auth.uid() = user_id or public.is_admin_or_owner());

-- SEARCHES POLICIES
create policy "Users manage their own search logs or admin/owner has full access"
  on public.searches for all
  using (auth.uid() = user_id or public.is_admin_or_owner())
  with check (auth.uid() = user_id or public.is_admin_or_owner());

-- PAYMENTS POLICIES (Users see only their own payments; admins/owner see all)
alter table public.payments enable row level security;
create policy "Users view only their own payments, admins view all"
  on public.payments for select
  using (auth.uid() = customer_id or public.is_admin_or_owner());

create policy "Only backend service and admins can manage payments"
  on public.payments for all
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

-- FINANCIAL TRANSACTIONS POLICIES (Strictly admins and owners)
alter table public.financial_transactions enable row level security;
create policy "Only admins and owner can view financial transactions"
  on public.financial_transactions for select
  using (public.is_admin_or_owner());

-- PAYMENT EVENTS POLICIES (Webhook idempotency - admins only)
alter table public.payment_events enable row level security;
create policy "Only admins and service role can access payment events"
  on public.payment_events for all
  using (public.is_admin_or_owner())
  with check (public.is_admin_or_owner());

-- PLANS POLICIES (Public read)
alter table public.plans enable row level security;
create policy "Plans are publicly viewable"
  on public.plans for select
  using (true);

-- CUSTOMERS POLICIES
alter table public.customers enable row level security;
create policy "Users manage their own customer data"
  on public.customers for all
  using (auth.uid() = user_id or public.is_admin_or_owner())
  with check (auth.uid() = user_id or public.is_admin_or_owner());

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON AUTH.USERS REGISTRATION
-- All public signups are strictly customers with user role and 5 searches
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    user_id,
    email,
    name,
    role,
    account_type,
    plan,
    searches_remaining
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    -- Security rule: Public registration ALWAYS creates a normal customer
    'user',
    'customer',
    'gratis',
    5
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparado após criar usuário no Supabase Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
