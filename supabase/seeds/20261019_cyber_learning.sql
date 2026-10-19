-- Official sources: https://maharatech.gov.eg/ ; https://www.netacad.com/ ; https://kaspersky.tuwaiq.edu.sa/
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c009','مهارة تك','منصة تعليمية من معهد تكنولوجيا المعلومات المصري، تقدم تعلمًا ذاتيًا ومسارات تقنية تشمل الأمن السيبراني.','https://maharatech.gov.eg/','تقدم مهارة تك محتوى تقنيًا عبر الإنترنت، مع أكاديمية للأمن السيبراني تستهدف مستويات مختلفة من المبتدئين إلى المتخصصين.

تشمل مجالات التعلم:
• أساسيات الأمن السيبراني وأمن المعلومات.
• الشبكات وتأمينها.
• اختبار الاختراق وأمن تطبيقات الويب.
• التحليل الجنائي الرقمي والاستجابة للحوادث.
• تحليل البرمجيات الخبيثة.

تفيد الطالب التقني في بناء أساس أمني واختيار مسار أكثر تخصصًا. تختلف المتطلبات وإتاحة التسجيل بين المقررات والمسارات؛ راجع صفحة المسار قبل البدء.','تتوفر مقررات بالعربية والإنجليزية؛ تحقق من لغة كل مقرر.','تتوفر مقررات مجانية في الأمن السيبراني؛ راجع شروط التسجيل وإتاحة المسارات المتخصصة.','published',array['تعلم ذاتي','مسارات تعليمية'] where not exists(select 1 from public.providers where official_url='https://maharatech.gov.eg/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c009',id from public.fields where id='cyber-networks' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c009') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00a','Cisco Networking Academy','منصة تعليمية من سيسكو تقدم دورات ومسارات عملية في الشبكات والأمن السيبراني والمهارات التقنية.','https://www.netacad.com/','تقدم Cisco Networking Academy تعلمًا ذاتيًا وبرامج بقيادة مدربين، مع أنشطة تطبيقية تساعد على فهم الشبكات وحمايتها.

تشمل مجالات التعلم:
• أساسيات الشبكات وإدارتها.
• الأمن السيبراني وحماية البيانات.
• أمن الشبكات والدفاع عنها.
• تحليل التهديدات وإدارتها.
• البرمجة وأساسيات Python.

تفيد الطالب التقني في ربط المفاهيم بالتطبيق وبناء مهارات للشبكات والأمن السيبراني. اختر المستوى المناسب وراجع متطلبات الدورة وطريقة تقديمها قبل التسجيل.','تتوفر دورات بالعربية وأخرى بالإنجليزية ولغات إضافية؛ تختلف اللغة حسب الدورة.','تتوفر دورات مجانية للتعلم الذاتي؛ تحقق من تكلفة البرامج المقدمة عبر الأكاديميات واختبارات الشهادات بشكل منفصل.','published',array['تعلم ذاتي','دورات','مسارات تعليمية'] where not exists(select 1 from public.providers where official_url='https://www.netacad.com/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00a',id from public.fields where id='cyber-networks' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c00a') on conflict do nothing;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00b','أكاديمية كاسبرسكي','أكاديمية متخصصة في الأمن السيبراني بالشراكة بين طويق وكاسبرسكي، تقدم برامج ومعسكرات قائمة على التطبيق العملي.','https://kaspersky.tuwaiq.edu.sa/','تقدم أكاديمية كاسبرسكي بالشراكة مع أكاديمية طويق برامج لتطوير المهارات السيبرانية، من خلال تدريب عملي يركز على حماية الأنظمة وفهم التهديدات.

تشمل مجالات التعلم:
• أساسيات ومفاهيم الأمن السيبراني.
• اكتشاف الثغرات الأمنية ومعالجتها.
• اختبار الاختراق وأدواته.
• حماية مواقع الويب والتطبيقات والأنظمة.
• تطبيقات الذكاء الاصطناعي في الأمن السيبراني.

تفيد الطالب التقني في تطوير مهارات أمنية تطبيقية والتعرف على أدوات المجال. القبول ومواعيد التسجيل ومتطلبات الحضور تحددها صفحة كل برنامج.','الموقع التعريفي بالعربية؛ تحقق من لغة التدريب والمواد في صفحة البرنامج.','التسجيل في معسكرات وبرامج الأكاديمية مجاني وفق الموقع الرسمي، مع استيفاء متطلبات القبول.','published',array['معسكرات','برامج تدريبية'] where not exists(select 1 from public.providers where official_url='https://kaspersky.tuwaiq.edu.sa/') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c00b',id from public.fields where id='cyber-networks' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c00b') on conflict do nothing;
commit;
