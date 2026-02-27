-- Supabase schema, RLS och policies för MrEspaano Hub
create extension if not exists pgcrypto;

create type public.project_category as enum ('app', 'game', 'site');
create type public.project_status as enum ('live', 'wip', 'archived');

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text not null,
  long_description text not null,
  category public.project_category not null,
  tags text[] not null default '{}',
  status public.project_status not null,
  links jsonb not null default '{}'::jsonb,
  visuals jsonb not null default '{}'::jsonb,
  tech_stack text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  display_name text not null,
  tagline text not null,
  bio text not null,
  hero_cta_primary text not null,
  hero_cta_secondary text not null,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.is_admin = true
  );
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.projects enable row level security;
alter table public.site_settings enable row level security;
alter table public.profiles enable row level security;

-- Public read
create policy "Public can read projects"
on public.projects
for select
using (true);

create policy "Public can read site settings"
on public.site_settings
for select
using (true);

-- Admin write
create policy "Admin can insert projects"
on public.projects
for insert
with check (public.is_admin(auth.uid()));

create policy "Admin can update projects"
on public.projects
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin can delete projects"
on public.projects
for delete
using (public.is_admin(auth.uid()));

create policy "Admin can insert site settings"
on public.site_settings
for insert
with check (public.is_admin(auth.uid()));

create policy "Admin can update site settings"
on public.site_settings
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin can delete site settings"
on public.site_settings
for delete
using (public.is_admin(auth.uid()));

-- Profiles policies
create policy "User can read own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "Admin can read all profiles"
on public.profiles
for select
using (public.is_admin(auth.uid()));

create policy "Admin can update profiles"
on public.profiles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Bucket setup
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', false)
on conflict (id) do update set public = excluded.public;

create policy "Public can read project media"
on storage.objects
for select
using (bucket_id = 'project-media');

create policy "Admin can upload project media"
on storage.objects
for insert
with check (
  bucket_id = 'project-media'
  and public.is_admin(auth.uid())
);

create policy "Admin can update project media"
on storage.objects
for update
using (
  bucket_id = 'project-media'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'project-media'
  and public.is_admin(auth.uid())
);

create policy "Admin can delete project media"
on storage.objects
for delete
using (
  bucket_id = 'project-media'
  and public.is_admin(auth.uid())
);

-- Default site settings row
insert into public.site_settings (
  id,
  display_name,
  tagline,
  bio,
  hero_cta_primary,
  hero_cta_secondary,
  social_links
)
values (
  true,
  'Erik Espaano',
  'Bygger appar, spel och hemsidor med premiumkänsla.',
  'En levande hubb där alla projekt samlas med fokus på design, animation och produktkvalitet.',
  'Utforska projekt',
  'Kontakta mig',
  '{"github": "https://github.com/", "linkedin": "https://linkedin.com/", "x": "https://x.com/", "email": "mailto:hej@example.com"}'::jsonb
)
on conflict (id) do nothing;
