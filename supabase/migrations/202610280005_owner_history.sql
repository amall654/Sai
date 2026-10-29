begin;
create function public.sai_owner_history() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege; end if;
 return coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc,q.id desc) from (
 select a.id,a.action,a.created_at,coalesce(o.title,p.name,e.title,'') as title
 from sai_private.owner_audit a left join public.opportunities o on o.id=a.target_id
 left join public.providers p on p.id=a.target_id left join public.experiences e on e.id=a.target_id
 order by a.created_at desc,a.id desc limit 50) q),'[]'::jsonb);
end;$$;
revoke all on function public.sai_owner_history() from public,anon,authenticated;
grant execute on function public.sai_owner_history() to authenticated;
notify pgrst,'reload schema';
commit;
