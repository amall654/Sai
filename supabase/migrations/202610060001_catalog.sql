-- Sai catalog foundation. Run once in Supabase SQL Editor as postgres.
-- Creates empty content tables; no existing tables or data are deleted.
begin;

create table public.fields (
 id text primary key,
 label_ar text not null,
 label_en text not null,
 active boolean not null default true,
 sort_order integer not null
);
insert into public.fields (id,label_ar,label_en,sort_order) values
 ('software','البرمجة وهندسة البرمجيات','Programming and software engineering',1),
 ('ai-data','الذكاء الاصطناعي وعلوم البيانات','AI and data science',2),
 ('cyber-networks','الأمن السيبراني والشبكات','Cybersecurity and networking',3);

create table public.opportunity_types (
 id text primary key check (id in ('hackathon','competition')),
 label_ar text not null,
 label_en text not null,
 active boolean not null default true
);
insert into public.opportunity_types (id,label_ar,label_en) values
 ('hackathon','هاكاثون','Hackathon'), ('competition','مسابقة','Competition');

create table public.opportunities (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(trim(title)) between 1 and 160),
 description text not null check (char_length(trim(description)) between 1 and 500),
 original_text text not null check (char_length(trim(original_text)) between 1 and 20000),
 source_name text not null check (char_length(trim(source_name)) between 1 and 160),
 source_url text not null check (source_url ~* '^https?://[^[:space:]/?#]+[^[:space:]]*$'),
 registration_url text check (registration_url ~* '^https?://[^[:space:]/?#]+[^[:space:]]*$'),
 type text not null references public.opportunity_types(id),
 mode text,
 deadline_at timestamptz,
 deadline_text text,
 status text not null default 'draft' check (status in ('draft','published','hidden')),
 published_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.providers (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(trim(name)) between 1 and 160),
 description text not null check (char_length(trim(description)) between 1 and 500),
 official_url text not null check (official_url ~* '^https?://[^[:space:]/?#]+[^[:space:]]*$'),
 details text check (char_length(details) <= 20000),
 language text,
 cost text,
 content_types text[] not null default '{}',
 status text not null default 'draft' check (status in ('draft','published','hidden')),
 published_at timestamptz,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.opportunity_fields (
 opportunity_id uuid not null references public.opportunities(id) on delete cascade,
 field_id text not null references public.fields(id),
 primary key (opportunity_id,field_id)
);
create table public.provider_fields (
 provider_id uuid not null references public.providers(id) on delete cascade,
 field_id text not null references public.fields(id),
 primary key (provider_id,field_id)
);

create function public.sai_catalog_timestamps() returns trigger
language plpgsql set search_path = '' as $$
begin
 new.updated_at := now();
 if TG_OP = 'UPDATE' then
  new.created_at := old.created_at;
  new.published_at := old.published_at;
 else
  new.created_at := now();
  new.published_at := null;
 end if;
 if new.status = 'published' and new.published_at is null then
  new.published_at := now();
 end if;
 return new;
end;
$$;
revoke all on function public.sai_catalog_timestamps() from public, anon, authenticated;
create trigger opportunities_timestamps before insert or update on public.opportunities
for each row execute function public.sai_catalog_timestamps();
create trigger providers_timestamps before insert or update on public.providers
for each row execute function public.sai_catalog_timestamps();

alter table public.fields enable row level security;
alter table public.opportunity_types enable row level security;
alter table public.opportunities enable row level security;
alter table public.providers enable row level security;
alter table public.opportunity_fields enable row level security;
alter table public.provider_fields enable row level security;

revoke all on public.fields, public.opportunity_types, public.opportunities,
 public.providers, public.opportunity_fields, public.provider_fields
 from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.fields, public.opportunity_types,
 public.opportunity_fields, public.provider_fields to anon, authenticated;
-- Explicit public columns: creator account identifiers are not exposed.
grant select (id,title,description,original_text,source_name,source_url,
 registration_url,type,mode,deadline_at,deadline_text,status,published_at,created_at,updated_at)
 on public.opportunities to anon, authenticated;
grant select (id,name,description,official_url,details,language,cost,
 content_types,status,published_at,created_at,updated_at)
 on public.providers to anon, authenticated;

create policy fields_read on public.fields for select to anon, authenticated using (active);
create policy types_read on public.opportunity_types for select to anon, authenticated using (active);
create policy opportunities_read on public.opportunities for select to anon, authenticated
 using (status = 'published' and (deadline_at is null or deadline_at > now()));
create policy providers_read on public.providers for select to anon, authenticated
 using (status = 'published');
create policy opportunity_fields_read on public.opportunity_fields for select to anon, authenticated
 using (exists (select 1 from public.opportunities o where o.id = opportunity_id));
create policy provider_fields_read on public.provider_fields for select to anon, authenticated
 using (exists (select 1 from public.providers p where p.id = provider_id));

commit;
