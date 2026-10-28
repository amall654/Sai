-- Owner-managed providers and uploaded public logos. Existing owner identity and student permissions stay intact.
begin;
alter table public.providers add column guidance jsonb check(guidance is null or jsonb_typeof(guidance)='object'),
 add column logo_path text check(logo_path is null or logo_path ~ '^logos/[0-9a-f-]{36}\.webp$'),
 add column reviewed_at timestamptz;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('provider-logos','provider-logos',true,262144,array['image/webp']);
create policy provider_logo_owner_insert on storage.objects for insert to authenticated
with check(bucket_id='provider-logos' and public.sai_is_owner() and name ~ '^logos/[0-9a-f-]{36}\.webp$');
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
  'providers',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (select p.*,array(select f.field_id from public.provider_fields f where f.provider_id=p.id) as fields from public.providers p) q),'[]'::jsonb),
  'experiences',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
   select id,title,body,field,topic,status,created_at,published_at from public.experiences) q),'[]'::jsonb),
  'fields',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label_ar) order by sort_order) from public.fields where active),'[]'::jsonb)
 );
end;$$;


create function public.sai_owner_save_provider(payload jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare target uuid; existing public.providers; chosen_fields text[]; g jsonb; logo text;
begin
 if not public.sai_is_owner() then raise insufficient_privilege using message='Owner only'; end if;
 target:=nullif(payload->>'id','')::uuid;
 if target is not null then
  select * into existing from public.providers where id=target for update;
  if not found then raise exception 'Provider not found'; end if;
  if nullif(payload->>'updated_at','')::timestamptz is distinct from existing.updated_at then
   raise exception 'Content changed; reload before saving' using errcode='40001';
  end if;
 end if;
 select coalesce(array_agg(distinct v),'{}') into chosen_fields from jsonb_array_elements_text(coalesce(payload->'fields','[]')) v;
 if cardinality(chosen_fields)=0 or exists(select 1 from unnest(chosen_fields) v where not exists(select 1 from public.fields f where f.id=v and f.active)) then raise exception 'Choose valid fields'; end if;
 if payload->>'status' is null or payload->>'status' not in ('draft','published','hidden') then raise exception 'Invalid status'; end if;
 if char_length(coalesce(trim(payload->>'details'),'')) not between 1 and 20000 or char_length(coalesce(trim(payload->>'language'),'')) not between 1 and 1000 or char_length(coalesce(trim(payload->>'cost'),'')) not between 1 and 1000 then raise exception 'Complete provider details'; end if;
 if jsonb_typeof(payload->'content_types') is distinct from 'array' or jsonb_array_length(payload->'content_types') not between 1 and 12 then raise exception 'Choose content types'; end if;
 if exists(select 1 from jsonb_array_elements_text(payload->'content_types') v where char_length(trim(v)) not between 1 and 80) then raise exception 'Invalid content type'; end if;
 g:=payload->'guidance';
 if jsonb_typeof(g) is distinct from 'object' or jsonb_typeof(g->'levels') is distinct from 'array' or jsonb_typeof(g->'languages') is distinct from 'array' then raise exception 'Invalid guidance'; end if;
 if jsonb_array_length(g->'levels')=0 or jsonb_array_length(g->'languages')=0 or coalesce(g->>'cost','') not in ('free','mixed','paid','variable') then raise exception 'Complete guidance'; end if;
 if exists(select 1 from jsonb_array_elements_text(g->'levels') v where v not in ('beginner','intermediate','advanced','variable')) or exists(select 1 from jsonb_array_elements_text(g->'languages') v where v not in ('ar','en','variable')) then raise exception 'Invalid guidance values'; end if;
 logo:=nullif(payload->>'logo_path','');
 if logo is not null and not exists(select 1 from storage.objects where bucket_id='provider-logos' and name=logo) then raise exception 'Logo not uploaded'; end if;
 target:=coalesce(target,gen_random_uuid());
 insert into public.providers(id,name,description,official_url,details,language,cost,content_types,status,guidance,logo_path,reviewed_at,created_by)
 values(target,trim(payload->>'name'),trim(payload->>'description'),trim(payload->>'official_url'),trim(payload->>'details'),trim(payload->>'language'),trim(payload->>'cost'),array(select jsonb_array_elements_text(payload->'content_types')),payload->>'status',g,logo,now(),auth.uid())
 on conflict(id) do update set name=excluded.name,description=excluded.description,official_url=excluded.official_url,details=excluded.details,language=excluded.language,cost=excluded.cost,content_types=excluded.content_types,status=excluded.status,guidance=excluded.guidance,logo_path=excluded.logo_path,reviewed_at=excluded.reviewed_at;
 delete from public.provider_fields where provider_id=target;
 insert into public.provider_fields(provider_id,field_id) select target,unnest(chosen_fields);
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'save_provider',target);
 return target;
end;$$;
revoke all on function public.sai_owner_save_provider(jsonb) from public,anon,authenticated;
grant execute on function public.sai_owner_save_provider(jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
