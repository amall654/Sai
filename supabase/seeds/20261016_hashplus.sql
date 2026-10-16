-- Source: https://learn.ihashplus.com/
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c005','هاش بلس','منصة تعليمية تقدم دورات ومسارات ومعسكرات تقنية تساعد على تطوير المهارات من خلال التعلم والتطبيق.','https://learn.ihashplus.com/','تجمع هاش بلس دورات ومسارات تعليمية ومعسكرات في مجالات تقنية متنوعة، مع محتوى يساعد على التعلم بالوتيرة المناسبة للطالب.

تشمل مجالات التعلم:
• البرمجة وتطوير تطبيقات الجوال.
• تصميم تجربة المستخدم وواجهاته.
• الذكاء الاصطناعي والرؤية الحاسوبية وهندسة الأوامر.
• قواعد البيانات وإدارة إصدارات المشاريع البرمجية.

تفيد الطالب التقني في اكتساب مهارات عملية وتوسيع معرفته بأدوات تطوير التطبيقات والمنتجات الرقمية. راجع محتوى المسار ومستواه ومتطلباته قبل التسجيل.','الموقع والمحتوى التعريفي بالعربية؛ تحقق من لغة الشرح والمواد لكل دورة.','تقدم المنصة باقات اشتراك؛ تحقق من السعر وما تشمله الباقة ورسوم المعسكرات من الموقع الرسمي.','published',array['دورات','مسارات تعليمية','معسكرات'] where not exists(select 1 from public.providers where official_url='https://learn.ihashplus.com/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c005',id from public.fields where id in ('software','ai-data') and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c005') on conflict do nothing;
commit;
