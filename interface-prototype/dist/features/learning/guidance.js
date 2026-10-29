/* Editorial directory guidance, reviewed 2026-10-28 against the provider descriptions.
   Levels describe available options, not every course. Unknown providers remain unclassified.
   Sources: https://elzero.org/ , https://skillsbuild.org/learning-catalog ,
   https://www.netacad.com/ , https://www.freecodecamp.org/learn/ . */
window.SaiLearningGuidance = {
 labels: {
  levels:{beginner:'مبتدئ',intermediate:'متوسط',advanced:'متقدم',variable:'بحسب البرنامج'},
  costs:{free:'محتوى مجاني',mixed:'مجاني ومدفوع',paid:'مدفوع',variable:'بحسب البرنامج'},
  languages:{ar:'العربية',en:'الإنجليزية',variable:'بحسب البرنامج'}
 },
 // Only teaching languages supported by the directory information are classified.
 providers:{
  'coursera.org':{levels:['beginner','intermediate','advanced'],cost:'mixed',languages:['variable']},
  'sdaia.gov.sa':{levels:['variable'],cost:'variable',languages:['variable']},
  'tuwaiq.edu.sa':{levels:['variable'],cost:'variable',languages:['variable']},
  'nmkkn.com':{levels:['variable'],cost:'mixed',languages:['variable']},
  'learn.ihashplus.com':{levels:['variable'],cost:'paid',languages:['variable']},
  'deeplearning.ai':{levels:['beginner','intermediate','advanced'],cost:'mixed',languages:['en']},
  'freecodecamp.org':{levels:['beginner','intermediate','advanced'],cost:'free',languages:['en']},
  'elzero.org':{levels:['beginner','intermediate'],cost:'mixed',languages:['ar']},
  'maharatech.gov.eg':{levels:['beginner','intermediate'],cost:'free',languages:['ar','en']},
  'netacad.com':{levels:['beginner','intermediate','advanced'],cost:'free',languages:['ar','en']},
  'kaspersky.tuwaiq.edu.sa':{levels:['variable'],cost:'free',languages:['variable']},
  'tryhackme.com':{levels:['beginner','intermediate','advanced'],cost:'mixed',languages:['en']},
  'portswigger.net':{levels:['beginner','intermediate','advanced'],cost:'free',languages:['en']},
  'learn.microsoft.com':{levels:['beginner','intermediate','advanced'],cost:'free',languages:['en']},
  'skillsbuild.org':{levels:['beginner','intermediate'],cost:'free',languages:['variable']},
  'skillbuilder.aws':{levels:['beginner','intermediate','advanced'],cost:'mixed',languages:['ar','en']}
 },
 paths:[
  {id:'software',field:'البرمجة وهندسة البرمجيات',title:'ابدأ في البرمجة وتطوير الويب',
   intro:'أساسيات البرمجة والويب، ثم بناء مشروع وتطوير المهارات.',
   steps:[['elzero.org','تعلّم الأساسيات','ابدأ بأساسيات البرمجة والويب، وطبّق التمارين أثناء التعلم.'],
    ['freecodecamp.org','ابنِ مشروعًا','اختر مسارًا مناسبًا، ثم طبّق ما تعلمته في مشروع بسيط.'],
    ['learn.microsoft.com','وسّع مهاراتك','استكشف تطوير التطبيقات أو قواعد البيانات حسب اهتمامك.']]},
  {id:'ai-data',field:'الذكاء الاصطناعي وعلوم البيانات',title:'ابدأ في البيانات والذكاء الاصطناعي',
   intro:'مفاهيم البيانات والذكاء الاصطناعي، ثم التعلم والتطبيق العملي.',
   steps:[['skillsbuild.org','افهم المجال','ابدأ بمحتوى تأسيسي في البيانات والذكاء الاصطناعي.'],
    ['deeplearning.ai','طوّر معرفتك','اختر محتوى تمهيديًا، وراجع متطلبات البرمجة والرياضيات قبل التعمق.'],
    ['skillbuilder.aws','جرّب التطبيق','استكشف أساسيات تطبيقات البيانات والذكاء الاصطناعي في السحابة.']]},
  {id:'cyber-networks',field:'الأمن السيبراني والشبكات',title:'ابدأ في الأمن السيبراني',
   intro:'أساسيات الشبكات والأمن، ثم التدريب في مختبرات تفاعلية.',
   steps:[['netacad.com','أسّس معرفتك','ابدأ بأساسيات الشبكات ومقدمة الأمن السيبراني.'],
    ['tryhackme.com','تدرّب خطوة بخطوة','اختر مسارًا للمبتدئين وطبّق داخل المختبرات التدريبية.'],
    ['portswigger.net','استكشف أمن الويب','بعد الأساسيات، جرّب الدروس والمختبرات التمهيدية لأمن تطبيقات الويب.']]}
 ]
};
