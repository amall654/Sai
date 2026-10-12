-- Run after owner_console migration. Synthetic data and owner replacement roll back.
begin;
insert into auth.users(id,email,email_confirmed_at) values
 ('90000000-0000-4000-8000-000000000011','sai-owner-test@example.invalid',now()),
 ('90000000-0000-4000-8000-000000000012','sai-student-test@example.invalid',now());
insert into sai_private.owner_account(singleton,user_id) values(true,'90000000-0000-4000-8000-000000000011')
on conflict(singleton) do update set user_id=excluded.user_id;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000012","role":"authenticated"}',true);
do $$begin
 if public.sai_is_owner() then raise exception 'FAIL: student owner'; end if;
 begin perform public.sai_owner_catalog();raise exception 'FAIL: student catalog access';exception when insufficient_privilege then null;end;
 begin perform public.sai_owner_save_opportunity('{}');raise exception 'FAIL: student write';exception when insufficient_privilege then null;end;
 begin perform public.sai_owner_review_experience(gen_random_uuid(),'published','pending');raise exception 'FAIL: student publication';exception when insufficient_privilege then null;end;
 begin perform * from sai_private.owner_account;raise exception 'FAIL: owner table exposed';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000011","role":"authenticated"}',true);
do $$declare target uuid;begin
 if not public.sai_is_owner() then raise exception 'FAIL: owner missing';end if;
 perform public.sai_owner_catalog();
 target:=public.sai_owner_save_opportunity('{"title":"اختبار","description":"نبذة","original_text":"إعلان تجريبي","source_name":"اختبار","source_url":"https://example.invalid","type":"hackathon","status":"draft","fields":[]}');
 if not exists(select 1 from jsonb_array_elements(public.sai_owner_catalog()->'opportunities') o where o->>'id'=target::text) then raise exception 'FAIL: saved draft missing';end if;
 begin perform public.sai_owner_save_opportunity(jsonb_build_object('id',target));raise exception 'FAIL: stale write accepted';exception when serialization_failure then null;end;
end$$;
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 begin perform public.sai_owner_catalog();raise exception 'FAIL: anonymous access';exception when insufficient_privilege then null;end;
end$$;
rollback;
select 'PASS: owner RPC access, draft save, stale write protection, student/anonymous denial; rolled back' as result;
