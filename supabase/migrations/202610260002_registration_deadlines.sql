-- Original registration deadlines are fixed at first publication.
begin;
alter table public.opportunities
 add column registration_kind text not null default 'unknown' check(registration_kind in ('exact','date','ongoing','unknown')),
 add column registration_date date,
 add column registration_locked boolean not null default false;
update public.opportunities set registration_kind='exact' where deadline_at is not null;
update public.opportunities set registration_kind='date',registration_date=case id
 when 'f0192026-1019-4000-8000-000000000001' then date '2026-10-23'
 when 'd8d2a814-44ad-50a2-b609-4c707e23210a' then date '2026-10-17'
 when 'f0082026-1008-4000-8000-000000000003' then date '2026-11-05' end
 where id in ('f0192026-1019-4000-8000-000000000001','d8d2a814-44ad-50a2-b609-4c707e23210a','f0082026-1008-4000-8000-000000000003');
update public.opportunities set registration_kind='ongoing' where id='93d28d06-395e-4b14-a6b7-d35999a50003';
update public.opportunities set deadline_at=(registration_date+1)::timestamp at time zone 'Asia/Riyadh' where registration_kind='date';
-- Unknown dates never mean that registration is open. Keep the content for owner review.
update public.opportunities set status='draft' where status='published' and registration_kind='unknown';
update public.opportunities set registration_locked=true where registration_kind<>'unknown' and (status='published' or published_at is not null);
create function public.sai_guard_registration() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' and old.registration_locked and
  (new.registration_kind is distinct from old.registration_kind or new.registration_date is distinct from old.registration_date
   or new.deadline_at is distinct from old.deadline_at) then
  raise exception 'Original registration deadline is locked' using errcode='22023';
 end if;
 if new.registration_kind='date' then
  if new.registration_date is null then raise exception 'Registration date required' using errcode='22023'; end if;
  new.deadline_at:=(new.registration_date+1)::timestamp at time zone 'Asia/Riyadh';
 elsif new.registration_kind='exact' then
  if new.deadline_at is null then raise exception 'Registration deadline required' using errcode='22023'; end if;
  new.registration_date:=null;
 else
  new.deadline_at:=null;new.registration_date:=null;
 end if;
 if new.status='published' and new.registration_kind='unknown' then
  raise exception 'Choose a registration deadline or ongoing before publishing' using errcode='22023';
 end if;
 new.registration_locked:=case when tg_op='UPDATE' then old.registration_locked else false end or new.status='published';
 return new;
end;$$;
revoke all on function public.sai_guard_registration() from public,anon,authenticated;
create trigger sai_registration_guard before insert or update on public.opportunities
 for each row execute function public.sai_guard_registration();
grant select(registration_kind,registration_date) on public.opportunities to anon,authenticated;
alter policy opportunities_read on public.opportunities to anon,authenticated
 using(status='published' and (registration_kind='ongoing' or (registration_kind in ('date','exact') and deadline_at>now())));
create or replace function public.sai_owner_save_opportunity(payload jsonb) returns uuid
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
 insert into public.opportunities(id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status,created_by,registration_kind,registration_date)
 values(target,trim(payload->>'title'),trim(payload->>'description'),trim(payload->>'original_text'),trim(payload->>'source_name'),trim(payload->>'source_url'),nullif(trim(payload->>'registration_url'),''),payload->>'type',nullif(payload->>'mode',''),nullif(payload->>'deadline_at','')::timestamptz,nullif(payload->>'deadline_text',''),payload->>'status',auth.uid(),coalesce(payload->>'registration_kind','unknown'),nullif(payload->>'registration_date','')::date)
 on conflict(id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,
 source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,
 type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status,registration_kind=excluded.registration_kind,registration_date=excluded.registration_date;
 delete from public.opportunity_fields where opportunity_id=target;
 insert into public.opportunity_fields(opportunity_id,field_id) select target,unnest(chosen_fields);
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'save_opportunity',target);
 return target;
end;$$;

create or replace function public.sai_owner_catalog() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege using message='Owner only'; end if;
 return jsonb_build_object(
  'opportunities',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
   select o.id,o.title,o.description,o.original_text,o.source_name,o.source_url,o.registration_url,
    o.type,o.mode,o.deadline_at,o.deadline_text,o.registration_kind,o.registration_date,o.registration_locked,o.status,o.updated_at,o.created_at,
    array(select f.field_id from public.opportunity_fields f where f.opportunity_id=o.id) as fields
   from public.opportunities o) q),'[]'::jsonb),
  'experiences',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
   select id,title,body,field,topic,status,created_at,published_at from public.experiences) q),'[]'::jsonb),
  'fields',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label_ar) order by sort_order) from public.fields where active),'[]'::jsonb)
 );
end;$$;

notify pgrst,'reload schema';
commit;
