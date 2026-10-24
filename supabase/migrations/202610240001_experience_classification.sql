-- Additive migration: existing text, publication dates and access policies are preserved.
begin;
alter table public.experiences add column topic text not null default 'تجربة أخرى'
 check(topic in ('هاكاثون','مسابقة','تعلّم ذاتي أو دورة','مشروع تطبيقي','تدريب عملي','تجربة أخرى'));
grant insert(topic) on public.experiences to authenticated;

-- Keep the original RPC available for previously cached clients.
create function public.sai_published_experiences_v2()
returns table(id uuid,title text,body text,field text,topic text,published_at timestamptz)
language sql stable security definer set search_path='' as $$
 select e.id,e.title,e.body,e.field,e.topic,e.published_at from public.experiences e
 where e.status='published' order by e.published_at desc nulls last,e.id;
$$;
revoke all on function public.sai_published_experiences_v2() from public,anon,authenticated;
grant execute on function public.sai_published_experiences_v2() to anon,authenticated;

create or replace function public.sai_owner_catalog() returns jsonb
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
   select id,title,body,field,topic,status,created_at,published_at from public.experiences) q),'[]'::jsonb),
  'fields',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label_ar) order by sort_order) from public.fields where active),'[]'::jsonb)
 );
end;$$;

-- Classification and review are one transaction; students still cannot approve or edit rows.
create function public.sai_owner_review_classified_experience(target uuid,decision text,expected_status text,classification jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare existing public.experiences;
begin
 if not public.sai_is_owner() then raise insufficient_privilege using message='Owner only'; end if;
 select * into existing from public.experiences where id=target for update;
 if not found or existing.status is distinct from expected_status
  or existing.topic is distinct from (classification->>'expected_topic')
  or existing.field is distinct from (classification->>'expected_field') then
  raise exception 'Story changed; reload before reviewing' using errcode='40001';
 end if;
 if nullif(trim(classification->>'field'),'') is null or nullif(trim(classification->>'topic'),'') is null then
  raise exception 'Choose topic and field';
 end if;
 if classification->>'field' <> existing.field and classification->>'field' <> 'تجربة عامة'
  and not exists(select 1 from public.fields where active and label_ar=classification->>'field') then
  raise exception 'Invalid field';
 end if;
 perform public.sai_owner_review_experience(target,decision,expected_status);
 update public.experiences set topic=classification->>'topic',field=classification->>'field' where id=target;
end;$$;
revoke all on function public.sai_owner_review_classified_experience(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.sai_owner_review_classified_experience(uuid,text,text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
