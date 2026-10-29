/* Supabase SDK handles authentication; only the public publishable key is shipped.
 * Tokens stay in sessionStorage (this tab), passwords are never stored by Sai.
 * Database RLS is the authority. Owner role is verified by a database RPC, never user metadata.
 */
(() => {
 if (window.SAI_BACKEND || !['http:','https:'].includes(location.protocol)) return;
 // Email links can open a new tab. Only the temporary PKCE verifier is shared;
 // access and refresh tokens remain scoped to the current tab.
 const storage={
  getItem:key=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).getItem(key),
  setItem:(key,value)=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).setItem(key,value),
  removeItem:key=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).removeItem(key)
 };
 const client=window.supabase?.createClient('https://xzdhyccemkndxabwbrpe.supabase.co',
  'sb_publishable_s4IBiCHXNUIB2YkJnaV_LQ_Wm-K_02h', {
   auth:{storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}
  });
 if(!client)return;
 let recovering=new URLSearchParams(location.search).get('auth')==='recovery';
 const redirect=()=>location.origin+location.pathname;
 const fail=(error,message)=>{if(error)throw new Error(message);};
 async function current(){
  const {data:{session}}=await client.auth.getSession();
  if(!session)return null;
  const {data,error}=await client.auth.getUser();
  fail(error,'انتهت الجلسة أو تعذّر التحقق منها. سجّل الدخول مجددًا.');
  if(!data.user?.email_confirmed_at)throw new Error('تحقّق من بريدك قبل تسجيل الدخول.');
  return data.user;
 }
 async function requireUser(){const u=await current();if(!u)throw new Error('سجّل الدخول أولًا.');return u;}
 async function avatarUrl(u){
  if(u.user_metadata?.sai_avatar!==true)return '';
  const {data,error}=await client.storage.from('account-avatars').createSignedUrl(u.id+'/avatar.webp',3600);
  return error?'':data.signedUrl;
 }
 client.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY')recovering=true;
  if(event==='SIGNED_OUT'){
   recovering=false;
   window.dispatchEvent(new Event('sai:signout'));
  }
 });
 window.SAI_BACKEND={
  async session(){
   const u=await current();if(!u)return null;
   const {data:owner,error}=await client.rpc('sai_is_owner');
   // A missing owner migration must never break student login or grant authority.
   return {id:u.id,name:u.user_metadata?.name||'طالب',role:!error&&owner===true?'admin':'student',avatar:await avatarUrl(u)};
  },
  async catalog(){
   const base=await window.SAI_CATALOG.catalog();
   const {data,error}=await client.rpc('sai_published_experiences_v2');
   fail(error,'تعذّر تحميل تجارب الطلاب. حاول مرة أخرى.');
   return {...base,experiences:data.map(e=>({...e,publishedAt:e.published_at?new Date(e.published_at).toLocaleDateString('ar-SA'):''}))};
  },
  async loginGoogle(){
   const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect(),skipBrowserRedirect:true,queryParams:{prompt:'select_account'}}});
   fail(error,'تعذّر بدء الدخول بجوجل. تحقق من تفعيل الخدمة وحاول مجددًا.');
   if(!data?.url)throw new Error('تعذّر بدء الدخول بجوجل.');
   const destination=new URL(data.url);
   if(destination.origin!=='https://xzdhyccemkndxabwbrpe.supabase.co'||destination.pathname!=='/auth/v1/authorize')throw new Error('رابط تسجيل الدخول غير صالح.');
   location.assign(destination.href);
  },
  async login({email,password}){
   const {error}=await client.auth.signInWithPassword({email,password});
   fail(error,'تعذّر تسجيل الدخول. تحقق من البريد وكلمة المرور وتأكيد البريد، ثم حاول مجددًا.');
   return this.session();
  },
  async signup({name,email,password}){
   if(password.length<8)throw new Error('استخدم كلمة مرور من 8 خانات على الأقل.');
   const {data,error}=await client.auth.signUp({email,password,options:{data:{name:name.trim().slice(0,100)},emailRedirectTo:redirect()}});
   if(error?.code==='weak_password')throw new Error('استخدم 8 خانات على الأقل، تشمل حرفًا إنجليزيًا كبيرًا وصغيرًا ورقمًا ورمزًا.');
   if(['over_email_send_rate_limit','over_request_rate_limit'].includes(error?.code))throw new Error('تم بلوغ حد المحاولات أو رسائل البريد مؤقتًا. انتظر قليلًا ثم حاول مجددًا.');
   if(error?.code==='email_address_not_authorized')throw new Error('خدمة البريد التجريبية لا تسمح بإرسال التحقق لهذا العنوان بعد. تواصل مع مسؤول المنصة.');
   fail(error,'تعذّر إكمال التسجيل. تحقق من المدخلات أو حاول لاحقًا.');
   if(data.session)await client.auth.signOut({scope:'local'});
  },
  async resetPassword(email){
   const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:redirect()+'?auth=recovery'});
   if(error && !['user_not_found','email_not_confirmed'].includes(error.code))throw new Error('تعذّر إرسال طلب الاستعادة. حاول لاحقًا.');
  },
  async recoveryRequired(){return recovering && !!(await current());},
  async changePassword(password){
   if(!recovering || !(await current()))throw new Error('افتح رابط الاستعادة المرسل إلى بريدك.');
   if(password.length<8)throw new Error('استخدم كلمة مرور من 8 خانات على الأقل.');
   const {error}=await client.auth.updateUser({password});
   fail(error,'تعذّر تغيير كلمة المرور. جرّب كلمة مرور قوية أخرى أو اطلب رابطًا جديدًا.');
   recovering=false;await client.auth.signOut();
   history.replaceState(null,'',location.pathname+'#login');
  },
  async logout(){const {error}=await client.auth.signOut();fail(error,'تعذّر تسجيل الخروج. تحقق من الاتصال وحاول مجددًا.');},
  async profile(){const u=await requireUser();const {data,error}=await client.from('profiles').select('name,interests,learning_level').eq('id',u.id).maybeSingle();fail(error,'تعذّر تحميل الحساب.');return {...(data||{name:u.user_metadata?.name||'طالب',interests:[]}),avatar:await avatarUrl(u)};},
  async updateAvatar(blob){
   const u=await requireUser();
   if(!blob||blob.type!=='image/webp'||!blob.size||blob.size>262144)throw new Error('تعذّر تجهيز الصورة. اختر صورة أخرى.');
   const result=await client.storage.from('account-avatars').upload(u.id+'/avatar.webp',blob,{contentType:'image/webp',upsert:true,cacheControl:'0'});
   fail(result.error,'تعذّر حفظ الصورة. حاول مجددًا.');
   const updated=await client.auth.updateUser({data:{sai_avatar:true}});
   fail(updated.error,'تعذّر حفظ الصورة. حاول مجددًا.');
   const url=await avatarUrl({...u,user_metadata:{...u.user_metadata,sai_avatar:true}});
   if(!url)throw new Error('تعذّر تحميل الصورة المحفوظة. أعد فتح ملفك.');
   return url+'&v='+Date.now();
  },
  async updateProfile({name,interests}){
   const u=await requireUser();
   const existing=await client.from('profiles').select('id').eq('id',u.id).maybeSingle();fail(existing.error,'تعذّر تحميل الحساب.');
   const values={name:name.trim(),interests:interests.slice(0,20)};
   const result=existing.data?await client.from('profiles').update(values).eq('id',u.id):await client.from('profiles').insert({id:u.id,...values});
   fail(result.error,'تعذّر حفظ بيانات الحساب.');
  },
  async outcomes(){await requireUser();const {data,error}=await client.from('student_outcomes').select('kind,target_id,stage,helpful');fail(error,'تعذّر تحميل متابعتك.');return data;},
  async saveOutcome(kind,target,stage,helpful){await requireUser();const {error}=await client.rpc('sai_save_outcome',{kind,target,stage,helpful});fail(error,'تعذّر حفظ إجابتك. حاول مجددًا.');},
  async reportContent(kind,target,reason,note){await requireUser();const {data,error}=await client.rpc('sai_submit_content_report',{kind,target,reason,note});fail(error,error?.message?.includes('Daily report limit')?'يمكن إرسال خمسة بلاغات خلال 24 ساعة. حاول لاحقًا.':'تعذّر إرسال البلاغ. حاول مجددًا.');return data;},
  async ownerEngagement(){await requireUser();const {data,error}=await client.rpc('sai_owner_engagement');fail(error,'تعذّر تحميل البلاغات وملخص الاستفادة.');return data;},
  async ownerReviewReport(target,decision,expected_updated){await requireUser();const {error}=await client.rpc('sai_owner_review_report',{target,decision,expected_updated});fail(error,error?.code==='40001'?'تغير البلاغ. أعيدي تحميل القائمة.':'تعذّر حفظ حالة البلاغ.');},
  async learningProgress(){await requireUser();const {data,error}=await client.from('learning_progress').select('path_id,step_key,state,updated_at');fail(error,'تعذّر تحميل تقدم التعلم.');return data;},
  async saveLearningProgress(path,step,state){await requireUser();const {error}=await client.rpc('sai_save_learning_progress',{path,step,new_state:state});fail(error,'تعذّر حفظ التقدم. حاول مجددًا.');},
  async saveLearningPreferences(level,interests){await requireUser();const {error}=await client.rpc('sai_save_learning_preferences',{level,interests});fail(error,'تعذّر حفظ تفضيلات التعلم.');},
  async saved(){await requireUser();const [o,p]=await Promise.all([client.from('saved_opportunities').select('opportunity_id'),client.from('saved_providers').select('provider_id')]);fail(o.error||p.error,'تعذّر تحميل المحفوظات.');return [...o.data.map(x=>({kind:'opportunity',id:x.opportunity_id})),...p.data.map(x=>({kind:'provider',id:x.provider_id}))];},
  async setSaved({kind,id,value}){
   const u=await requireUser();if(!['opportunity','provider'].includes(kind))throw new Error('عنصر غير صالح.');
   const table=kind==='opportunity'?'saved_opportunities':'saved_providers',column=kind+'_id';
   const result=value?await client.from(table).insert({[column]:id}):await client.from(table).delete().eq(column,id).eq('user_id',u.id);
   if(value&&result.error?.code==='23505')return;fail(result.error,'تعذّر حفظ التغيير.');
  },
  async submitExperience({title,body,field,topic}){await requireUser();const {error}=await client.from('experiences').insert({title:title.trim(),body:body.trim(),field:field||'',topic:topic||'تجربة أخرى'});fail(error,'تعذّر إرسال التجربة. لم يتم تأكيد حفظها؛ حاول مجددًا.');},
  async myExperiences(){const u=await requireUser();const {data,error}=await client.from('experiences').select('id,title,body,field,topic,status,review_note,revision').eq('user_id',u.id).order('created_at',{ascending:false});fail(error,'تعذّر تحميل تجاربك.');return data;},
  async resubmitExperience(target,expected_revision,payload){await requireUser();const {error}=await client.rpc('sai_resubmit_experience',{target,expected_revision,payload:{title:payload.title,body:payload.body,field:payload.field,topic:payload.topic}});fail(error,error?.code==='40001'?'تغيرت التجربة. أعد فتح ملفك قبل المحاولة.':'تعذّر إعادة إرسال التجربة. احتفظ بنصك وحاول مجددًا.');},
  async notifications(){await requireUser();const {data,error}=await client.rpc('sai_my_notifications');fail(error,'تعذّر تحميل التنبيهات.');return data;},
  async readNotifications(target,through){await requireUser();const {error}=await client.rpc('sai_read_notifications',{target,through});fail(error,'تعذّر تحديث التنبيهات.');},
  async accountRequests(){await requireUser();const {data,error}=await client.from('account_requests').select('id,kind,message,status,response,created_at,revision').order('created_at',{ascending:false});fail(error,'تعذّر تحميل طلباتك.');return data;},
  async submitAccountRequest(kind,message){await requireUser();const {error}=await client.rpc('sai_submit_account_request',{kind,message});fail(error,error?.message?.includes('Daily request limit')?'يمكن إرسال ثلاثة طلبات خلال 24 ساعة.':'تعذّر إرسال الطلب. حاول مجددًا.');},
  async ownerAccountRequests(){await requireUser();const {data,error}=await client.rpc('sai_owner_account_requests');fail(error,'تعذّر تحميل طلبات الحسابات.');return data;},
  async ownerReplyAccountRequest(target,expected_revision,response,decision){await requireUser();const {error}=await client.rpc('sai_owner_reply_account_request',{target,expected_revision,response,decision});fail(error,error?.code==='40001'?'تغير الطلب. أعد تحميل القائمة.':'تعذّر حفظ الرد.');},
  async ownerUploadLogo(blob){
   await requireUser();const owner=await client.rpc('sai_is_owner');if(owner.error||owner.data!==true)throw new Error('هذه المساحة متاحة لمالك المنصة فقط.');
   if(blob.type!=='image/webp'||blob.size>262144)throw new Error('تعذّر تجهيز الشعار. اختر صورة أخرى.');
   const path='logos/'+crypto.randomUUID()+'.webp';const result=await client.storage.from('provider-logos').upload(path,blob,{contentType:'image/webp',cacheControl:'31536000',upsert:false});fail(result.error,'تعذّر رفع الشعار. حاول مجددًا.');return path;
  },
  async ownerSaveProvider(payload){await requireUser();const {data,error}=await client.rpc('sai_owner_save_provider',{payload});fail(error,error?.code==='40001'?'تم تعديل الجهة من مكان آخر. أغلقي النموذج وأعيدي تحميل اللوحة قبل المحاولة.':'تعذّر حفظ جهة التعلم. تحقق من الحقول وصلاحية الحساب.');return data;},
  async ownerHistory(){await requireUser();const {data,error}=await client.rpc('sai_owner_history');fail(error,'تعذّر تحميل السجل.');return data;} ,
  async ownerCatalog(){await requireUser();const {data,error}=await client.rpc('sai_owner_catalog');fail(error,'تعذّر تحميل إدارة المحتوى.');return data;},
  async ownerSaveOpportunity(payload){await requireUser();const {data,error}=await client.rpc('sai_owner_save_opportunity',{payload});fail(error,error?.code==='40001'?'تم تعديل الفرصة من مكان آخر. أغلقي النموذج وأعيدي تحميل اللوحة قبل المحاولة.':'تعذّر حفظ الفرصة. تحقق من الحقول وصلاحية الحساب.');return data;},
  async ownerReviewExperience(target,decision,expected_status,classification){await requireUser();const {error}=await client.rpc('sai_owner_review_experience_v2',{target,decision,expected_revision:classification.revision,classification,review_note:classification.review_note||''});fail(error,error?.code==='40001'?'تغيرت حالة التجربة. أعيدي تحميل اللوحة.':'تعذّر حفظ قرار المراجعة.');}

 };
})();
