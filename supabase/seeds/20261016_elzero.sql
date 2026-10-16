-- Sources: https://elzero.org/ ; https://elzero.org/first-paid-course-from-our-academy/
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c008','أكاديمية الزيرو','منصة عربية لتعلم البرمجة وتطوير الويب، تقدم مسارات منظمة وخطط دراسة وتكليفات وتحديات تطبيقية.','https://elzero.org/','تقدم أكاديمية الزيرو شروحات باللغة العربية ومسارات تساعد على تنظيم التعلم الذاتي، مع خطط دراسة وتمارين وتطبيقات لتحويل المفاهيم إلى مهارات عملية.

تشمل مجالات التعلم:
• أساسيات البرمجة وحل المشكلات.
• تطوير الويب والواجهات الأمامية.
• تطوير الخلفيات باستخدام PHP.
• البرمجة باستخدام Python وC++.
• تطبيقات الويب وتطوير قوالب WordPress.

تفيد الطالب التقني في بناء أساس برمجي واتباع خطة واضحة ثم ممارسة ما تعلمه من خلال التكليفات والمشروعات. اختر المسار المناسب لمستواك وراجع متطلباته قبل البدء.','الشرح باللغة العربية، مع استخدام المصطلحات البرمجية وأسماء الأدوات بالإنجليزية.','تتوفر شروحات ومسارات مجانية، بالإضافة إلى دورات مدفوعة منفصلة؛ تحقق من صفحة الدورة قبل التسجيل.','published',array['تعلم ذاتي','مسارات تعليمية'] where not exists(select 1 from public.providers where official_url='https://elzero.org/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c008',id from public.fields where id='software' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c008') on conflict do nothing;
commit;
