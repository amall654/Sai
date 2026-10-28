begin;
alter table public.profiles add column learning_level text not null default 'beginner'
 check(learning_level in ('beginner','intermediate','advanced'));
grant select(learning_level) on public.profiles to authenticated;
create table public.learning_progress(
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 path_id text not null, step_key text not null,
 state text not null check(state in ('not_started','in_progress','completed')),
 updated_at timestamptz not null default now(),
 primary key(user_id,path_id,step_key),
 check((path_id='software' and step_key in ('elzero.org','freecodecamp.org','learn.microsoft.com'))
 or (path_id='ai-data' and step_key in ('skillsbuild.org','deeplearning.ai','skillbuilder.aws'))
 or (path_id='cyber-networks' and step_key in ('netacad.com','tryhackme.com','portswigger.net')))
);
alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from public,anon,authenticated;
grant select on public.learning_progress to authenticated;
create policy own_learning_progress on public.learning_progress for select to authenticated
using(user_id=(select auth.uid()));
create function public.sai_save_learning_progress(path text,step text,new_state text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 insert into public.learning_progress(user_id,path_id,step_key,state) values(auth.uid(),path,step,new_state)
 on conflict(user_id,path_id,step_key) do update set state=excluded.state,updated_at=now();
end;$$;
create function public.sai_save_learning_preferences(level text,interests text[]) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 if level is null or level not in ('beginner','intermediate','advanced') or interests is null or cardinality(interests)>20
 or exists(select 1 from unnest(interests) i where not exists(select 1 from public.fields f where f.active and f.label_ar=i)) then raise exception 'Invalid learning preferences'; end if;
 insert into public.profiles(id,name,interests,learning_level)
 select id,coalesce(nullif(trim(raw_user_meta_data->>'name'),''),'طالب'),interests,level from auth.users where id=auth.uid()
 on conflict(id) do update set interests=excluded.interests,learning_level=excluded.learning_level;
end;$$;
revoke all on function public.sai_save_learning_progress(text,text,text),public.sai_save_learning_preferences(text,text[]) from public,anon,authenticated;
grant execute on function public.sai_save_learning_progress(text,text,text),public.sai_save_learning_preferences(text,text[]) to authenticated;
notify pgrst,'reload schema';
commit;
