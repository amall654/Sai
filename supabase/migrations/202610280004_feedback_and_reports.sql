begin;
create table public.student_outcomes(
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('opportunity','provider')),target_id uuid not null,
 stage text not null,helpful boolean,updated_at timestamptz not null default now(),
 primary key(user_id,kind,target_id),
 check((kind='opportunity' and stage in ('not_yet','registered','participated')) or
 (kind='provider' and stage in ('not_yet','started','completed')))
);
create table public.content_reports(
 id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('opportunity','provider','experience')),target_id uuid not null,
 reason text not null check(reason in ('broken_link','incorrect','expired','other')),
 note text not null default '' check(char_length(note)<=1500),
 status text not null default 'open' check(status in ('open','resolved','dismissed')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index content_reports_user_date on public.content_reports(user_id,created_at);
alter table public.student_outcomes enable row level security;
alter table public.content_reports enable row level security;
revoke all on public.student_outcomes,public.content_reports from public,anon,authenticated;
grant select on public.student_outcomes,public.content_reports to authenticated;
create policy own_outcomes on public.student_outcomes for select to authenticated using(user_id=(select auth.uid()));
create policy own_reports on public.content_reports for select to authenticated using(user_id=(select auth.uid()));
create function sai_private.content_exists(kind text,target uuid) returns boolean
language sql stable set search_path='' as $$
 select (kind='provider' and exists(select 1 from public.providers where id=target and status='published'))
 or (kind='opportunity' and exists(select 1 from public.opportunities where id=target and status='published'))
 or (kind='experience' and exists(select 1 from public.experiences where id=target and status='published'));
$$;
revoke all on function sai_private.content_exists(text,uuid) from public,anon,authenticated;
create function public.sai_save_outcome(kind text,target uuid,stage text,helpful boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 if not sai_private.content_exists(kind,target) then raise exception 'Content unavailable'; end if;
 insert into public.student_outcomes(user_id,kind,target_id,stage,helpful) values(auth.uid(),kind,target,stage,helpful)
 on conflict on constraint student_outcomes_pkey do update set stage=excluded.stage,helpful=excluded.helpful,updated_at=now();
end;$$;
create function public.sai_submit_content_report(kind text,target uuid,reason text,note text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 if not sai_private.content_exists(kind,target) then raise exception 'Content unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,280004));
 if (select count(*) from public.content_reports where user_id=auth.uid() and created_at>now()-interval '24 hours')>=5 then raise exception 'Daily report limit'; end if;
 insert into public.content_reports(user_id,kind,target_id,reason,note) values(auth.uid(),kind,target,reason,coalesce(trim(note),'')) returning id into result;
 return result;
end;$$;
create function public.sai_owner_engagement() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege; end if;
 return jsonb_build_object(
 'outcomes',coalesce((select jsonb_agg(to_jsonb(q)) from (select kind,stage,count(*) as total,count(*) filter(where helpful) as helpful,count(*) filter(where helpful=false) as unhelpful from public.student_outcomes group by kind,stage) q),'[]'::jsonb),
 'reports',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
 select r.id,r.kind,r.target_id,r.reason,r.note,r.status,r.created_at,r.updated_at,
 case r.kind when 'opportunity' then (select title from public.opportunities where id=r.target_id) when 'provider' then (select name from public.providers where id=r.target_id) else (select title from public.experiences where id=r.target_id) end as title
 from public.content_reports r) q),'[]'::jsonb));
end;$$;
create function public.sai_owner_review_report(target uuid,decision text,expected_updated timestamptz) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege; end if;
 if decision is null or decision not in ('open','resolved','dismissed') then raise exception 'Invalid report decision'; end if;
 update public.content_reports set status=decision,updated_at=now() where id=target and updated_at=expected_updated;
 if not found then raise exception 'Report changed' using errcode='40001'; end if;
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'report_'||decision,target);
end;$$;
revoke all on function public.sai_save_outcome(text,uuid,text,boolean),public.sai_submit_content_report(text,uuid,text,text),public.sai_owner_engagement(),public.sai_owner_review_report(uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.sai_save_outcome(text,uuid,text,boolean),public.sai_submit_content_report(text,uuid,text,text),public.sai_owner_engagement(),public.sai_owner_review_report(uuid,text,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
