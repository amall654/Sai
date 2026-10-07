-- Reviewed 2026-10-07. Run in Supabase SQL Editor as postgres.

-- Adds five published opportunities; does not overwrite existing rows.

-- Deadlines with no verified hour remain text; review/hide them manually after closing.

begin;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('d8d2a814-44ad-50a2-b609-4c707e23210a', 'هاكاثون الحلول المبتكرة لجودة الحياة', 'هاكاثون لطلاب وطالبات الجامعات السعودية ومنسوبيها، لتطوير حلول تقنية تحسن جودة الحياة. فرق من 3 إلى 5، مع تدريب افتراضي ومرحلة حضورية.', 'مقتطف قصير من المصدر:
من الفكرة … إلى المبادرة

هاكاثون لطلاب وطالبات الجامعات السعودية ومنسوبيها، لتطوير حلول تقنية تحسن جودة الحياة. فرق من 3 إلى 5، مع تدريب افتراضي ومرحلة حضورية.

تحقق من شروط الجهة قبل التسجيل. تمت مراجعة الصفحة في 7 أكتوبر 2026.', 'جامعة الأميرة نورة بنت عبدالرحمن', 'https://pnuhackathon.com/', 'https://pnuhackathon.com/', 'hackathon', 'حضوري وعن بُعد', null, 'آخر موعد للتسجيل: 11 أكتوبر 2026؛ ساعة الإغلاق غير معلنة.', 'published')
on conflict (id) do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('d8d2a814-44ad-50a2-b609-4c707e23210a','software') on conflict do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('d8d2a814-44ad-50a2-b609-4c707e23210a','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('fe845313-69db-5652-a5e7-110d29ff3aa6', 'Build With AI: Basics', 'ابنِ مشروعًا برمجيًا جديدًا باستخدام أدوات تطوير بالذكاء الاصطناعي وحزمة Devpost Learn. للمشاركين البالغين سن الرشد، مع تسليم نموذج يعمل ومستودع كود وفيديو.', 'مقتطف قصير من المصدر:
Learn AI best practices by creating a solid proof-of-concept

ابنِ مشروعًا برمجيًا جديدًا باستخدام أدوات تطوير بالذكاء الاصطناعي وحزمة Devpost Learn. للمشاركين البالغين سن الرشد، مع تسليم نموذج يعمل ومستودع كود وفيديو.

تحقق من شروط الجهة قبل التسجيل. تمت مراجعة الصفحة في 7 أكتوبر 2026.', 'Devpost', 'https://learn-ai-basics.devpost.com/', 'https://learn-ai-basics.devpost.com/', 'hackathon', 'عن بُعد', '2026-10-26T21:00:00Z', 'التسجيل والتسليم: 26 أكتوبر 2026، 5 مساءً EDT؛ يوافق 27 أكتوبر، 12 منتصف الليل بتوقيت السعودية.', 'published')
on conflict (id) do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('fe845313-69db-5652-a5e7-110d29ff3aa6','software') on conflict do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('fe845313-69db-5652-a5e7-110d29ff3aa6','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('29d75f34-3dfa-5062-af48-816b25df972a', 'Hyperbloom October — UI/UX and Web Design', 'هاكاثون تصميم للطلاب البالغين سن الرشد. يقبل نموذج Figma أو واجهة تفاعلية؛ مناسب لتجربة تصميم واجهات المستخدم. راجع الشروط الكاملة قبل المشاركة.', 'مقتطف قصير من المصدر:
Design something people will actually want to use.

هاكاثون تصميم للطلاب البالغين سن الرشد. يقبل نموذج Figma أو واجهة تفاعلية؛ مناسب لتجربة تصميم واجهات المستخدم. راجع الشروط الكاملة قبل المشاركة.

تحقق من شروط الجهة قبل التسجيل. تمت مراجعة الصفحة في 7 أكتوبر 2026.', 'Hyperbloom Hacks عبر Devpost', 'https://hyperbloom-october.devpost.com/', 'https://hyperbloom-october.devpost.com/', 'hackathon', 'عن بُعد', '2026-10-19T21:00:00Z', 'التسليم: 19 أكتوبر 2026، 5 مساءً EDT؛ يوافق 20 أكتوبر، 12 منتصف الليل بتوقيت السعودية.', 'published')
on conflict (id) do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('29d75f34-3dfa-5062-af48-816b25df972a','software') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('f4705957-d4e3-51e2-8e8f-0a362ee200d0', 'PayPal AI Hackathon', 'طوّر تطبيقًا يجمع منصة PayPal التجريبية مع أداة ذكاء اصطناعي. للمشاركين البالغين سن الرشد؛ يلزم تطبيق يعمل وكود مفتوح المصدر، وليس مجرد تصميم واجهة.', 'مقتطف قصير من المصدر:
Build what’s next with PayPal and AI

طوّر تطبيقًا يجمع منصة PayPal التجريبية مع أداة ذكاء اصطناعي. للمشاركين البالغين سن الرشد؛ يلزم تطبيق يعمل وكود مفتوح المصدر، وليس مجرد تصميم واجهة.

تحقق من شروط الجهة قبل التسجيل. تمت مراجعة الصفحة في 7 أكتوبر 2026.', 'PayPal / Devpost', 'https://paypalaihackathon.devpost.com/', 'https://paypalaihackathon.devpost.com/', 'hackathon', 'عن بُعد', '2026-11-12T20:00:00Z', 'التسليم: 12 نوفمبر 2026، 12 ظهرًا PST؛ يوافق 11 مساءً بتوقيت السعودية.', 'published')
on conflict (id) do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('f4705957-d4e3-51e2-8e8f-0a362ee200d0','software') on conflict do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('f4705957-d4e3-51e2-8e8f-0a362ee200d0','ai-data') on conflict do nothing;

insert into public.opportunities (id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,status)
values ('9dc04a51-9ce9-5074-a436-f3da1eb88241', 'ARC Prize 2026 — ARC-AGI-2', 'مسابقة ذكاء اصطناعي متقدمة لحل مسائل الاستدلال والتعميم. تقبل مشاركين دوليين وفق قواعد Kaggle وشرط العمر؛ مناسبة لمن لديه خبرة برمجية وبحثية.', 'مقتطف قصير من المصدر:
ARC Prize 2026 - ARC-AGI-2

مسابقة ذكاء اصطناعي متقدمة لحل مسائل الاستدلال والتعميم. تقبل مشاركين دوليين وفق قواعد Kaggle وشرط العمر؛ مناسبة لمن لديه خبرة برمجية وبحثية.

تحقق من شروط الجهة قبل التسجيل. تمت مراجعة الصفحة في 7 أكتوبر 2026.', 'ARC Prize / Kaggle', 'https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2', 'https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2', 'competition', 'عن بُعد', null, 'آخر موعد للانضمام وقبول القواعد: 26 أكتوبر 2026؛ يختلف عن موعد التسليم النهائي.', 'published')
on conflict (id) do nothing;

insert into public.opportunity_fields (opportunity_id,field_id) values ('9dc04a51-9ce9-5074-a436-f3da1eb88241','ai-data') on conflict do nothing;

commit;

select id,title,status from public.opportunities where id in ('d8d2a814-44ad-50a2-b609-4c707e23210a','fe845313-69db-5652-a5e7-110d29ff3aa6','29d75f34-3dfa-5062-af48-816b25df972a','f4705957-d4e3-51e2-8e8f-0a362ee200d0','9dc04a51-9ce9-5074-a436-f3da1eb88241');
