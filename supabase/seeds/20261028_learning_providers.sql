-- Sources checked: 2026-10-28
-- https://learn.microsoft.com/en-us/training/support/faq
-- https://skillsbuild.org/learning-catalog
-- https://aws.amazon.com/training/digital/
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) values ('8ddcccf6-9dfd-43ef-a106-3e29cd74c00e','Microsoft Learn','منصة مايكروسوفت للتعلم الذاتي، تقدم وحدات ومسارات تقنية تساعد على بناء المهارات خطوة بخطوة.','https://learn.microsoft.com/en-us/training/','تقدم Microsoft Learn محتوى تعليميًا منظمًا حول تقنيات مايكروسوفت، مع شروحات وتمارين تساعد على ربط المفاهيم بالتطبيق.

تشمل مجالات التعلم:
• البرمجة وتطوير تطبيقات الويب.
• الذكاء الاصطناعي وتعلم الآلة.
• تحليل البيانات وقواعد البيانات.
• الحوسبة السحابية وخدمات Azure.
• الأمن السيبراني وإدارة الهوية وحماية البيانات.

تفيد الطالب التقني في بناء أساس عملي والتعمق في مجال يختاره من خلال مسارات متدرجة. راجع متطلبات التمارين قبل البدء؛ قد يحتاج بعضها إلى أدوات أو خدمات إضافية.','يتوفر المحتوى بالإنجليزية ولغات أخرى؛ تختلف الترجمات حسب المسار والوحدة.','محتوى التعلم الذاتي مجاني؛ قد تتطلب اختبارات الشهادات أو الخدمات المستخدمة في بعض التمارين رسومًا منفصلة.','published',array['تعلم ذاتي','دورات','مسارات تعليمية']) on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00e',id from public.fields where id in ('software','ai-data','cyber-networks') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) values ('8ddcccf6-9dfd-43ef-a106-3e29cd74c00f','IBM SkillsBuild','منصة مجانية من IBM تقدم تعلمًا تقنيًا ومهنيًا عبر الإنترنت، مع مسارات تساعد على الاستعداد للعمل.','https://skillsbuild.org/adult-learners','تقدم IBM SkillsBuild دورات ومسارات لبناء المهارات التقنية، مع أنشطة تعليمية واعتمادات رقمية عند استيفاء متطلبات البرامج المؤهلة.

تشمل مجالات التعلم:
• تطوير البرمجيات وتطبيقات الويب.
• الذكاء الاصطناعي وتطبيقاته.
• علوم البيانات وتحليلها.
• أساسيات الأمن السيبراني.
• تقنية المعلومات والحوسبة السحابية.

تفيد الطالب التقني في استكشاف التخصصات وبناء مهارات تكمل الدراسة الجامعية. اختر المسار المناسب لمستواك، وراجع شروط التسجيل وإتاحة الأنشطة لكل برنامج.','تتوفر المنصة بلغات متعددة منها العربية والإنجليزية؛ تختلف لغة المحتوى حسب الدورة.','التعلم عبر IBM SkillsBuild مجاني؛ قد تختلف شروط الوصول لبعض البرامج والأنشطة.','published',array['تعلم ذاتي','دورات','مسارات تعليمية']) on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00f',id from public.fields where id in ('software','ai-data','cyber-networks') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) values ('8ddcccf6-9dfd-43ef-a106-3e29cd74c010','AWS Skill Builder','منصة أمازون ويب سيرفيسز للتعلم، تقدم دورات ومسارات لتطوير مهارات السحابة والذكاء الاصطناعي والأمن.','https://skillbuilder.aws/','تقدم AWS Skill Builder تعلمًا ذاتيًا وتدريبات عملية حول بناء الحلول وتشغيلها على سحابة AWS، من الأساسيات إلى موضوعات متقدمة.

تشمل مجالات التعلم:
• تطوير التطبيقات والخدمات السحابية.
• الذكاء الاصطناعي وتعلم الآلة.
• تحليل البيانات وهندستها.
• أمن السحابة وإدارة الصلاحيات.
• الشبكات والبنية التحتية السحابية.

تفيد الطالب التقني في فهم كيفية نشر التطبيقات وإدارة البيانات وحماية الأنظمة السحابية. ابدأ بالأساسيات ثم اختر مسارًا مرتبطًا باهتمامك، وتحقق من متطلبات المختبرات والخطة المتاحة.','تتوفر دورات بالإنجليزية والعربية ولغات أخرى؛ تختلف اللغة حسب الدورة.','تتوفر موارد ودورات مجانية، مع اشتراكات مدفوعة لمحتوى ومختبرات إضافية؛ اختبارات الشهادات منفصلة.','published',array['تعلم ذاتي','دورات','مسارات تعليمية']) on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c010',id from public.fields where id in ('software','ai-data','cyber-networks') on conflict do nothing;
commit;
