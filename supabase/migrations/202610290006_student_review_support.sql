begin;
alter table public.experiences add column review_note text not null default '' check(char_length(review_note)<=1500),
 add column revision bigint not null default 0;
create function sai_private.bump_experience_revision() returns trigger language plpgsql set search_path='' as $$
begin new.revision:=old.revision+1;return new;end;$$;
revoke all on function sai_private.bump_experience_revision() from public,anon,authenticated;
create trigger experience_revision before update on public.experiences for each row execute function sai_private.bump_experience_revision();
create table public.experience_notifications(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 experience_id uuid not null references public.experiences(id) on delete cascade,
 status text not null check(status in ('pending','published','rejected')),note text not null default '',
 created_at timestamptz not null default now(),read_at timestamptz
);
create index experience_notifications_owner on public.experience_notifications(user_id,created_at desc);
alter table public.experience_notifications enable row level security;
revoke all on public.experience_notifications from public,anon,authenticated;
-- Reads and acknowledgements go through bounded RPCs; no direct student writes.
create function sai_private.notify_experience_status() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status is distinct from old.status then
  insert into public.experience_notifications(user_id,experience_id,status,note) values(new.user_id,new.id,new.status,new.review_note);
 end if;return new;
end;$$;
revoke all on function sai_private.notify_experience_status() from public,anon,authenticated;
create trigger experience_status_notification after update on public.experiences for each row execute function sai_private.notify_experience_status();
create function public.sai_resubmit_experience(target uuid,expected_revision bigint,payload jsonb) returns void
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
 status='pending',published_at=null,review_note='' where id=target;
end;$$;
create function public.sai_owner_review_experience_v2(target uuid,decision text,expected_revision bigint,classification jsonb,review_note text) returns void
language plpgsql security definer set search_path='' as $$
declare existing public.experiences;
begin
 if not public.sai_is_owner() then raise insufficient_privilege; end if;
 select * into existing from public.experiences where id=target for update;
 if not found or expected_revision is null or existing.revision<>expected_revision then raise exception 'Story changed' using errcode='40001'; end if;
 if char_length(coalesce(review_note,''))>1500 or (decision='rejected' and nullif(trim(review_note),'') is null) then raise exception 'Review note required'; end if;
 update public.experiences set review_note=coalesce(trim(sai_owner_review_experience_v2.review_note),'') where id=target;
 perform public.sai_owner_review_classified_experience(target,decision,existing.status,classification);
end;$$;
create function public.sai_my_notifications() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 return jsonb_build_object('unread', (select count(*) from public.experience_notifications where user_id=auth.uid() and read_at is null),'checked_at',now(),
 'items',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc,q.id) from (
 select n.id,n.experience_id,n.status,n.note,n.created_at,n.read_at,e.title from public.experience_notifications n join public.experiences e on e.id=n.experience_id
 where n.user_id=auth.uid() order by n.created_at desc,n.id limit 50)q),'[]'::jsonb));
end;$$;
create function public.sai_read_notifications(target uuid,through timestamptz) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise insufficient_privilege; end if;
 if target is null and through is null then raise exception 'Choose notification'; end if;
 update public.experience_notifications set read_at=now() where user_id=auth.uid() and read_at is null
 and ((target is not null and id=target) or (target is null and created_at<=least(through,now())));
end;$$;
create table public.account_requests(
 id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('help','correction','deletion')),message text not null check(char_length(trim(message)) between 5 and 2000),
 status text not null default 'open' check(status in ('open','closed')),response text not null default '' check(char_length(response)<=1500),
 created_at timestamptz not null default now(),revision bigint not null default 0
);
create index account_requests_owner on public.account_requests(user_id,created_at desc);
alter table public.account_requests enable row level security;
revoke all on public.account_requests from public,anon,authenticated;
grant select(id,kind,message,status,response,created_at,revision) on public.account_requests to authenticated;
create policy own_account_requests on public.account_requests for select to authenticated using(user_id=(select auth.uid()));
create function public.sai_submit_account_request(kind text,message text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,290006));
 if (select count(*) from public.account_requests where user_id=auth.uid() and created_at>now()-interval '24 hours')>=3 then raise exception 'Daily request limit'; end if;
 insert into public.account_requests(kind,message) values(kind,trim(message)) returning id into result;return result;
end;$$;
create function public.sai_owner_account_requests() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege; end if;
 return coalesce((select jsonb_agg(to_jsonb(q) order by (q.status='open') desc,q.created_at desc,q.id) from (
 select r.id,r.user_id as account_id,r.kind,r.message,r.status,r.response,r.created_at,r.revision,coalesce(p.name,'طالب') as name
 from public.account_requests r left join public.profiles p on p.id=r.user_id order by (r.status='open') desc,r.created_at desc,r.id limit 200) q),'[]'::jsonb);
end;$$;
create function public.sai_owner_reply_account_request(target uuid,expected_revision bigint,response text,decision text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.sai_is_owner() then raise insufficient_privilege; end if;
 if decision is null or decision not in ('open','closed') or char_length(coalesce(response,''))>1500 then raise exception 'Invalid response'; end if;
 update public.account_requests set response=coalesce(trim(sai_owner_reply_account_request.response),''),status=decision,revision=revision+1 where id=target and revision=expected_revision;
 if not found then raise exception 'Request changed' using errcode='40001'; end if;
 insert into sai_private.owner_audit(actor,action,target_id) values(auth.uid(),'account_request_'||decision,target);
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
   select id,title,body,field,topic,status,created_at,published_at,review_note,revision from public.experiences) q),'[]'::jsonb),
  'fields',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label_ar) order by sort_order) from public.fields where active),'[]'::jsonb)
 );
end;$$;
revoke all on function public.sai_resubmit_experience(uuid,bigint,jsonb),public.sai_owner_review_experience_v2(uuid,text,bigint,jsonb,text),public.sai_my_notifications(),public.sai_read_notifications(uuid,timestamptz),public.sai_submit_account_request(text,text),public.sai_owner_account_requests(),public.sai_owner_reply_account_request(uuid,bigint,text,text) from public,anon,authenticated;
grant execute on function public.sai_resubmit_experience(uuid,bigint,jsonb),public.sai_owner_review_experience_v2(uuid,text,bigint,jsonb,text),public.sai_my_notifications(),public.sai_read_notifications(uuid,timestamptz),public.sai_submit_account_request(text,text),public.sai_owner_account_requests(),public.sai_owner_reply_account_request(uuid,bigint,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
