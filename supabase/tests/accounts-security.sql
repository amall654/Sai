-- Run after the accounts migration. All synthetic records are rolled back.
begin;
insert into auth.users(id,email,email_confirmed_at) values
 ('90000000-0000-4000-8000-000000000001','sai-rls-a@example.invalid',now()),
 ('90000000-0000-4000-8000-000000000002','sai-rls-b@example.invalid',now());
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.profiles(name) values('اختبار أ');
insert into public.experiences(title,body) values('اختبار خاص','هذه تجربة اختبار خاصة مؤقتة لا ينبغي أن تظهر لمستخدم آخر أو للزوار.');
do $$begin
 if (select count(*) from public.experiences)<>1 then raise exception 'Owner cannot read own story';end if;
 begin
  insert into public.experiences(title,body,status) values('رفض','هذه محاولة نشر ممنوعة لا ينبغي السماح بكتابتها مباشرة من مستخدم.','published');
  raise exception 'FAIL: student can publish';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.profiles(id,name) values('90000000-0000-4000-8000-000000000002','انتحال');
  raise exception 'FAIL: profile impersonation';
 exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$begin
 if (select count(*) from public.profiles)<>0 then raise exception 'FAIL: other profile visible';end if;
 if (select count(*) from public.experiences)<>0 then raise exception 'FAIL: other story visible';end if;
end$$;
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if exists(select 1 from public.sai_published_experiences() where title='اختبار خاص') then raise exception 'FAIL: private story public';end if;
 begin perform * from public.profiles;raise exception 'FAIL: anonymous profile access';exception when insufficient_privilege then null;end;
 begin perform * from public.experiences;raise exception 'FAIL: anonymous direct story access';exception when insufficient_privilege then null;end;
end$$;
rollback;
select 'PASS: owner isolation, no self-publication, no impersonation, anonymous restrictions; synthetic records rolled back' as result;
