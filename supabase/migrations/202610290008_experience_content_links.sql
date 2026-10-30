begin;
alter table public.experiences add column related_kind text check(related_kind in ('opportunity','provider')),add column related_id uuid,
 add constraint experience_link_pair check((related_kind is null)=(related_id is null));
grant insert(related_kind,related_id) on public.experiences to authenticated;
create function sai_private.validate_experience_link() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.related_kind is null and new.related_id is null then return new;end if;
 if tg_op='UPDATE' and new.related_kind is not distinct from old.related_kind and new.related_id is not distinct from old.related_id then return new;end if;
 if not ((new.related_kind='provider' and exists(select 1 from public.providers where id=new.related_id and status='published')) or (new.related_kind='opportunity' and exists(select 1 from public.opportunities where id=new.related_id and status='published' and registration_kind<>'unknown' and (deadline_at is null or deadline_at>now())))) then raise exception 'Related content unavailable';end if;
 return new;
end;$$;
revoke all on function sai_private.validate_experience_link() from public,anon,authenticated;
create trigger validate_experience_link before insert or update on public.experiences for each row execute function sai_private.validate_experience_link();
create function public.sai_published_experiences_v3() returns table(id uuid,title text,body text,field text,topic text,published_at timestamptz,related_kind text,related_id uuid)
language sql stable security definer set search_path='' as $$select e.id,e.title,e.body,e.field,e.topic,e.published_at,e.related_kind,e.related_id from public.experiences e where e.status='published' order by e.published_at desc nulls last,e.id;$$;
revoke all on function public.sai_published_experiences_v3() from public,anon,authenticated;
grant execute on function public.sai_published_experiences_v3() to anon,authenticated;
create or replace function public.sai_resubmit_experience(target uuid,expected_revision bigint,payload jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare existing public.experiences;
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 select * into existing from public.experiences where id=target and user_id=auth.uid() for update;
 if not found then raise insufficient_privilege; end if;
 if existing.status<>'rejected' or existing.revision<>expected_revision or expected_revision is null then raise exception 'Story changed' using errcode='40001'; end if;
 if payload->>'field'<>'تجربة عامة' and not exists(select 1 from public.fields where active and label_ar=payload->>'field') then raise exception 'Invalid field'; end if;
 if nullif(trim(payload->>'field'),'') is null or nullif(trim(payload->>'topic'),'') is null then raise exception 'Classification required'; end if;
 update public.experiences set title=trim(coalesce(payload->>'title','')),body=trim(payload->>'body'),field=payload->>'field',topic=payload->>'topic',
 related_kind=case when payload?'related_kind' then nullif(payload->>'related_kind','') else existing.related_kind end,related_id=case when payload?'related_id' then nullif(payload->>'related_id','')::uuid else existing.related_id end,status='pending',published_at=null,review_note='' where id=target;
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
  'providers',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (select p.*,array(select f.field_id from public.provider_fields f where f.provider_id=p.id) as fields from public.providers p) q),'[]'::jsonb),
  'experiences',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
   select id,title,body,field,topic,status,created_at,published_at,review_note,revision,related_kind,related_id from public.experiences) q),'[]'::jsonb),
  'fields',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label_ar) order by sort_order) from public.fields where active),'[]'::jsonb)
 );
end;$$;
notify pgrst,'reload schema';commit;
