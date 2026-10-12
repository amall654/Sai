-- Apply once. Owner assignment is a separate, explicitly approved operation.
-- No student policy is widened and no service key is sent to the browser.
begin;
create schema if not exists sai_private;
revoke all on schema sai_private from public,anon,authenticated;
create table sai_private.owner_account (
 singleton boolean primary key default true check(singleton),
 user_id uuid unique not null references auth.users(id) on delete cascade
);
revoke all on sai_private.owner_account from public,anon,authenticated;
alter table sai_private.owner_account enable row level security;

create function public.sai_is_owner() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from sai_private.owner_account o
 join auth.users u on u.id=o.user_id
 where o.user_id=(select auth.uid()) and u.email_confirmed_at is not null);
$$;
revoke all on function public.sai_is_owner() from public,anon,authenticated;
grant execute on function public.sai_is_owner() to authenticated;

create table sai_private.owner_audit (
 id bigint generated always as identity primary key,
 actor uuid not null, action text not null, target_id uuid not null,
 created_at timestamptz not null default now()
);
revoke all on sai_private.owner_audit from public,anon,authenticated;
alter table sai_private.owner_audit enable row level security;

create function public.sai_owner_catalog() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege using message='Owner only'; end if;
 return jsonb_build_object(
  'opportunities',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
   select o.id,o.title,o.description,o.original_text,o.source_name,o.source_url,o.registration_url,
    o.type,o.mode,o.deadline_at,o.deadline_text,o.status,o.updated_at,o.created_at,
    array(select f.field_id from public.opportunity_fields f where f.opportunity_id=o.id) as fields
   from public.opportunities o) q),'[]'::jsonb),
  'experiences',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
   select id,title,body,field,status,created_at,published_at from public.experiences) q),'[]'::jsonb),
  'fields',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label_ar) order by sort_order) from public.fields where active),'[]'::jsonb)
 );
end;$$;

create function public.sai_owner_save_opportunity(payload jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare target uuid; existing public.opportunities; chosen_fields text[];
begin
 if not public.sai_is_owner() then raise insufficient_privilege using message='Owner only'; end if;
 target:=nullif(payload->>'id','')::uuid;
 if target is not null then
  select * into existing from public.opportunities where id=target for update;
  if not found then raise exception 'Opportunity not found'; end if;
  if nullif(payload->>'updated_at','')::timestamptz is distinct from existing.updated_at then
   raise exception 'Content changed; reload before saving' using errcode='40001';
  end if;
 end if;
 select coalesce(array_agg(distinct v),'{}') into chosen_fields from jsonb_array_elements_text(coalesce(payload->'fields','[]')) v;
 if exists(select 1 from unnest(chosen_fields) v where not exists(select 1 from public.fields f where f.id=v and f.active)) then raise exception 'Invalid field'; end if;
 if coalesce(payload->>'mode','') not in ('','حضوري','عن بُعد','حضوري وعن بُعد') then raise exception 'Invalid mode'; end if;
 target:=coalesce(target,gen_random_uuid());
 insert into public.opportunities(id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status,created_by)
 values(target,trim(payload->>'title'),trim(payload->>'description'),trim(payload->>'original_text'),trim(payload->>'source_name'),trim(payload->>'source_url'),nullif(trim(payload->>'registration_url'),''),payload->>'type',nullif(payload->>'mode',''),nullif(payload->>'deadline_at','')::timestamptz,nullif(payload->>'deadline_text',''),payload->>'status',auth.uid())
 on conflict(id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,
 source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,
 type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status;
 delete from public.opportunity_fields where opportunity_id=target;
 insert into public.opportunity_fields(opportunity_id,field_id) select target,unnest(chosen_fields);
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'save_opportunity',target);
 return target;
end;$$;

create function public.sai_owner_review_experience(target uuid,decision text,expected_status text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege using message='Owner only'; end if;
 if decision not in ('pending','published','rejected') or decision is null then raise exception 'Invalid decision'; end if;
 update public.experiences set status=decision,
 published_at=case when decision='published' then coalesce(published_at,now()) else null end
 where id=target and status=expected_status;
 if not found then raise exception 'Story changed; reload before reviewing' using errcode='40001'; end if;
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'experience_'||decision,target);
end;$$;

revoke all on function public.sai_owner_catalog(),public.sai_owner_save_opportunity(jsonb),public.sai_owner_review_experience(uuid,text,text) from public,anon,authenticated;
grant execute on function public.sai_owner_catalog(),public.sai_owner_save_opportunity(jsonb),public.sai_owner_review_experience(uuid,text,text) to authenticated;
commit;
