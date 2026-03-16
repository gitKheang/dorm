begin;

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

drop view if exists public.invoice_overview cascade;
drop view if exists public.daily_meal_counts cascade;
drop view if exists public.member_directory cascade;
drop view if exists public.room_occupancy cascade;

drop schema if exists app cascade;
create schema app;

drop table if exists public.audit_logs cascade;
drop table if exists public.payments cascade;
drop table if exists public.invoices cascade;
drop table if exists public.maintenance_tickets cascade;
drop table if exists public.meal_toggles cascade;
drop table if exists public.meal_plans cascade;
drop table if exists public.room_assignments cascade;
drop table if exists public.rooms cascade;
drop table if exists public.invitations cascade;
drop table if exists public.memberships cascade;
drop table if exists public.subscription_entitlements cascade;
drop table if exists public.dorms cascade;
drop table if exists public.profiles cascade;

create type app.user_role as enum ('landlord', 'tenant', 'chef');
create type app.membership_status as enum ('active', 'inactive');
create type app.room_status as enum ('available', 'occupied', 'maintenance');
create type app.billing_cycle as enum ('monthly');
create type app.invoice_status as enum ('draft', 'issued', 'partial', 'paid', 'overdue');
create type app.maintenance_status as enum ('open', 'in_progress', 'resolved');
create type app.maintenance_priority as enum ('low', 'medium', 'high');
create type app.payment_method as enum ('cash', 'bank_transfer', 'other');
create type app.plan_tier as enum ('starter', 'growth', 'pro');
create type app.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dorms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null default '',
  contact text not null default '',
  meal_rate numeric(10, 2) not null default 0,
  billing_cycle app.billing_cycle not null default 'monthly',
  breakfast_cutoff time not null default '20:00',
  lunch_cutoff time not null default '20:00',
  dinner_cutoff time not null default '20:00',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscription_entitlements (
  dorm_id uuid primary key references public.dorms (id) on delete cascade,
  plan_tier app.plan_tier not null default 'growth',
  room_limit integer not null default 50,
  meal_management_enabled boolean not null default true,
  reports_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  role app.user_role not null,
  status app.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dorm_id, role)
);

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_dorm_role_status_idx on public.memberships (dorm_id, role, status);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  email text not null,
  role app.user_role not null,
  invite_token uuid not null default gen_random_uuid(),
  status app.invitation_status not null default 'pending',
  invited_by uuid not null references public.profiles (id) on delete restrict,
  accepted_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invite_token)
);

create index invitations_dorm_id_idx on public.invitations (dorm_id);
create index invitations_email_idx on public.invitations (lower(email));

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  number text not null,
  floor integer not null default 1,
  capacity integer not null check (capacity > 0),
  monthly_rent numeric(10, 2) not null check (monthly_rent >= 0),
  status app.room_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dorm_id, number)
);

create table public.room_assignments (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  tenant_membership_id uuid not null references public.memberships (id) on delete cascade,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_assignments_valid_dates check (end_date is null or end_date > start_date),
  constraint room_assignments_no_membership_overlap
    exclude using gist (
      tenant_membership_id with =,
      daterange(start_date, coalesce(end_date, 'infinity'::date), '[)') with &&
    )
);

create index room_assignments_room_window_idx on public.room_assignments (room_id, start_date, end_date);
create index room_assignments_membership_window_idx on public.room_assignments (tenant_membership_id, start_date, end_date);
create unique index room_assignments_active_member_idx
  on public.room_assignments (tenant_membership_id)
  where end_date is null;

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  service_date date not null,
  breakfast text not null default '',
  lunch text not null default '',
  dinner text not null default '',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dorm_id, service_date)
);

create table public.meal_toggles (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  tenant_membership_id uuid not null references public.memberships (id) on delete cascade,
  service_date date not null,
  breakfast_enabled boolean not null default true,
  lunch_enabled boolean not null default true,
  dinner_enabled boolean not null default true,
  breakfast_locked boolean not null default false,
  lunch_locked boolean not null default false,
  dinner_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_membership_id, service_date)
);

create index meal_toggles_dorm_date_idx on public.meal_toggles (dorm_id, service_date);

create table public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  tenant_membership_id uuid not null references public.memberships (id) on delete cascade,
  room_assignment_id uuid references public.room_assignments (id) on delete set null,
  category text not null,
  description text not null,
  priority app.maintenance_priority not null default 'medium',
  status app.maintenance_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index maintenance_tickets_dorm_id_idx on public.maintenance_tickets (dorm_id, created_at desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  tenant_membership_id uuid not null references public.memberships (id) on delete cascade,
  billing_month date not null,
  due_date date not null,
  rent_amount numeric(10, 2) not null default 0,
  meal_amount numeric(10, 2) not null default 0,
  adjustments_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  amount_paid numeric(10, 2) not null default 0,
  status app.invoice_status not null default 'issued',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_membership_id, billing_month)
);

create index invoices_dorm_month_idx on public.invoices (dorm_id, billing_month desc);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  dorm_id uuid not null references public.dorms (id) on delete cascade,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  method app.payment_method not null default 'cash',
  notes text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index payments_invoice_id_idx on public.payments (invoice_id, paid_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  dorm_id uuid references public.dorms (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      first_name = case
        when public.profiles.first_name = '' then excluded.first_name
        else public.profiles.first_name
      end,
      last_name = case
        when public.profiles.last_name = '' then excluded.last_name
        else public.profiles.last_name
      end,
      updated_at = now();

  return new;
end;
$$;

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_dorm_member(p_dorm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where dorm_id = p_dorm_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.has_dorm_role(p_dorm_id uuid, p_roles app.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where dorm_id = p_dorm_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any (p_roles)
  );
$$;

create or replace function public.membership_belongs_to_current_user(p_membership_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where id = p_membership_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.user_shares_active_dorm_with_current_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships target
    join public.memberships me
      on me.dorm_id = target.dorm_id
    where target.user_id = p_user_id
      and target.status = 'active'
      and me.user_id = auth.uid()
      and me.status = 'active'
  );
$$;

create or replace function app.generate_slug(p_name text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  fallback_slug text;
  candidate text;
  counter integer := 0;
begin
  base_slug := regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  fallback_slug := coalesce(nullif(base_slug, ''), 'dorm');
  candidate := fallback_slug;

  while exists (select 1 from public.dorms where slug = candidate) loop
    counter := counter + 1;
    candidate := fallback_slug || '-' || counter::text;
  end loop;

  return candidate;
end;
$$;

create or replace function app.enforce_room_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_limit integer;
  current_count integer;
begin
  select room_limit
  into current_limit
  from public.subscription_entitlements
  where dorm_id = new.dorm_id;

  if current_limit is null then
    return new;
  end if;

  select count(*)
  into current_count
  from public.rooms
  where dorm_id = new.dorm_id;

  if current_count >= current_limit then
    raise exception 'Room limit reached for this dormitory';
  end if;

  return new;
end;
$$;

create or replace function app.validate_room_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  room_record public.rooms%rowtype;
  membership_record public.memberships%rowtype;
  candidate_day date;
  occupancy_count integer;
  row_id uuid := coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
begin
  select *
  into room_record
  from public.rooms
  where id = new.room_id;

  if not found then
    raise exception 'Room not found';
  end if;

  select *
  into membership_record
  from public.memberships
  where id = new.tenant_membership_id;

  if not found then
    raise exception 'Membership not found';
  end if;

  if room_record.dorm_id <> new.dorm_id then
    raise exception 'Selected room does not belong to this dorm';
  end if;

  if membership_record.dorm_id <> new.dorm_id then
    raise exception 'Selected membership does not belong to this dorm';
  end if;

  if membership_record.role <> 'tenant' then
    raise exception 'Only tenant memberships can be assigned to rooms';
  end if;

  if membership_record.status <> 'active' then
    raise exception 'Only active tenant memberships can be assigned to rooms';
  end if;

  if room_record.status = 'maintenance' then
    raise exception 'Cannot assign a tenant to a room under maintenance';
  end if;

  for candidate_day in
    select date_value
    from (
      select new.start_date as date_value
      union
      select ra.start_date as date_value
      from public.room_assignments ra
      where ra.room_id = new.room_id
        and ra.id <> row_id
        and ra.start_date > new.start_date
        and ra.start_date < coalesce(new.end_date, 'infinity'::date)
        and (ra.end_date is null or ra.end_date > new.start_date)
    ) candidate_dates
    order by date_value
  loop
    select count(*)
    into occupancy_count
    from public.room_assignments ra
    where ra.room_id = new.room_id
      and ra.id <> row_id
      and ra.start_date <= candidate_day
      and (ra.end_date is null or ra.end_date > candidate_day);

    if occupancy_count >= room_record.capacity then
      raise exception 'Room % is already at capacity on %', room_record.number, candidate_day;
    end if;
  end loop;

  return new;
end;
$$;

create or replace function app.refresh_room_status(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  active_count integer;
  room_capacity integer;
  room_state app.room_status;
begin
  select count(*)
  into active_count
  from public.room_assignments
  where room_id = p_room_id
    and start_date <= current_date
    and (end_date is null or end_date > current_date);

  select capacity, status
  into room_capacity, room_state
  from public.rooms
  where id = p_room_id;

  if room_state = 'maintenance' then
    return;
  end if;

  update public.rooms
  set status = case
    when active_count >= room_capacity then 'occupied'
    when active_count = 0 then 'available'
    else 'occupied'
  end
  where id = p_room_id;
end;
$$;

create or replace function app.seed_meal_toggle_window(
  p_membership_id uuid,
  p_dorm_id uuid,
  p_start_date date,
  p_end_date date
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.meal_toggles (
    dorm_id,
    tenant_membership_id,
    service_date,
    breakfast_enabled,
    lunch_enabled,
    dinner_enabled
  )
  select
    p_dorm_id,
    p_membership_id,
    series::date,
    true,
    true,
    true
  from generate_series(p_start_date, p_end_date, interval '1 day') as series
  on conflict (tenant_membership_id, service_date) do nothing;
$$;

create or replace function app.after_room_assignment_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  start_seed date;
  end_seed date;
begin
  if tg_op <> 'DELETE' then
    start_seed := greatest(new.start_date, current_date);
    end_seed := least(coalesce(new.end_date - 1, current_date + 90), current_date + 90);

    if end_seed >= start_seed then
      perform app.seed_meal_toggle_window(
        new.tenant_membership_id,
        new.dorm_id,
        start_seed,
        end_seed
      );
    end if;
  end if;

  if tg_op = 'UPDATE' and old.room_id is distinct from new.room_id then
    perform app.refresh_room_status(old.room_id);
  end if;

  perform app.refresh_room_status(coalesce(new.room_id, old.room_id));
  return coalesce(new, old);
end;
$$;

create or replace function app.apply_meal_lock_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dorm_record public.dorms%rowtype;
  breakfast_cutoff_ts timestamptz;
  lunch_cutoff_ts timestamptz;
  dinner_cutoff_ts timestamptz;
begin
  select *
  into dorm_record
  from public.dorms
  where id = new.dorm_id;

  breakfast_cutoff_ts := ((new.service_date::timestamp - interval '1 day') + dorm_record.breakfast_cutoff);
  lunch_cutoff_ts := ((new.service_date::timestamp - interval '1 day') + dorm_record.lunch_cutoff);
  dinner_cutoff_ts := ((new.service_date::timestamp - interval '1 day') + dorm_record.dinner_cutoff);

  new.breakfast_locked := current_timestamp >= breakfast_cutoff_ts;
  new.lunch_locked := current_timestamp >= lunch_cutoff_ts;
  new.dinner_locked := current_timestamp >= dinner_cutoff_ts;

  if tg_op = 'UPDATE' then
    if old.breakfast_locked and new.breakfast_enabled <> old.breakfast_enabled then
      raise exception 'Breakfast toggle is locked for %', new.service_date;
    end if;

    if old.lunch_locked and new.lunch_enabled <> old.lunch_enabled then
      raise exception 'Lunch toggle is locked for %', new.service_date;
    end if;

    if old.dinner_locked and new.dinner_enabled <> old.dinner_enabled then
      raise exception 'Dinner toggle is locked for %', new.service_date;
    end if;
  end if;

  return new;
end;
$$;

create or replace function app.attach_current_room_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.room_assignment_id is not null then
    return new;
  end if;

  select ra.id
  into new.room_assignment_id
  from public.room_assignments ra
  where ra.dorm_id = new.dorm_id
    and ra.tenant_membership_id = new.tenant_membership_id
    and ra.start_date <= current_date
    and (ra.end_date is null or ra.end_date > current_date)
  order by ra.start_date desc, ra.created_at desc
  limit 1;

  return new;
end;
$$;

create or replace function app.sync_invoice_total()
returns trigger
language plpgsql
as $$
begin
  new.total_amount = coalesce(new.rent_amount, 0)
    + coalesce(new.meal_amount, 0)
    + coalesce(new.adjustments_amount, 0);
  return new;
end;
$$;

create or replace function app.resolve_invoice_status(
  p_due_date date,
  p_total_amount numeric,
  p_amount_paid numeric
)
returns app.invoice_status
language sql
stable
as $$
  select case
    when coalesce(p_amount_paid, 0) >= coalesce(p_total_amount, 0) and coalesce(p_total_amount, 0) > 0
      then 'paid'::app.invoice_status
    when coalesce(p_amount_paid, 0) > 0
      then 'partial'::app.invoice_status
    when p_due_date < current_date
      then 'overdue'::app.invoice_status
    else 'issued'::app.invoice_status
  end;
$$;

create or replace function public.create_dorm(
  p_name text,
  p_address text default '',
  p_contact text default '',
  p_billing_cycle app.billing_cycle default 'monthly',
  p_meal_rate numeric default 0,
  p_breakfast_cutoff time default '20:00',
  p_lunch_cutoff time default '20:00',
  p_dinner_cutoff time default '20:00'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_dorm_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.dorms (
    slug,
    name,
    address,
    contact,
    meal_rate,
    billing_cycle,
    breakfast_cutoff,
    lunch_cutoff,
    dinner_cutoff,
    created_by
  )
  values (
    app.generate_slug(p_name),
    p_name,
    p_address,
    p_contact,
    p_meal_rate,
    p_billing_cycle,
    p_breakfast_cutoff,
    p_lunch_cutoff,
    p_dinner_cutoff,
    auth.uid()
  )
  returning id into new_dorm_id;

  insert into public.subscription_entitlements (dorm_id)
  values (new_dorm_id);

  insert into public.memberships (user_id, dorm_id, role, status)
  values (auth.uid(), new_dorm_id, 'landlord', 'active')
  on conflict (user_id, dorm_id, role) do update
  set status = 'active',
      updated_at = now();

  insert into public.audit_logs (dorm_id, actor_user_id, action, entity_type, entity_id)
  values (new_dorm_id, auth.uid(), 'create', 'dorm', new_dorm_id);

  return new_dorm_id;
end;
$$;

create or replace function public.accept_invitation(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record public.invitations%rowtype;
  new_membership_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into invitation_record
  from public.invitations
  where invite_token = p_token
    and status = 'pending'
    and expires_at > now();

  if not found then
    raise exception 'Invitation not found or expired';
  end if;

  if lower(invitation_record.email) <> public.current_user_email() then
    raise exception 'Invitation email does not match the signed-in user';
  end if;

  insert into public.memberships (user_id, dorm_id, role, status)
  values (auth.uid(), invitation_record.dorm_id, invitation_record.role, 'active')
  on conflict (user_id, dorm_id, role)
  do update set status = 'active', updated_at = now()
  returning id into new_membership_id;

  update public.invitations
  set status = 'accepted',
      accepted_by = auth.uid(),
      updated_at = now()
  where id = invitation_record.id;

  insert into public.audit_logs (dorm_id, actor_user_id, action, entity_type, entity_id, payload)
  values (
    invitation_record.dorm_id,
    auth.uid(),
    'accept',
    'invitation',
    invitation_record.id,
    jsonb_build_object('role', invitation_record.role)
  );

  return new_membership_id;
end;
$$;

create or replace function public.generate_monthly_invoices(
  p_dorm_id uuid,
  p_billing_month date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  month_start date := date_trunc('month', p_billing_month)::date;
  month_end date := (date_trunc('month', p_billing_month) + interval '1 month - 1 day')::date;
  meal_rate_value numeric(10, 2);
  processed_count integer := 0;
  record_row record;
  total_meals integer;
begin
  if not public.has_dorm_role(p_dorm_id, array['landlord'::app.user_role]) then
    raise exception 'Only landlords can generate invoices';
  end if;

  select meal_rate
  into meal_rate_value
  from public.dorms
  where id = p_dorm_id;

  for record_row in
    select
      m.id as tenant_membership_id,
      coalesce(room_snapshot.monthly_rent, 0)::numeric(10, 2) as monthly_rent
    from public.memberships m
    left join lateral (
      select r.monthly_rent
      from public.room_assignments ra
      join public.rooms r on r.id = ra.room_id
      where ra.tenant_membership_id = m.id
        and ra.dorm_id = p_dorm_id
        and ra.start_date <= month_end
        and (ra.end_date is null or ra.end_date > month_start)
      order by ra.start_date desc, ra.created_at desc
      limit 1
    ) room_snapshot on true
    where m.dorm_id = p_dorm_id
      and m.role = 'tenant'
      and m.status = 'active'
    order by m.created_at
  loop
    select
      sum(
        (case when breakfast_enabled then 1 else 0 end)
        + (case when lunch_enabled then 1 else 0 end)
        + (case when dinner_enabled then 1 else 0 end)
      )::integer
    into total_meals
    from public.meal_toggles
    where dorm_id = p_dorm_id
      and tenant_membership_id = record_row.tenant_membership_id
      and service_date between month_start and month_end;

    insert into public.invoices (
      dorm_id,
      tenant_membership_id,
      billing_month,
      due_date,
      rent_amount,
      meal_amount,
      adjustments_amount,
      amount_paid,
      status
    )
    values (
      p_dorm_id,
      record_row.tenant_membership_id,
      month_start,
      month_end,
      record_row.monthly_rent,
      coalesce(total_meals, 0) * coalesce(meal_rate_value, 0),
      0,
      0,
      'issued'
    )
    on conflict (tenant_membership_id, billing_month)
    do update set
      rent_amount = excluded.rent_amount,
      meal_amount = excluded.meal_amount,
      due_date = excluded.due_date,
      updated_at = now(),
      status = app.resolve_invoice_status(excluded.due_date, excluded.total_amount, public.invoices.amount_paid);

    processed_count := processed_count + 1;
  end loop;

  insert into public.audit_logs (dorm_id, actor_user_id, action, entity_type, payload)
  values (
    p_dorm_id,
    auth.uid(),
    'generate',
    'invoice_batch',
    jsonb_build_object('billing_month', month_start, 'processed_count', processed_count)
  );

  return processed_count;
end;
$$;

create or replace function public.recalculate_meal_counts(
  p_dorm_id uuid,
  p_target_date date
)
returns table (
  breakfast_count integer,
  lunch_count integer,
  dinner_count integer,
  total_count integer
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(sum(case when breakfast_enabled then 1 else 0 end), 0)::integer as breakfast_count,
    coalesce(sum(case when lunch_enabled then 1 else 0 end), 0)::integer as lunch_count,
    coalesce(sum(case when dinner_enabled then 1 else 0 end), 0)::integer as dinner_count,
    coalesce(sum(
      (case when breakfast_enabled then 1 else 0 end)
      + (case when lunch_enabled then 1 else 0 end)
      + (case when dinner_enabled then 1 else 0 end)
    ), 0)::integer as total_count
  from public.meal_toggles
  where dorm_id = p_dorm_id
    and service_date = p_target_date;
$$;

create or replace function public.lock_meal_toggles(
  p_dorm_id uuid,
  p_target_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if not public.has_dorm_role(p_dorm_id, array['landlord'::app.user_role, 'chef'::app.user_role]) then
    raise exception 'Not allowed to lock meal toggles';
  end if;

  update public.meal_toggles
  set updated_at = now()
  where dorm_id = p_dorm_id
    and service_date = p_target_date;

  get diagnostics updated_count = row_count;

  return updated_count;
end;
$$;

create or replace function public.record_manual_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_method app.payment_method default 'cash',
  p_paid_at timestamptz default now(),
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_record public.invoices%rowtype;
  payment_id uuid;
  next_amount_paid numeric(10, 2);
begin
  if coalesce(p_amount, 0) <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select *
  into invoice_record
  from public.invoices
  where id = p_invoice_id;

  if not found then
    raise exception 'Invoice not found';
  end if;

  if not public.has_dorm_role(invoice_record.dorm_id, array['landlord'::app.user_role]) then
    raise exception 'Only landlords can record payments';
  end if;

  next_amount_paid := invoice_record.amount_paid + p_amount;

  if next_amount_paid > invoice_record.total_amount then
    raise exception 'Payment exceeds the outstanding balance';
  end if;

  insert into public.payments (
    invoice_id,
    dorm_id,
    recorded_by,
    amount,
    method,
    notes,
    paid_at
  )
  values (
    invoice_record.id,
    invoice_record.dorm_id,
    auth.uid(),
    p_amount,
    p_method,
    p_notes,
    p_paid_at
  )
  returning id into payment_id;

  update public.invoices
  set amount_paid = next_amount_paid,
      paid_at = case when next_amount_paid >= total_amount then p_paid_at else paid_at end,
      status = app.resolve_invoice_status(due_date, total_amount, next_amount_paid),
      updated_at = now()
  where id = invoice_record.id;

  insert into public.audit_logs (dorm_id, actor_user_id, action, entity_type, entity_id, payload)
  values (
    invoice_record.dorm_id,
    auth.uid(),
    'record',
    'payment',
    payment_id,
    jsonb_build_object('invoice_id', invoice_record.id, 'amount', p_amount)
  );

  return payment_id;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure app.sync_profile_from_auth();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure app.sync_profile_from_auth();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure app.touch_updated_at();

drop trigger if exists dorms_touch_updated_at on public.dorms;
create trigger dorms_touch_updated_at
  before update on public.dorms
  for each row execute procedure app.touch_updated_at();

drop trigger if exists entitlements_touch_updated_at on public.subscription_entitlements;
create trigger entitlements_touch_updated_at
  before update on public.subscription_entitlements
  for each row execute procedure app.touch_updated_at();

drop trigger if exists memberships_touch_updated_at on public.memberships;
create trigger memberships_touch_updated_at
  before update on public.memberships
  for each row execute procedure app.touch_updated_at();

drop trigger if exists invitations_touch_updated_at on public.invitations;
create trigger invitations_touch_updated_at
  before update on public.invitations
  for each row execute procedure app.touch_updated_at();

drop trigger if exists rooms_touch_updated_at on public.rooms;
create trigger rooms_touch_updated_at
  before update on public.rooms
  for each row execute procedure app.touch_updated_at();

drop trigger if exists rooms_enforce_room_limit on public.rooms;
create trigger rooms_enforce_room_limit
  before insert on public.rooms
  for each row execute procedure app.enforce_room_limit();

drop trigger if exists room_assignments_validate on public.room_assignments;
create trigger room_assignments_validate
  before insert or update on public.room_assignments
  for each row execute procedure app.validate_room_assignment();

drop trigger if exists room_assignments_touch_updated_at on public.room_assignments;
create trigger room_assignments_touch_updated_at
  before update on public.room_assignments
  for each row execute procedure app.touch_updated_at();

drop trigger if exists room_assignments_after_change on public.room_assignments;
create trigger room_assignments_after_change
  after insert or update or delete on public.room_assignments
  for each row execute procedure app.after_room_assignment_changed();

drop trigger if exists meal_plans_touch_updated_at on public.meal_plans;
create trigger meal_plans_touch_updated_at
  before update on public.meal_plans
  for each row execute procedure app.touch_updated_at();

drop trigger if exists meal_toggles_touch_updated_at on public.meal_toggles;
create trigger meal_toggles_touch_updated_at
  before update on public.meal_toggles
  for each row execute procedure app.touch_updated_at();

drop trigger if exists meal_toggles_apply_lock_state on public.meal_toggles;
create trigger meal_toggles_apply_lock_state
  before insert or update on public.meal_toggles
  for each row execute procedure app.apply_meal_lock_state();

drop trigger if exists maintenance_touch_updated_at on public.maintenance_tickets;
create trigger maintenance_touch_updated_at
  before update on public.maintenance_tickets
  for each row execute procedure app.touch_updated_at();

drop trigger if exists maintenance_attach_room_assignment on public.maintenance_tickets;
create trigger maintenance_attach_room_assignment
  before insert on public.maintenance_tickets
  for each row execute procedure app.attach_current_room_assignment();

drop trigger if exists invoices_touch_updated_at on public.invoices;
create trigger invoices_touch_updated_at
  before update on public.invoices
  for each row execute procedure app.touch_updated_at();

drop trigger if exists invoices_sync_total on public.invoices;
create trigger invoices_sync_total
  before insert or update on public.invoices
  for each row execute procedure app.sync_invoice_total();

insert into public.profiles (id, email, first_name, last_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', '')
from auth.users u
on conflict (id) do update
set email = excluded.email,
    first_name = case
      when public.profiles.first_name = '' then excluded.first_name
      else public.profiles.first_name
    end,
    last_name = case
      when public.profiles.last_name = '' then excluded.last_name
      else public.profiles.last_name
    end,
    updated_at = now();

create or replace view public.room_occupancy
with (security_invoker = true) as
select
  r.id as room_id,
  r.dorm_id,
  count(ra.id) filter (
    where ra.start_date <= current_date
      and (ra.end_date is null or ra.end_date > current_date)
  )::integer as active_tenants
from public.rooms r
left join public.room_assignments ra on ra.room_id = r.id
group by r.id, r.dorm_id;

create or replace view public.member_directory
with (security_invoker = true) as
select
  m.id as membership_id,
  m.dorm_id,
  m.role,
  m.status,
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  ra.id as assignment_id,
  ra.start_date,
  ra.end_date,
  r.id as room_id,
  r.number as room_number,
  r.floor as room_floor,
  r.monthly_rent
from public.memberships m
join public.profiles p on p.id = m.user_id
left join public.room_assignments ra
  on ra.tenant_membership_id = m.id
  and ra.start_date <= current_date
  and (ra.end_date is null or ra.end_date > current_date)
left join public.rooms r on r.id = ra.room_id;

create or replace view public.daily_meal_counts
with (security_invoker = true) as
select
  dorm_id,
  service_date,
  sum(case when breakfast_enabled then 1 else 0 end)::integer as breakfast_count,
  sum(case when lunch_enabled then 1 else 0 end)::integer as lunch_count,
  sum(case when dinner_enabled then 1 else 0 end)::integer as dinner_count,
  sum(
    (case when breakfast_enabled then 1 else 0 end)
    + (case when lunch_enabled then 1 else 0 end)
    + (case when dinner_enabled then 1 else 0 end)
  )::integer as total_count
from public.meal_toggles
group by dorm_id, service_date;

create or replace view public.invoice_overview
with (security_invoker = true) as
select
  i.id,
  i.dorm_id,
  i.tenant_membership_id,
  i.billing_month,
  i.due_date,
  i.rent_amount,
  i.meal_amount,
  i.adjustments_amount,
  i.total_amount,
  i.amount_paid,
  app.resolve_invoice_status(i.due_date, i.total_amount, i.amount_paid) as status,
  i.paid_at,
  i.created_at,
  i.updated_at,
  p.first_name,
  p.last_name,
  p.email
from public.invoices i
join public.memberships m on m.id = i.tenant_membership_id
join public.profiles p on p.id = m.user_id;

alter table public.profiles enable row level security;
alter table public.dorms enable row level security;
alter table public.subscription_entitlements enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.rooms enable row level security;
alter table public.room_assignments enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_toggles enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_same_dorm_members" on public.profiles
  for select using (public.user_shares_active_dorm_with_current_user(id));

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "dorms_select_by_membership" on public.dorms
  for select using (public.is_dorm_member(id));

create policy "dorms_update_by_landlord" on public.dorms
  for update using (public.has_dorm_role(id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(id, array['landlord'::app.user_role]));

create policy "entitlements_select_by_member" on public.subscription_entitlements
  for select using (public.is_dorm_member(dorm_id));

create policy "memberships_select_by_dorm_member" on public.memberships
  for select using (public.is_dorm_member(dorm_id));

create policy "memberships_update_by_landlord" on public.memberships
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "invitations_select_by_landlord_or_email" on public.invitations
  for select using (
    public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
    or lower(email) = public.current_user_email()
  );

create policy "invitations_insert_by_landlord" on public.invitations
  for insert with check (
    public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
    and invited_by = auth.uid()
  );

create policy "invitations_update_by_landlord" on public.invitations
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "rooms_select_by_member" on public.rooms
  for select using (public.is_dorm_member(dorm_id));

create policy "rooms_write_by_landlord" on public.rooms
  for insert with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "rooms_update_by_landlord" on public.rooms
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "rooms_delete_by_landlord" on public.rooms
  for delete using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "assignments_select_by_dorm_member" on public.room_assignments
  for select using (public.is_dorm_member(dorm_id));

create policy "assignments_write_by_landlord" on public.room_assignments
  for insert with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "assignments_update_by_landlord" on public.room_assignments
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "assignments_delete_by_landlord" on public.room_assignments
  for delete using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "meal_plans_select_by_member" on public.meal_plans
  for select using (public.is_dorm_member(dorm_id));

create policy "meal_plans_write_by_staff" on public.meal_plans
  for insert with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role, 'chef'::app.user_role]));

create policy "meal_plans_update_by_staff" on public.meal_plans
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role, 'chef'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role, 'chef'::app.user_role]));

create policy "meal_plans_delete_by_staff" on public.meal_plans
  for delete using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role, 'chef'::app.user_role]));

create policy "meal_toggles_select_by_owner_or_staff" on public.meal_toggles
  for select using (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role, 'chef'::app.user_role])
  );

create policy "meal_toggles_insert_by_owner_or_landlord" on public.meal_toggles
  for insert with check (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  );

create policy "meal_toggles_update_by_owner_or_landlord" on public.meal_toggles
  for update using (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  )
  with check (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  );

create policy "maintenance_select_by_owner_or_landlord" on public.maintenance_tickets
  for select using (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  );

create policy "maintenance_insert_by_owner_or_landlord" on public.maintenance_tickets
  for insert with check (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  );

create policy "maintenance_update_by_landlord" on public.maintenance_tickets
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "invoices_select_by_owner_or_landlord" on public.invoices
  for select using (
    public.membership_belongs_to_current_user(tenant_membership_id)
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  );

create policy "invoices_write_by_landlord" on public.invoices
  for insert with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "invoices_update_by_landlord" on public.invoices
  for update using (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]))
  with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "payments_select_by_owner_or_landlord" on public.payments
  for select using (
    public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
    or exists (
      select 1
      from public.invoices i
      where i.id = invoice_id
        and public.membership_belongs_to_current_user(i.tenant_membership_id)
    )
  );

create policy "payments_insert_by_landlord" on public.payments
  for insert with check (public.has_dorm_role(dorm_id, array['landlord'::app.user_role]));

create policy "audit_select_by_landlord" on public.audit_logs
  for select using (
    dorm_id is null
    or public.has_dorm_role(dorm_id, array['landlord'::app.user_role])
  );

grant usage on schema public to authenticated, anon;
grant usage on schema app to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated, anon;
grant execute on all functions in schema public to authenticated, anon;
grant execute on function public.user_shares_active_dorm_with_current_user(uuid) to authenticated, anon;
grant execute on function app.resolve_invoice_status(date, numeric, numeric) to authenticated, anon;
grant select on public.room_occupancy, public.member_directory, public.daily_meal_counts, public.invoice_overview to authenticated;

commit;
