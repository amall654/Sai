/* Supabase SDK handles authentication; only the public publishable key is shipped.
 * Tokens stay in sessionStorage (this tab), passwords are never stored by Sai.
 * Database RLS is the authority. All app accounts are students, never UI admins.
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
 client.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY')recovering=true;
  if(event==='SIGNED_OUT'){
   recovering=false;
   window.dispatchEvent(new Event('sai:signout'));
  }
 });
 window.SAI_BACKEND={
  async session(){const u=await current();return u?{id:u.id,name:u.user_metadata?.name||'طالب',role:'student'}:null;},
  async catalog(){
   const base=await window.SAI_CATALOG.catalog();
   const {data,error}=await client.rpc('sai_published_experiences');
   fail(error,'تعذّر تحميل تجارب الطلاب. حاول مرة أخرى.');
   return {...base,experiences:data.map(e=>({...e,publishedAt:e.published_at?new Date(e.published_at).toLocaleDateString('ar-SA'):''}))};
  },
  async login({email,password}){
   const {error}=await client.auth.signInWithPassword({email,password});
   fail(error,'تعذّر تسجيل الدخول. تحقق من البريد وكلمة المرور وتأكيد البريد، ثم حاول مجددًا.');
   return this.session();
  },
  async signup({name,email,password}){
   if(password.length<8)throw new Error('استخدم كلمة مرور من 8 خانات على الأقل.');
   const {data,error}=await client.auth.signUp({email,password,options:{data:{name:name.trim().slice(0,100)},emailRedirectTo:redirect()}});
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
  async profile(){const u=await requireUser();const {data,error}=await client.from('profiles').select('name,interests').eq('id',u.id).maybeSingle();fail(error,'تعذّر تحميل الحساب.');return data||{name:u.user_metadata?.name||'طالب',interests:[]};},
  async updateProfile({name,interests}){
   const u=await requireUser();
   const existing=await client.from('profiles').select('id').eq('id',u.id).maybeSingle();fail(existing.error,'تعذّر تحميل الحساب.');
   const values={name:name.trim(),interests:interests.slice(0,20)};
   const result=existing.data?await client.from('profiles').update(values).eq('id',u.id):await client.from('profiles').insert({id:u.id,...values});
   fail(result.error,'تعذّر حفظ بيانات الحساب.');
  },
  async saved(){await requireUser();const [o,p]=await Promise.all([client.from('saved_opportunities').select('opportunity_id'),client.from('saved_providers').select('provider_id')]);fail(o.error||p.error,'تعذّر تحميل المحفوظات.');return [...o.data.map(x=>({kind:'opportunity',id:x.opportunity_id})),...p.data.map(x=>({kind:'provider',id:x.provider_id}))];},
  async setSaved({kind,id,value}){
   const u=await requireUser();if(!['opportunity','provider'].includes(kind))throw new Error('عنصر غير صالح.');
   const table=kind==='opportunity'?'saved_opportunities':'saved_providers',column=kind+'_id';
   const result=value?await client.from(table).insert({[column]:id}):await client.from(table).delete().eq(column,id).eq('user_id',u.id);
   if(value&&result.error?.code==='23505')return;fail(result.error,'تعذّر حفظ التغيير.');
  },
  async submitExperience({title,body,field}){await requireUser();const {error}=await client.from('experiences').insert({title:title.trim(),body:body.trim(),field:field||''});fail(error,'تعذّر إرسال التجربة. لم يتم تأكيد حفظها؛ حاول مجددًا.');},
  async myExperiences(){const u=await requireUser();const {data,error}=await client.from('experiences').select('id,title,body,status').eq('user_id',u.id).order('created_at',{ascending:false});fail(error,'تعذّر تحميل تجاربك.');return data;},
  async addContent(){throw new Error('إدارة المحتوى متاحة حاليًا من لوحة Supabase فقط.');}
 };
})();
