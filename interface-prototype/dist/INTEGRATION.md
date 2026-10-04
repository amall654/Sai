# سعي — تسليم واجهات تجربة المستخدم

العمل على فرع `ux-amal` فقط. لا تنتقل إلى `main` دون طلب صريح من صاحبة المشروع.

## الحالة

الهيكل والهوية الحالية محفوظان. الواجهة تدعم التصفح، الفلاتر، البحث في جهات التعلم، تفاصيل المحتوى وروابطه، نماذج الحساب، بوابة تسجيل الدخول للحفظ والمشاركة، الملف الشخصي، المحفوظات وإضافة المحتوى للمسؤول. لا توجد قاعدة بيانات أو مصادقة أو ذكاء اصطناعي منفّذ. لا تحفظ الواجهة كلمات المرور أو المحتوى الخاص في localStorage. التسجيل الصوتي وإعادة الصياغة مؤجلان.

البيانات الحالية في content.js أمثلة موروثة؛ لم تتحول إلى فرص أو تجارب حقيقية. الروابط الرسمية تظهر فقط عند وجود رابط صالح في المحتوى. لا تنشر هذه البيانات بوصفها فرصًا فعلية.

## عقد الربط

فريق الخلفية يضيف ملفًا قبل services.js يعرّف `window.SAI_BACKEND`. كل دالة تعيد Promise وترفض عند الفشل برسالة آمنة للمستخدم. عند غياب الربط تعرض القوائم بيانات content.js، وترفض جميع عمليات الحساب والحفظ والنشر دون نجاح وهمي.

| الدالة | المدخل | الناتج |
|---|---|---|
| session | لا شيء | null أو {id,name,role}؛ role يساوي student أو admin |
| catalog | لا شيء | {opportunities,providers,experiences,interests,opportunityTypes} |
| login | {email,password} | مستخدم مؤكد {id,name,role} |
| signup | {name,email,password} | نجاح إنشاء الحساب وإرسال التحقق؛ لا تبدأ الواجهة جلسة تلقائية |
| resetPassword | email | نجاح محايد لا يكشف وجود حساب |
| logout | لا شيء | نجاح إنهاء الجلسة |
| saved | لا شيء | [{kind:'opportunity' أو 'provider',id}] للمستخدم الحالي |
| setSaved | {kind,id,value:boolean} | نجاح العملية |
| profile | لا شيء | {name,college,major,year,bio,interests:[],skills:[]} |
| updateProfile | بيانات الملف نفسها | نجاح الحفظ |
| addProfileRecord | {kind:'achievements' أو 'certificates',title,description,url} | نجاح إضافة سجل خاص للمستخدم |
| myExperiences | لا شيء | [{id,title,body,status:'pending' أو 'published' أو 'rejected'}] |
| submitExperience | {title,body,field} | نجاح الإرسال للمراجعة |
| addContent | {kind,title,sourceName,originalText,sourceUrl,attachmentUrl,fields:[],type,mode,deadline,status} | نجاح الإضافة |

تتحقق الخلفية من الجلسة والصلاحيات في كل عملية. فحص admin في الواجهة لإظهار النموذج فقط وليس حماية أمنية. submitExperience يجب أن يفرض pending، وألا يقبل نشر الطالب مباشرة. لا تُرجع catalog مسودات أو محتوى خاصًا. لا تُمرر كلمات المرور إلى سجلات الأخطاء.

## حقول العرض

- الفرصة: id,title,description,originalText,sourceName,sourceUrl,registrationUrl,fields[],type,mode,publishedAt,deadline,attachments:[{name,url}],status. التفاصيل تعرض originalText دون إعادة صياغة. دعم details القديم للتوافق مع الأمثلة.
- الجهة: id,name,mark,description,details,url,fields[],contentTypes[],language,cost,status.
- التجربة: id,title,description,body,field,initial,publishedAt,status. لا تعرض إلا المنشور.
- غياب اللغة أو التكلفة يعرض «تحقق من الموقع الرسمي». غياب رابط رسمي لا ينشئ رابطًا تخمينيًا.

عند إضافة جهة عبر addContent، تحوّل الخلفية title إلى name وsourceUrl إلى url وoriginalText إلى details، وتجهز description للبطاقة. عند إضافة فرصة تحافظ على النص الأصلي. الموعد حاليًا نص مصدر؛ تتولى الخلفية تحديد انتهاء الصلاحية وحالة النشر.

## ما يبقى لفريق الخلفية

المصادقة والتحقق من البريد، استرجاع الجلسات، الصلاحيات، التخزين، اعتماد التجارب ومراجعتها، إدارة الروابط والمحتوى الحقيقي. يعيد profile أيضًا achievements وcertificates كمصفوفات من {title,description,url}، وجميعها خاصة افتراضيًا. رفع ملفات فعلية وتعديل تجربة مرسلة وحذفها مؤجل. لا تعلن المنصة جاهزة للإطلاق قبل وصل هذه الخدمات واختبارها.

## اختبار الربط

اختبر تسجيل الدخول الناجح والفاشل، العودة للحفظ بعد الدخول، فشل حفظ عنصر دون تغيّر حالته، القوائم الفارغة والخطأ وإعادة المحاولة، حساب طالب مقابل مسؤول، إرسال تجربة ثم ظهور pending، والخروج الذي يمسح بيانات المستخدم المعروضة. اختبر ذلك أيضًا على شاشة هاتف ولوحة المفاتيح.
