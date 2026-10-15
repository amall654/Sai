-- Source: https://www.coursera.org/about ; https://www.coursera.support/s/article/learner-000001306?language=en_US
-- Verified 2026-10-15. Preserve existing records; insert this pilot only if absent.
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types)
select '8ddcccf6-9dfd-43ef-a106-3e29cd74c001','كورسيرا | Coursera','منصة تعلّم عبر الإنترنت تقدم دورات وتخصصات وشهادات مهنية من جامعات وشركات في مجالات متنوعة.','https://www.coursera.org/','يمكنك استكشاف دورات منفردة أو مسارات تضم عدة دورات، واختيار ما يناسب هدفك ومستواك في مجالات مثل التقنية والأعمال والصحة.

ابدأ بالبحث عن موضوع يهمك، ثم راجع وصف الدورة والمتطلبات واللغة والوقت المتوقع لإكمالها قبل التسجيل. التعلم والتسجيل يتمان على موقع كورسيرا.','تختلف لغة التدريس والترجمة بحسب الدورة؛ تحقق من صفحة الدورة.','تختلف التكلفة حسب البرنامج. قد تتاح معاينة أو خيارات مجانية لبعض المحتوى؛ لا يعني التسجيل المجاني أن الدورة كاملة أو الشهادة مجانية.','published',array['دورات','تخصصات','شهادات مهنية']
where not exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c001' or official_url in ('https://www.coursera.org/','https://www.coursera.org'))
on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id)
select '8ddcccf6-9dfd-43ef-a106-3e29cd74c001',id from public.fields where id in ('software','ai-data','cyber-networks') and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c001')
on conflict do nothing;
commit;
