-- Reviewed 2026-10-08. Add five Saudi hackathons; no existing records changed.
-- Date-only deadlines conservatively hide at the start of the closing date (Asia/Riyadh).
begin;
insert into public.opportunities (id,title,source_name,source_url,registration_url,mode,deadline_at,deadline_text,description,original_text,type,status)
values ('f0082026-1008-4000-8000-000000000001','هاكاثون الفقد والهدر الغذائي','جامعة القصيم بالتعاون مع الهيئة العامة للأمن الغذائي','https://events.qu.edu.sa/qugfsa/','https://events.qu.edu.sa/qugfsa/joinhack/','حضوري وعن بُعد','2026-10-10T00:00:00+03:00','التسجيل حتى 10 أكتوبر 2026؛ الفعالية 22–23 أكتوبر.','تطوير حلول تقلل فقد الغذاء وهدره عبر مسارات تقنية وتصنيعية وتشغيلية وتجارية وتوعوية.','موجز للمشاركة:
المشاركة مجانية بفرق من 2 إلى 5 أعضاء. يستهدف الطلاب والباحثين والمطورين ورواد الأعمال والمهتمين بالغذاء والاستدامة. لا تشترط جميع المسارات خبرة تقنية.

تختار الفرق المشاركة حضوريًا في جامعة القصيم ببريدة أو عن بُعد. يتقدم قائد الفريق ببطاقة الفكرة؛ راجع الموقع الرسمي لمتطلبات الحضور والتسليم والشروط.','hackathon','published') on conflict (id) do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000001','software') on conflict do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000001','ai-data') on conflict do nothing;
insert into public.opportunities (id,title,source_name,source_url,registration_url,mode,deadline_at,deadline_text,description,original_text,type,status)
values ('f0082026-1008-4000-8000-000000000002','هاكاثون الابتكار الصحي — النسخة السابعة','جامعة الملك سعود بن عبدالعزيز للعلوم الصحية — حاضنة مشكاة','https://health-incubator.ksau-hs.edu.sa/hackathon','https://health-incubator.ksau-hs.edu.sa/tracks',null,'2026-11-15T23:59:00+03:00','آخر موعد للتسجيل: 15 نوفمبر 2026، الساعة 11:59 مساءً.','فرصة لتحويل الأفكار الصحية إلى حلول قابلة للتطبيق، عبر مسارات تتدرج من صناعة الحلول إلى النماذج الأولية والمشاريع والشركات.','موجز للمشاركة:
تتيح البوابة سبعة مسارات، منها صناعة الحلول والنماذج الأولية والمشاريع الواعدة والشركات الناشئة وبرامج الاحتضان والتسريع والمخيم التدريبي للدراسات العليا والطاولة المستديرة.

اختر المسار المناسب من بوابة الجهة للاطلاع على شروطه وطريقة حضوره. الصفحة العامة لم تعلن البرنامج العلمي التفصيلي بعد؛ لا تعني إتاحة التسجيل قبول المشاركة تلقائيًا.','hackathon','published') on conflict (id) do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000002','software') on conflict do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000002','ai-data') on conflict do nothing;
insert into public.opportunities (id,title,source_name,source_url,registration_url,mode,deadline_at,deadline_text,description,original_text,type,status)
values ('f0082026-1008-4000-8000-000000000003','هاكاثون الابتكار للتغيير نحو الأفضل 2026','وزارة الموارد البشرية والتنمية الاجتماعية','https://www.hrsd.gov.sa/knowledge-centre/initiatives/هاكاثون-الابتكار-للتغيير-نحو-الأفضل',null,null,'2026-11-05T00:00:00+03:00','التسجيل حتى 5 نوفمبر 2026؛ ساعة الإغلاق غير معلنة.','ابتكار حلول تستخدم الذكاء الاصطناعي والتقنيات الناشئة لتحسين خدمات الوزارة وتجربة المستفيد.','موجز للمشاركة:
توجد مسارات للطلاب والمحترفين والمهنيين وجهات المنظومة. يشترط أن يكون المشارك سعودي الجنسية وعمره 16 عامًا فأكثر؛ تتيح الشروط المشاركة الفردية أو فرقًا من 3 إلى 8 أعضاء.

تتناول الأفكار خدمات فعلية للوزارة، ويشترط أصالتها وقابليتها للتطبيق. راجع الإعلان الرسمي لمعرفة آلية تقديم الطلب ومتطلبات حضور المراحل؛ لم يحدد الإعلان المفتوح نمط الحضور تفصيليًا.','hackathon','published') on conflict (id) do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000003','software') on conflict do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000003','ai-data') on conflict do nothing;
insert into public.opportunities (id,title,source_name,source_url,registration_url,mode,deadline_at,deadline_text,description,original_text,type,status)
values ('f0082026-1008-4000-8000-000000000004','هاكاثون ناسا لتطبيقات الفضاء 2026 — المدينة المنورة','NASA Space Apps — فريق فعالية المدينة المنورة','https://sac.maiafuture.com/','https://www.spaceappschallenge.org/2026/local-events/madinah/','حضوري',null,'موعد الفعالية: 14–15 نوفمبر 2026؛ إغلاق التسجيل غير معلن في الصفحة المحلية.','تعاون في فريق لبناء حلول للأرض والفضاء باستخدام بيانات ناسا المفتوحة، بمشاركة مهارات البرمجة والتصميم والتحليل والسرد العلمي.','موجز للمشاركة:
الفعالية المحلية مجانية وحضورية في المدينة المنورة، وتستهدف المشاركين من عمر 18 عامًا فأكثر. يمكن البدء دون فريق؛ يتكون الفريق من 1 إلى 6 أعضاء بحسب دليل المشاركين.

التسجيل الرسمي عبر منصة Space Apps مع اختيار المدينة المنورة. يتحمل المشاركون ترتيبات السفر والسكن. راجع صفحة التسجيل لتوافر المقاعد والموعد النهائي.','hackathon','published') on conflict (id) do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000004','software') on conflict do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('f0082026-1008-4000-8000-000000000004','ai-data') on conflict do nothing;
insert into public.opportunities (id,title,source_name,source_url,registration_url,mode,deadline_at,deadline_text,description,original_text,type,status)
values ('f0082026-1008-4000-8000-000000000005','استدامة ثون — الاستدامة وجودة الحياة','جامعة الملك عبدالعزيز','https://kau.edu.sa/u/8l3rR','https://kau.edu.sa/u/8l3rR',null,'2026-10-30T00:00:00+03:00','التسجيل حتى 30 أكتوبر 2026؛ ساعة الإغلاق غير معلنة.','تطوير أفكار وحلول للاستدامة وتحسين جودة الحياة ضمن هاكاثون جامعة الملك عبدالعزيز.','موجز للمشاركة:
يشمل الإعلان حلولًا للبيئة والاقتصاد الدائري والمدن المستدامة والصحة والمجتمع والتعليم. استخدم رابط الجامعة الرسمي للوصول إلى نموذج المشاركة؛ يتطلب فتح النموذج تسجيل الدخول إلى Google.

راجع النموذج لشروط الأهلية ومتطلبات المشاركة ونمط الحضور. نُقل موعد الإغلاق من إعلان حساب الجامعة المفهرس، ولم نتمكن من قراءة محتوى النموذج المحمي بتسجيل الدخول.','hackathon','published') on conflict (id) do nothing;
commit;
