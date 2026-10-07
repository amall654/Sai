-- Reviewed 2026-10-07. Correct five catalog opportunities without deleting records.
begin;

update public.opportunities set status='hidden' where (id,source_url) in (
('fe845313-69db-5652-a5e7-110d29ff3aa6'::uuid,'https://learn-ai-basics.devpost.com/'),
('29d75f34-3dfa-5062-af48-816b25df972a'::uuid,'https://hyperbloom-october.devpost.com/'),
('f4705957-d4e3-51e2-8e8f-0a362ee200d0'::uuid,'https://paypalaihackathon.devpost.com/'));

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('d8d2a814-44ad-50a2-b609-4c707e23210a','هاكاثون الحلول المبتكرة لجودة الحياة','ابتكر حلولًا تقنية لجودة الحياة ضمن فريق من 3–5 أعضاء. يشترط قائدًا طالبًا جامعيًا سعودي الجنسية، ومشرفًا من الهيئة التعليمية أو الإدارية، وعضوًا ذا خبرة تقنية؛ جميع الأعضاء 18 عامًا فأكثر.','ملخص عربي للمشاركة:
ابتكر حلولًا تقنية لجودة الحياة ضمن فريق من 3–5 أعضاء. يشترط قائدًا طالبًا جامعيًا سعودي الجنسية، ومشرفًا من الهيئة التعليمية أو الإدارية، وعضوًا ذا خبرة تقنية؛ جميع الأعضاء 18 عامًا فأكثر.

تُقدّم الفكرة والوثائق بالعربية. يلزم حضور عضوين على الأقل في المرحلة الحضورية، وأن يكون المشروع جديدًا لم يسبق تقديمه أو الفوز به أو تمويله في مسابقة. المعسكر الافتراضي 18–22 أكتوبر، والأيام الحضورية 8–10 نوفمبر 2026. يتولى قائد الفريق التسجيل، وتخضع المشاركة لبقية شروط الجهة.

تمت مراجعة المصدر في 7 أكتوبر 2026. راجع الصفحة الرسمية للشروط والتحديثات قبل التسجيل.','جامعة الأميرة نورة بنت عبدالرحمن','https://pnuhackathon.com/','https://pnuhackathon.com/','hackathon','حضوري وعن بُعد',null,'آخر موعد للتسجيل: 11 أكتوبر 2026؛ ساعة الإغلاق غير موثقة.','published')
on conflict (id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status;
insert into public.opportunity_fields(opportunity_id,field_id) values ('d8d2a814-44ad-50a2-b609-4c707e23210a','software') on conflict do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('d8d2a814-44ad-50a2-b609-4c707e23210a','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('9dc04a51-9ce9-5074-a436-f3da1eb88241','ARC Prize 2026 — ARC-AGI-2','مسابقة متقدمة لبناء نماذج ذكاء اصطناعي تحل مسائل الاستدلال والتعميم. مناسبة لأصحاب الخبرة البرمجية والبحثية، وتخضع لشروط العمر والإقامة لدى المنظم.','ملخص عربي للمشاركة:
مسابقة متقدمة لبناء نماذج ذكاء اصطناعي تحل مسائل الاستدلال والتعميم. مناسبة لأصحاب الخبرة البرمجية والبحثية، وتخضع لشروط العمر والإقامة لدى المنظم.

يتطلب حساب Kaggle وقبول قواعد المسابقة قبل موعد الانضمام. الحد العمري 18 عامًا أو سن الرشد المحلي، أيهما أكبر، مع القيود الجغرافية الواردة في القواعد. موعد الانضمام يسبق موعد التسليم؛ لا يكفي انتظار الموعد النهائي للتسجيل.

تمت مراجعة المصدر في 7 أكتوبر 2026. راجع الصفحة الرسمية للشروط والتحديثات قبل التسجيل.','ARC Prize / Kaggle','https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2','https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2','competition','عن بُعد','2026-10-26T23:59:00Z','الانضمام حتى 26 أكتوبر 2026، 23:59 UTC؛ التسليم النهائي 2 نوفمبر، 23:59 UTC.','published')
on conflict (id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status;
insert into public.opportunity_fields(opportunity_id,field_id) values ('9dc04a51-9ce9-5074-a436-f3da1eb88241','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('93d28d06-395e-4b14-a6b7-d35999a50001','Google — Gemma 4 Developer Agent','مسابقة متقدمة لتطوير وكيل برمجي باستخدام Gemma 4 يستطيع التعامل مع مستودعات الكود وحل مشكلات برمجية. مناسبة لمن لديه خبرة في هندسة البرمجيات والنماذج اللغوية.','ملخص عربي للمشاركة:
مسابقة متقدمة لتطوير وكيل برمجي باستخدام Gemma 4 يستطيع التعامل مع مستودعات الكود وحل مشكلات برمجية. مناسبة لمن لديه خبرة في هندسة البرمجيات والنماذج اللغوية.

تتطلب المسابقة إعداد وكيل وفق نموذج Gemma المحدد وقالب التسليم المعتمد. يلزم حساب Kaggle وقبول القواعد؛ العمر 18 عامًا أو سن الرشد المحلي، أيهما أكبر، مع قيود الإقامة والعقوبات المذكورة لدى المنظم. مسار الورقة البحثية اختياري ومنفصل، وموعده 12 نوفمبر.

تمت مراجعة المصدر في 7 أكتوبر 2026. راجع الصفحة الرسمية للشروط والتحديثات قبل التسجيل.','Google DeepMind / Kaggle','https://www.kaggle.com/competitions/gemma-4-developer-agent','https://www.kaggle.com/competitions/gemma-4-developer-agent','competition','عن بُعد','2026-11-25T23:59:00Z','الانضمام حتى 25 نوفمبر 2026، 23:59 UTC؛ التسليم النهائي 2 ديسمبر، 23:59 UTC.','published')
on conflict (id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status;
insert into public.opportunity_fields(opportunity_id,field_id) values ('93d28d06-395e-4b14-a6b7-d35999a50001','software') on conflict do nothing;
insert into public.opportunity_fields(opportunity_id,field_id) values ('93d28d06-395e-4b14-a6b7-d35999a50001','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('93d28d06-395e-4b14-a6b7-d35999a50002','توقع رضا المسافرين — Kaggle Playground','مسابقة بيانات مناسبة للتدريب على تعلم الآلة: ابنِ نموذجًا يتوقع رضا المسافرين وجرّب تحسين البيانات والخصائص ودقة التوقع. من سلسلة Kaggle الموجهة للتعلّم والممارسة.','ملخص عربي للمشاركة:
مسابقة بيانات مناسبة للتدريب على تعلم الآلة: ابنِ نموذجًا يتوقع رضا المسافرين وجرّب تحسين البيانات والخصائص ودقة التوقع. من سلسلة Kaggle الموجهة للتعلّم والممارسة.

تُسلّم التوقعات في ملف CSV وفق صيغة المسابقة، ويُقيّم النموذج بمقياس ROC AUC. يلزم حساب Kaggle وقبول القواعد؛ العمر 18 عامًا أو سن الرشد المحلي، أيهما أكبر، مع قيود الإقامة المحددة. الجوائز المعلنة منتجات Kaggle وليست جوائز نقدية.

تمت مراجعة المصدر في 7 أكتوبر 2026. راجع الصفحة الرسمية للشروط والتحديثات قبل التسجيل.','Kaggle','https://www.kaggle.com/competitions/playground-series-s6e10','https://www.kaggle.com/competitions/playground-series-s6e10','competition','عن بُعد','2026-10-31T23:59:00Z','الانضمام والتسليم حتى 31 أكتوبر 2026، 23:59 UTC (1 نوفمبر، 2:59 صباحًا بتوقيت السعودية).','published')
on conflict (id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status;
insert into public.opportunity_fields(opportunity_id,field_id) values ('93d28d06-395e-4b14-a6b7-d35999a50002','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('93d28d06-395e-4b14-a6b7-d35999a50003','Titanic — مسابقة تدريبية للمبتدئين','مسابقة تدريبية مستمرة لتعلم أساسيات تعلم الآلة: استخدم بيانات ركاب Titanic لبناء نموذج يتوقع النجاة، ثم ارفع توقعاتك وقارن نتيجتك بلوحة الترتيب. مناسبة كبداية قبل المسابقات المتقدمة.','ملخص عربي للمشاركة:
مسابقة تدريبية مستمرة لتعلم أساسيات تعلم الآلة: استخدم بيانات ركاب Titanic لبناء نموذج يتوقع النجاة، ثم ارفع توقعاتك وقارن نتيجتك بلوحة الترتيب. مناسبة كبداية قبل المسابقات المتقدمة.

تتوفر بيانات تدريب واختبار ودليل للمبتدئين على صفحة المسابقة. يلزم حساب Kaggle وقبول القواعد، ومنها شرط العمر 18 عامًا أو سن الرشد المحلي، أيهما أكبر، وقيود الإقامة. نعرضها كفرصة ممارسة مستمرة، دون وعد بجائزة نقدية أو شهادة.

تمت مراجعة المصدر في 7 أكتوبر 2026. راجع الصفحة الرسمية للشروط والتحديثات قبل التسجيل.','Kaggle','https://www.kaggle.com/competitions/titanic','https://www.kaggle.com/competitions/titanic','competition','عن بُعد',null,'مسابقة تدريبية مستمرة؛ لا يوجد موعد إغلاق محدد.','published')
on conflict (id) do update set title=excluded.title,description=excluded.description,original_text=excluded.original_text,source_name=excluded.source_name,source_url=excluded.source_url,registration_url=excluded.registration_url,type=excluded.type,mode=excluded.mode,deadline_at=excluded.deadline_at,deadline_text=excluded.deadline_text,status=excluded.status;
insert into public.opportunity_fields(opportunity_id,field_id) values ('93d28d06-395e-4b14-a6b7-d35999a50003','ai-data') on conflict do nothing;

commit;

select title,status from public.opportunities order by created_at;
