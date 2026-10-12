-- Record of targeted live corrections; not a seed to rerun over future edits.
-- Applied 2026-10-12 via SQL Editor. No rows deleted.
begin;
update public.opportunities set deadline_at=null
where id in ('f0082026-1008-4000-8000-000000000003','f0082026-1008-4000-8000-000000000005')
and deadline_text like '%ساعة الإغلاق غير معلنة%';
update public.opportunities set status='hidden'
where id='f0082026-1008-4000-8000-000000000005' and source_url='https://kau.edu.sa/u/8l3rR';
commit;
