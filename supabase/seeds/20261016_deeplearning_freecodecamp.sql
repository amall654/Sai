-- Sources: https://www.deeplearning.ai/ ; https://www.freecodecamp.org/learn/
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c006','DeepLearning.AI','منصة متخصصة في تعليم الذكاء الاصطناعي، تقدم دورات ومسارات تجمع المفاهيم الأساسية والتطبيق العملي.','https://www.deeplearning.ai/','تقدم DeepLearning.AI محتوى تعليميًا لبناء المعرفة بالذكاء الاصطناعي وتطبيقاته، من المفاهيم التمهيدية إلى المهارات التقنية المتخصصة.

تشمل مجالات التعلم:
• تعلم الآلة والتعلم العميق.
• الذكاء الاصطناعي التوليدي والنماذج اللغوية.
• بناء تطبيقات ووكلاء الذكاء الاصطناعي.
• هندسة الأوامر وتطوير النماذج وتقييمها.

تفيد الطالب التقني في فهم كيفية عمل النماذج وتطبيقها في مشروعات عملية. تختلف المتطلبات بين الدورات؛ تحقق من مستوى البرمجة والرياضيات المطلوب قبل البدء.','الإنجليزية هي اللغة الأساسية؛ تختلف إتاحة الترجمة حسب الدورة ومنصة تقديمها.','يتوفر محتوى للمشاهدة مجانًا، بينما تتطلب بعض الأدوات والتقييمات والشهادات اشتراكًا مدفوعًا. تحقق من شروط كل برنامج.','published',array['دورات','مسارات تعليمية'] where not exists(select 1 from public.providers where official_url='https://www.deeplearning.ai/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c006',id from public.fields where id in ('ai-data') and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c006') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c007','freeCodeCamp','منصة تعليمية غير ربحية لتعلم البرمجة مجانًا، عبر دروس تفاعلية وتمارين ومشروعات تطبيقية.','https://www.freecodecamp.org/learn/','تتيح freeCodeCamp التعلم الذاتي من خلال كتابة الشيفرة وحل التمارين وبناء المشروعات، مع مسارات وشهادات مجانية عند استكمال متطلباتها.

تشمل مجالات التعلم:
• تطوير الويب والواجهات الأمامية.
• تطوير الخلفيات وواجهات برمجة التطبيقات.
• الخوارزميات وهياكل البيانات.
• قواعد البيانات والبرمجة بلغة بايثون.
• تحليل البيانات وتعلم الآلة.

تفيد الطالب التقني في ممارسة البرمجة بصورة منتظمة وبناء مشروعات تثبت مهاراته. يمكنه البدء بالأساسيات ثم الانتقال بين المسارات بحسب معرفته واهتمامه.','المحتوى الأساسي بالإنجليزية، وتتوفر ترجمات لبعض المحتوى بلغات أخرى؛ تحقق من لغة المسار.','الدروس والمشروعات والشهادات ضمن المنهج مجانية؛ التبرع اختياري.','published',array['تعلم ذاتي','مسارات تعليمية'] where not exists(select 1 from public.providers where official_url='https://www.freecodecamp.org/learn/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c007',id from public.fields where id in ('software','ai-data') and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c007') on conflict do nothing;
commit;
