-- Official sources: https://tryhackme.com/ ; https://portswigger.net/web-security
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00c','TryHackMe','منصة لتعلم الأمن السيبراني بالتطبيق، تقدم مسارات موجهة ومختبرات تفاعلية تناسب مستويات مختلفة.','https://tryhackme.com/','تجمع TryHackMe الشرح والتدريب العملي في بيئات محاكاة، مع مسارات تبدأ بالأساسيات وتتدرج نحو المهارات الهجومية والدفاعية.

تشمل مجالات التعلم:
• أساسيات الأمن السيبراني والشبكات.
• اختبار الاختراق وأمن تطبيقات الويب.
• تحليل التهديدات والعمليات الأمنية.
• الدفاع عن الأنظمة والشبكات.
• التحقيقات الرقمية وأمن السحابة.

تفيد الطالب التقني في ممارسة ما يتعلمه خطوة بخطوة واختبار مهاراته داخل مختبرات تدريبية. اختر المسار المناسب لمستواك وراجع متطلباته وما تتضمنه خطة الاشتراك.','المحتوى الأساسي باللغة الإنجليزية.','تتوفر غرف تدريب مجانية بوصول محدود، مع اشتراكات مدفوعة تتيح محتوى وميزات إضافية حسب الخطة.','published',array['تعلم ذاتي','مسارات تعليمية','مختبرات تفاعلية'] where not exists(select 1 from public.providers where official_url='https://tryhackme.com/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00c',id from public.fields where id='cyber-networks' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c00c') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00d','PortSwigger Web Security Academy','أكاديمية مجانية متخصصة في أمن تطبيقات الويب، تجمع الدروس ومختبرات التدريب التفاعلية لفهم الثغرات واختبارها.','https://portswigger.net/web-security','تقدم Web Security Academy من PortSwigger مواد تعليمية ومسارات عملية تشرح ثغرات تطبيقات الويب، مع مختبرات لتطبيق المفاهيم وتتبع التقدم.

تشمل مجالات التعلم:
• أمن تطبيقات الويب واختبارها.
• ثغرات الحقن وقواعد البيانات.
• أمن المصادقة والتحكم في الوصول.
• ثغرات المتصفح والبرمجة النصية.
• أمن واجهات برمجة التطبيقات (API).

تفيد الطالب التقني في فهم أسباب الثغرات وتطوير مهارات اختبار أمن الويب من خلال التطبيق. ابدأ بالموضوعات الأساسية ثم انتقل إلى المختبرات المتقدمة حسب مستواك.','المحتوى الأساسي باللغة الإنجليزية.','المواد التعليمية ومختبرات الأكاديمية مجانية؛ الشهادات المهنية ومنتجات Burp Suite المدفوعة منفصلة عن المحتوى المجاني.','published',array['تعلم ذاتي','مسارات تعليمية','مختبرات تفاعلية'] where not exists(select 1 from public.providers where official_url='https://portswigger.net/web-security') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00d',id from public.fields where id='cyber-networks' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c00d') on conflict do nothing;
commit;
