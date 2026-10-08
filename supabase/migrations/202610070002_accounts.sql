-- Run once after 202610060001_catalog.sql. No existing catalog data is changed.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
 name text not null check (char_length(trim(name)) between 1 and 100),
 interests text[] not null default '{}' check (cardinality(interests) <= 20),
 created_at timestamptz not null default now()
);
create table public.saved_opportunities (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 opportunity_id uuid not null references public.opportunities(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,opportunity_id)
);
create table public.saved_providers (
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 provider_id uuid not null references public.providers(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,provider_id)
);
create table public.experiences (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 title text not null default '' check (char_length(title)<=120),
 body text not null check (char_length(trim(body)) between 30 and 6000),
 field text not null default '' check (char_length(field)<=200),
 status text not null default 'pending' check(status in ('pending','published','rejected')),
 created_at timestamptz not null default now(),
 published_at timestamptz
);
create index experiences_owner on public.experiences(user_id,created_at desc);
alter table public.profiles enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.saved_providers enable row level security;
alter table public.experiences enable row level security;
revoke all on public.profiles,public.saved_opportunities,public.saved_providers,public.experiences from public,anon,authenticated;
grant select on public.profiles,public.saved_opportunities,public.saved_providers,public.experiences to authenticated;
grant insert(id,name,interests),update(name,interests) on public.profiles to authenticated;
grant insert(opportunity_id),delete on public.saved_opportunities to authenticated;
grant insert(provider_id),delete on public.saved_providers to authenticated;
grant insert(title,body,field) on public.experiences to authenticated;
create policy profiles_read_own on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy saved_opportunities_read_own on public.saved_opportunities for select to authenticated using(user_id=(select auth.uid()));
create policy saved_opportunities_insert_own on public.saved_opportunities for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.opportunities o where o.id=opportunity_id));
create policy saved_opportunities_delete_own on public.saved_opportunities for delete to authenticated using(user_id=(select auth.uid()));
create policy saved_providers_read_own on public.saved_providers for select to authenticated using(user_id=(select auth.uid()));
create policy saved_providers_insert_own on public.saved_providers for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.providers p where p.id=provider_id));
create policy saved_providers_delete_own on public.saved_providers for delete to authenticated using(user_id=(select auth.uid()));
create policy experiences_read_own on public.experiences for select to authenticated using(user_id=(select auth.uid()));
create policy experiences_insert_pending on public.experiences for insert to authenticated with check(user_id=(select auth.uid()) and status='pending' and published_at is null);
-- Anonymous/public listing deliberately excludes user_id and all pending stories.
create function public.sai_published_experiences()
returns table(id uuid,title text,body text,field text,published_at timestamptz)
language sql stable security definer set search_path='' as $$
 select e.id,e.title,e.body,e.field,e.published_at from public.experiences e
 where e.status='published' order by e.published_at desc nulls last limit 100;
$$;
revoke all on function public.sai_published_experiences() from public;
grant execute on function public.sai_published_experiences() to anon,authenticated;
-- Only the dashboard database administrator can approve stories in this release.
commit;
