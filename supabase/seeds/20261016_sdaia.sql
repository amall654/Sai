-- Official sources: https://sdaia.gov.sa/ar/Sectors/BuildingCapacity/academy/Pages/default.aspx
-- https://sdaia.gov.sa/ar/Sectors/BuildingCapacity/academy/bootcamps/Pages/MachineLearning.aspx
begin;
insert into public.providers (id,name,description,official_url,details,language,cost,status,content_types) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c002','أكاديمية سدايا','جهة سعودية تقدم برامج ومعسكرات تدريبية في البيانات والذكاء الاصطناعي لتطوير المعرفة والمهارات التقنية والتطبيقية.','https://sdaia.gov.sa/ar/Sectors/BuildingCapacity/academy/Pages/default.aspx','أكاديمية سدايا مبادرة تابعة للهيئة السعودية للبيانات والذكاء الاصطناعي، تقدم برامج ومعسكرات تدريبية بالتعاون مع جامعات ومؤسسات متخصصة لتطوير المهارات في البيانات والذكاء الاصطناعي.

تشمل مجالات التدريب بحسب البرنامج:
• علوم البيانات.
• تعلّم الآلة.
• الذكاء الاصطناعي التوليدي.
• الرؤية الحاسوبية.
• معالجة اللغة الطبيعية.

تفيد الطالب التقني في التعمق في البيانات والذكاء الاصطناعي وربط المعرفة بالتطبيق، أو استكشاف مجال يرغب في التخصص فيه. تختلف الفئة المستهدفة والمستوى والمتطلبات ومواعيد التقديم بحسب البرنامج؛ راجع تفاصيله قبل التسجيل، فليست جميع البرامج مفتوحة دائمًا أو مناسبة للمبتدئين.','تحقق من لغة التدريب والمتطلبات اللغوية في تفاصيل كل برنامج.','راجع إعلان البرنامج لمعرفة الرسوم أو شروط الإتاحة؛ لا نفترض أن جميع البرامج مجانية.','published',array['برامج تدريبية','معسكرات'] where not exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c002' or official_url='https://sdaia.gov.sa/ar/Sectors/BuildingCapacity/academy/Pages/default.aspx') on conflict(id) do nothing;
insert into public.provider_fields(provider_id,field_id) select '8ddcccf6-9dfd-43ef-a106-3e29cd74c002',id from public.fields where id='ai-data' and exists(select 1 from public.providers where id='8ddcccf6-9dfd-43ef-a106-3e29cd74c002') on conflict do nothing;
commit;
