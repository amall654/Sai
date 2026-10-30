begin;
create table public.content_suggestions(
 id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('opportunity','provider')),name text not null check(char_length(trim(name)) between 1 and 160),
 url text not null check(char_length(url)<=2000 and url ~* '^https?://[^[:space:]/?#]+[^[:space:]]*$'),note text not null default '' check(char_length(note)<=2000),
 status text not null default 'pending' check(status in ('pending','reviewed','dismissed')),owner_note text not null default '' check(char_length(owner_note)<=1500),
 created_at timestamptz not null default now(),revision bigint not null default 0
);
create index suggestions_owner_date on public.content_suggestions(user_id,created_at desc);
alter table public.content_suggestions enable row level security;
revoke all on public.content_suggestions from public,anon,authenticated;
grant select(id,kind,name,url,note,status,owner_note,created_at,revision) on public.content_suggestions to authenticated;
create policy own_suggestions on public.content_suggestions for select to authenticated using(user_id=(select auth.uid()));
create function public.sai_submit_suggestion(kind text,name text,url text,note text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,290007));
 if (select count(*) from public.content_suggestions where user_id=auth.uid() and created_at>now()-interval '24 hours')>=3 then raise exception 'Daily suggestion limit';end if;
 if exists(select 1 from public.content_suggestions s where s.user_id=auth.uid() and s.status='pending' and lower(rtrim(s.url,'/'))=lower(rtrim(trim(sai_submit_suggestion.url),'/'))) then raise exception 'Duplicate suggestion';end if;
 insert into public.content_suggestions(kind,name,url,note) values(kind,trim(name),trim(url),coalesce(trim(note),'')) returning id into result;return result;
end;$$;
create function public.sai_owner_suggestions() returns jsonb language plpgsql security definer set search_path='' as $$begin
 if not public.sai_is_owner() then raise insufficient_privilege;end if;
 return coalesce((select jsonb_agg(to_jsonb(q) order by (q.status='pending') desc,q.created_at desc) from (select id,kind,name,url,note,status,owner_note,created_at,revision from public.content_suggestions order by (status='pending') desc,created_at desc limit 200)q),'[]'::jsonb);
end;$$;
create function public.sai_owner_review_suggestion(target uuid,expected_revision bigint,decision text,owner_note text) returns void language plpgsql security definer set search_path='' as $$begin
 if not public.sai_is_owner() then raise insufficient_privilege;end if;
 if decision is null or decision not in ('pending','reviewed','dismissed') or char_length(coalesce(owner_note,''))>1500 then raise exception 'Invalid suggestion decision';end if;
 update public.content_suggestions set status=decision,owner_note=coalesce(trim(sai_owner_review_suggestion.owner_note),''),revision=revision+1 where id=target and revision=expected_revision;
 if not found then raise exception 'Suggestion changed' using errcode='40001';end if;
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'suggestion_'||decision,target);
end;$$;
create table public.opportunity_alerts(id uuid primary key default gen_random_uuid(),opportunity_id uuid not null unique references public.opportunities(id) on delete cascade,created_at timestamptz not null default now());
create table public.opportunity_alert_reads(user_id uuid not null references auth.users(id) on delete cascade,alert_id uuid not null references public.opportunity_alerts(id) on delete cascade,read_at timestamptz not null default now(),primary key(user_id,alert_id));
alter table public.opportunity_alerts enable row level security;alter table public.opportunity_alert_reads enable row level security;
revoke all on public.opportunity_alerts,public.opportunity_alert_reads from public,anon,authenticated;
create function sai_private.capture_opportunity_alert() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status='published' and (tg_op='INSERT' or old.published_at is null) then
 insert into public.opportunity_alerts(opportunity_id) values(new.id) on conflict(opportunity_id) do nothing;end if;return new;
end;$$;
revoke all on function sai_private.capture_opportunity_alert() from public,anon,authenticated;
create trigger opportunity_first_publication after insert or update on public.opportunities for each row execute function sai_private.capture_opportunity_alert();
create function sai_private.visible_opportunity_alerts() returns table(id uuid,opportunity_id uuid,title text,created_at timestamptz,read_at timestamptz) language sql stable set search_path='' as $$
 select a.id,o.id,o.title,a.created_at,r.read_at from public.opportunity_alerts a join public.opportunities o on o.id=a.opportunity_id
 left join public.opportunity_alert_reads r on r.alert_id=a.id and r.user_id=auth.uid()
 where auth.uid() is not null and o.status='published' and o.registration_kind<>'unknown' and (o.deadline_at is null or o.deadline_at>now())
 and exists(select 1 from public.profiles p join public.opportunity_fields ofi on ofi.opportunity_id=o.id join public.fields f on f.id=ofi.field_id where p.id=auth.uid() and f.label_ar=any(p.interests));
$$;
revoke all on function sai_private.visible_opportunity_alerts() from public,anon,authenticated;
create or replace function public.sai_my_notifications() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 with all_notifications as (
 select n.id,'experience'::text as kind,n.experience_id as target_id,n.experience_id,n.status,n.note,n.created_at,n.read_at,e.title from public.experience_notifications n join public.experiences e on e.id=n.experience_id where n.user_id=auth.uid()
 union all select a.id,'opportunity',a.opportunity_id,null::uuid,'new','',a.created_at,a.read_at,a.title from sai_private.visible_opportunity_alerts() a)
 select jsonb_build_object('unread',(select count(*) from all_notifications where read_at is null),'checked_at',now(),'items',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc,q.id) from(select * from all_notifications order by created_at desc,id limit 50)q),'[]'::jsonb)) into result;return result;
end;$$;
create or replace function public.sai_read_notifications(target uuid,through timestamptz) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null then raise insufficient_privilege;end if;
 if target is null and through is null then raise exception 'Choose notification';end if;
 update public.experience_notifications set read_at=now() where user_id=auth.uid() and read_at is null and ((target is not null and id=target) or (target is null and created_at<=least(through,now())));
 insert into public.opportunity_alert_reads(user_id,alert_id) select auth.uid(),a.id from sai_private.visible_opportunity_alerts() a where a.read_at is null and ((target is not null and a.id=target) or (target is null and a.created_at<=least(through,now()))) on conflict do nothing;
end;$$;
revoke all on function public.sai_submit_suggestion(text,text,text,text),public.sai_owner_suggestions(),public.sai_owner_review_suggestion(uuid,bigint,text,text) from public,anon,authenticated;
grant execute on function public.sai_submit_suggestion(text,text,text,text),public.sai_owner_suggestions(),public.sai_owner_review_suggestion(uuid,bigint,text,text) to authenticated;
notify pgrst,'reload schema';commit;
