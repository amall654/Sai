-- Official sources: https://tuwaiq.edu.sa/bootcamps ; https://www.nmkkn.com/
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c003','أكاديمية طويق','أكاديمية سعودية تقدم معسكرات وبرامج تقنية احترافية تركز على التطبيق العملي وتطوير المهارات.','https://tuwaiq.edu.sa/','تقدم أكاديمية طويق معسكرات وبرامج بالشراكة مع جهات تقنية وتعليمية، بمنهجية تركز على المشروعات والتطبيق العملي. كما توفر محتوى للتعلم الذاتي عبر منصة سطر التابعة لها.

تشمل مجالات التعلم بحسب البرنامج:
• البرمجة وهندسة البرمجيات وتطوير التطبيقات.
• البيانات والذكاء الاصطناعي.
• الأمن السيبراني.
• الحوسبة السحابية.
• تطوير الألعاب والواقع الافتراضي والمعزز.
• الروبوتات والطائرات دون طيار.

تفيد الطالب التقني في ممارسة المهارات وبناء المشروعات واستكشاف مسار تخصصي. تختلف الفئة المستهدفة والمتطلبات والمواعيد ونمط الحضور؛ راجع تفاصيل البرنامج قبل التقديم.','تختلف لغة التدريب والمتطلبات اللغوية حسب البرنامج؛ تحقق من تفاصيله.','توجد برامج تختلف في الرسوم وشروط الإتاحة؛ راجع إعلان البرنامج قبل التسجيل.','published',array['برامج تدريبية','معسكرات','تعلم ذاتي'] where not exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c003' or official_url='https://tuwaiq.edu.sa/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c003',id from public.fields where id in ('software','ai-data','cyber-networks') and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c003') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c004','نمكّن','منصة تعليمية تقدم معسكرات ودورات وورشًا في التصميم الرقمي وتجربة المستخدم وتوظيف أدوات الذكاء الاصطناعي.','https://www.nmkkn.com/','تقدم نمكّن معسكرات تطبيقية وورشًا ومسارات للتعلم الذاتي، مع تركيز على مهارات التصميم وصناعة المنتجات الرقمية واستخدام الأدوات الحديثة.

تشمل مجالات التعلم المتاحة:
• تصميم تجربة المستخدم وواجهات المستخدم.
• التصميم البصري والعروض التقديمية.
• النماذج الأولية التفاعلية وأدوات التصميم.
• توظيف الذكاء الاصطناعي في التصميم والإنتاجية.
• بناء نماذج المنتجات الرقمية بأدوات دون كود أو بمساعدة الذكاء الاصطناعي.

تفيد الطالب المهتم بتصميم التطبيقات والمواقع في تحويل أفكاره إلى واجهات ونماذج قابلة للتجربة وتطوير مهاراته العملية. اختر البرنامج بحسب مستواك، وراجع المواعيد وطريقة التقديم والمخرجات المتوقعة.','المحتوى التعريفي عربي؛ تحقق من لغة الشرح والمواد في صفحة كل برنامج.','تتوفر ورش مجانية ومعسكرات ومسارات مدفوعة. تحقق من السعر وشروط التسجيل في صفحة البرنامج.','published',array['معسكرات','ورش','تعلم ذاتي'] where not exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c004' or official_url='https://www.nmkkn.com/') on conflict(id) do nothing;
commit;