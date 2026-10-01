/* سلوك النموذج التجريبي؛ لا توجد حسابات أو اتصالات بخادم. */
const data = window.SAI_CONTENT;
const icons = {
 arrow:'<path d="M19 12H5m6-6-6 6 6 6"/>',bookmark:'<path d="M6 4h12v17l-6-4-6 4V4Z"/>',book:'<path d="M12 5v15M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Z"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',sprout:'<path d="M12 22V11M12 15C3 15 2 8 3 4c7 0 10 4 9 11ZM12 11c0-7 5-9 10-8 0 7-4 10-10 8ZM7 22h10"/>',spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',chat:'<path d="M21 11a9 9 0 0 1-9 9H4l-3 2 2-7a9 9 0 1 1 18-4Z"/><path d="M7 10h10M7 14h6"/>',plus:'<path d="M12 4v16M4 12h16"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',flask:'<path d="M9 3h6M10 3v6l-7 11h18L14 9V3M7 15h10"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 3 13 3 18 0M12 12v4"/>',heart:'<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 0 9 8 16 8-7 12-12 8-16Z"/><path d="M5 12h4l2-3 3 6 2-3h3"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
let previewAccount=false;
let saved = new Set(); let activeInterest='الكل'; let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2800)}
function renderOpportunities(){
 const items=data.opportunities.filter(o=>activeInterest==='الكل'||o.category===activeInterest||(activeInterest==='التقنية'&&o.id==='health')||(activeInterest==='التصميم'&&o.id==='health'));
 document.querySelector('#opportunity-grid').innerHTML=items.map(o=>`<article class="card"><div class="card-top"><span class="category-icon ${esc(o.color)}">${icon(o.icon)}</span><button disabled title="معاينة فقط — الحفظ غير متاح" class="icon-button save-button ${saved.has(o.id)?'saved':''}" data-save="${esc(o.id)}" aria-label="${saved.has(o.id)?'إلغاء حفظ':'حفظ'} ${esc(o.title)}" aria-pressed="${saved.has(o.id)}">${icon('bookmark')}</button></div><span class="badge">${esc(o.category)}</span><h3>${esc(o.title)}</h3><p>${esc(o.description)}</p><div class="card-meta"><span>${icon('globe')}${esc(o.mode)}</span><span>${esc(o.type)}</span></div><div class="card-bottom"><span>مثال عرض · بلا موعد فعلي</span><button class="text-link" data-detail="${esc(o.id)}">التفاصيل ${icon('arrow')}</button></div></article>`).join('');
 document.querySelector('#empty-opportunities').hidden=items.length>0;
 const count=document.querySelector('#saved-count');count.textContent=saved.size;count.hidden=saved.size===0;
 document.querySelectorAll('.chip').forEach(c=>{c.classList.toggle('active',c.dataset.interest===activeInterest);c.setAttribute('aria-pressed',String(c.dataset.interest===activeInterest))});
}
document.querySelector('#interest-chips').innerHTML=data.interests.map(t=>`<button class="chip" data-interest="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('');
document.querySelector('#provider-grid').innerHTML=data.providers.map(p=>`<article class="provider-card"><span class="provider-monogram">${esc(p.mark)}</span><div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><button class="text-link" data-provider="${esc(p.id)}">عن الجهة ${icon('arrow')}</button></div></article>`).join('');
document.querySelector('#experience-grid').innerHTML=data.experiences.map(e=>`<article class="card experience-card"><div class="quote" aria-hidden="true">“</div><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p><div class="experience-author"><span class="avatar">${esc(e.initial)}</span><span>${esc(e.field)} · نص توضيحي</span></div><button class="text-link" data-experience="${esc(e.id)}">اقرأ التجربة ${icon('arrow')}</button></article>`).join('');
const dialog=document.querySelector('#detail-dialog');
function show(title,body){document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-body').innerHTML=body;if(!dialog.open)dialog.showModal();}
function showText(title,text){show(title,text.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join(''))}
function savedDialog(){showText('المحفوظات','معاينة فقط — الحفظ غير متاح. ستظهر هنا فرصك المحفوظة عند تفعيل الحسابات الحقيقية.');}
function setPreviewAccount(enabled){
 previewAccount=enabled;
 document.querySelectorAll('[data-guest-only]').forEach(el=>el.hidden=enabled);
 document.querySelector('#profile-link').hidden=!enabled;
 document.querySelector('#account-preview-notice').hidden=!enabled;
 const mobile=document.querySelector('#mobile-account-link');
 mobile.href=enabled?'#profile':'#login';mobile.dataset.nav=enabled?'profile':'login';
 document.querySelector('#mobile-account-label').textContent=enabled?'ملفي':'حسابي';
}
document.addEventListener('click',event=>{
 const el=event.target.closest('button');if(!el)return;
 if(el.dataset.interest){activeInterest=el.dataset.interest;renderOpportunities();return;}
 if(el.dataset.save){toast('معاينة فقط — الحفظ غير متاح');return;}
 if(el.dataset.detail){const o=data.opportunities.find(x=>x.id===el.dataset.detail);showText(o.title,o.details);return;}
 if(el.dataset.provider){const p=data.providers.find(x=>x.id===el.dataset.provider);showText(p.name,p.details);return;}
 if(el.dataset.experience){const e=data.experiences.find(x=>x.id===el.dataset.experience);showText(e.title,e.body);return;}
 const action=el.dataset.action;
 if(action==='preview-account'){setPreviewAccount(true);location.hash='home';route();return;}
 if(action==='exit-preview'){setPreviewAccount(false);location.hash='home';route();return;}
 if(action==='all'){activeInterest='الكل';renderOpportunities();}
 if(action==='saved')savedDialog();
 if(action==='contribute')showText('لكل تجربة مساحة','ستتمكن هنا من كتابة تجربتك أو تسجيلها صوتيًا عبر أسئلة موجهة، ثم مراجعة النص واعتماده قبل النشر.\n\nهذه النسخة لتجربة شكل الصفحات فقط، ولا تسجل صوتًا أو تنشر محتوى.');
 if(action==='signup')showText('إنشاء حساب','صفحة إنشاء الحساب تأتي في مرحلة ربط المنصة بالحسابات. حاليًا يمكنك استكشاف الرئيسية وتجربة البطاقات دون تسجيل.');
 if(action==='forgot')showText('استعادة كلمة المرور','هذا نموذج تصميم غير متصل بخدمة بريد أو حسابات. لم تُرسل رسالة استعادة.');
});
document.querySelector('#close-dialog').onclick=()=>dialog.close();
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
document.querySelector('#login-form').addEventListener('submit',event=>{event.preventDefault();showText('الدخول غير مفعّل في هذا النموذج','لم تُرسل أو تُحفظ أي بيانات. استخدم زر «استكشف النسخة التجريبية» لمعاينة الصفحة الرئيسية.');});
document.querySelector('#toggle-password').onclick=function(){const input=document.querySelector('#password');const showing=input.type==='password';input.type=showing?'text':'password';this.setAttribute('aria-pressed',String(showing));this.setAttribute('aria-label',showing?'إخفاء كلمة المرور':'إظهار كلمة المرور')};
const pageTitles={home:'مساحة لخطوتك القادمة',opportunities:'الفرص',learning:'جهات التعلم',experiences:'تجارب الطلاب',login:'تسجيل الدخول',profile:'ملفي'};
function route(){
 const requested=location.hash.slice(1)||'home';
 // The skip link focuses current content without changing the selected screen.
 if(requested==='main'){document.querySelector('#main').focus();return;}
 const target=Object.hasOwn(pageTitles,requested)?requested:'home';
 if(target==='profile')setPreviewAccount(true);
 if(target==='login')setPreviewAccount(false);
 if(target!==requested)history.replaceState(null,'','#home');
 document.querySelectorAll('[data-page]').forEach(page=>page.hidden=page.dataset.page!==target);
 document.querySelectorAll('[data-nav]').forEach(a=>{
  const selected=a.dataset.nav===target;
  a.classList.toggle('active',selected);
  if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 if(dialog.open)dialog.close();
 document.title='سعي | '+pageTitles[target];
 window.scrollTo({top:0,behavior:'instant'});
 const heading=document.querySelector(`[data-page="${target}"] h1`);
 if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
}
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();document.querySelector('#main').focus();});
window.addEventListener('hashchange',route);renderOpportunities();route();
// تحسين اختياري للتصفح المساعد؛ المتصفحات غير الداعمة تتجاهله.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({
  name:'filter_demo_opportunities',title:'تصفية أمثلة فرص سعي',
  description:'تغيير فلتر الاهتمام لأمثلة الفرص المعروضة في هذا النموذج فقط.',
  inputSchema:{type:'object',properties:{interest:{type:'string',enum:data.interests}},required:['interest'],additionalProperties:false},
  annotations:{readOnlyHint:false,untrustedContentHint:false},
  execute(input){if(!input||typeof input!=='object'||Object.keys(input).length!==1||!data.interests.includes(input.interest))throw new Error('اختر اهتمامًا من القائمة.');activeInterest=input.interest;renderOpportunities();location.hash='opportunities';return {interest:activeInterest,displayed:document.querySelector('#opportunity-grid').children.length,contentType:'demonstration'};}
 },{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
