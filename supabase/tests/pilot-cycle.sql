-- Run in SQL Editor as postgres after the owner migration.
-- All test records and moderation actions roll back; no public test story persists.
begin;
select set_config('sai.test_owner',user_id::text,true) from sai_private.owner_account where singleton;
insert into auth.users(id,email,email_confirmed_at) values
 ('90000000-0000-4000-8000-000000000021','sai-cycle-a@example.invalid',now()),
 ('90000000-0000-4000-8000-000000000022','sai-cycle-b@example.invalid',now());
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000021","role":"authenticated"}',true);
insert into public.saved_opportunities(opportunity_id) select id from public.opportunities limit 1;
insert into public.experiences(title,body) values('Sai rollback cycle','Synthetic test only: this story is never committed or published to real visitors.');
select set_config('sai.test_story',id::text,true) from public.experiences where title='Sai rollback cycle';
do $$begin
 if (select count(*) from public.saved_opportunities)<>1 then raise exception 'FAIL: save retrieval';end if;
 if (select status from public.experiences where id=current_setting('sai.test_story')::uuid)<>'pending' then raise exception 'FAIL: initial status';end if;
 begin update public.experiences set status='published';raise exception 'FAIL: self publication';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000022","role":"authenticated"}',true);
do $$begin
 if exists(select 1 from public.saved_opportunities) or exists(select 1 from public.experiences) then raise exception 'FAIL: cross-account exposure';end if;
end$$;
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if exists(select 1 from public.sai_published_experiences() where id=current_setting('sai.test_story')::uuid) then raise exception 'FAIL: pending story public';end if;
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('sai.test_owner'),'role','authenticated')::text,true);
select public.sai_owner_review_experience(current_setting('sai.test_story')::uuid,'published','pending');
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if not exists(select 1 from public.sai_published_experiences() where id=current_setting('sai.test_story')::uuid) then raise exception 'FAIL: approved story missing';end if;
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('sai.test_owner'),'role','authenticated')::text,true);
select public.sai_owner_review_experience(current_setting('sai.test_story')::uuid,'pending','published');
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if exists(select 1 from public.sai_published_experiences() where id=current_setting('sai.test_story')::uuid) then raise exception 'FAIL: hidden story public';end if;
end$$;
rollback;
select 'PASS: save retrieval, two-account isolation, pending privacy, owner approval and hiding; rolled back' as result;
