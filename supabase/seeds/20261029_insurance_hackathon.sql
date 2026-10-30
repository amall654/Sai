-- Verified official announcement: 18 October 2026; checked 29 October 2026.
-- https://www.ia.gov.sa/en/media-center/news/135
-- Date-only deadline follows Sai's existing Saudi end-of-day policy.
begin;
do $$
declare owner_id uuid;
begin
 select user_id into owner_id from sai_private.owner_account;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 if not exists(select 1 from public.opportunities where registration_url='https://il.ia.gov.sa/programs/hackathon-1') then
 perform public.sai_owner_save_opportunity($content${"title": "هاكاثون التأمين 2026", "description": "هاكاثون حضوري في الرياض لتحويل تحديات التأمين إلى حلول تقنية ونماذج أولية، بمسارات للذكاء الاصطناعي والبيانات والخدمات الرقمية.", "original_text": "المواعيد: التسجيل حتى 7 نوفمبر 2026؛ الفرز من 7 إلى 10 نوفمبر، والهاكاثون من 12 إلى 14 نوفمبر في الكراج بالرياض. يُكرّم الفائزون خلال مؤتمر ingate من 16 إلى 18 نوفمبر.\n\nالفئة المستهدفة: طلاب الجامعات والمطورون والتقنيون والمبتكرون ورواد الأعمال والشركات الناشئة والمتخصصون في تقنية التأمين. تُراجع شروط القبول ومتطلبات الفريق في رابط الجهة.\n\nالمسارات: تجربة العميل والخدمات الرقمية، الذكاء الاصطناعي والبيانات، التأمين المدمج وعند الطلب، والفعاليات الكبرى والحشود. مجموع الجوائز 560 ألف ريال، مع دعم وإرشاد وفرص انتقال للمشاريع المميزة إلى برامج منظومة الابتكار.", "source_name": "هيئة التأمين", "source_url": "https://www.ia.gov.sa/en/media-center/news/135", "registration_url": "https://il.ia.gov.sa/programs/hackathon-1", "type": "hackathon", "mode": "حضوري", "status": "published", "registration_kind": "date", "registration_date": "2026-11-07", "deadline_text": "آخر يوم للتسجيل: 2026-11-07 (بتوقيت السعودية)", "fields": ["software", "ai-data"]}$content$::jsonb);
 end if;
end;$$;
commit;
