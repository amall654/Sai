/* Owner-only UI. Every server operation independently verifies the owner UUID. */
window.SaiOwnerConsole = (() => {
 let snapshot=null, generation=0;
 const labels={pending:'قيد المراجعة',published:'منشورة',rejected:'تحتاج تعديلًا',draft:'مسودة',hidden:'مخفية'};
 const canUse=()=>user?.role==='admin';
 const field=(label,name,value='',type='text',required=false,max=160)=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value||'')}" ${required?'required':''} maxlength="${max}"></label>`;
 const select=(label,name,items,value)=>`<label>${label}<select name="${name}">${items.map(([id,text])=>`<option value="${id}" ${id===value?'selected':''}>${text}</option>`).join('')}</select></label>`;
 async function render(){
  const token=++generation;
  if(!canUse()){clear();$('#admin-content').innerHTML='<p class="empty">هذه المساحة متاحة لمالك المنصة فقط.</p>';return;}
  $('#admin-content').innerHTML='<p role="status">جارٍ تحميل لوحة الإدارة…</p>';
  try{
   const data=await api.ownerCatalog();
   if(token!==generation||!canUse())return;
   snapshot=data;
   $('#admin-content').innerHTML=`<p class="muted">إدارة الفرص ومراجعة تجارب الطلاب. التعديلات المحفوظة تنعكس على المنصة.</p><p id="owner-feedback" class="form-feedback" role="status" hidden></p><section class="owner-section"><div class="section-heading"><h2>الفرص</h2><button class="button" data-owner-new>إضافة فرصة</button></div><div class="owner-list">${data.opportunities.map(o=>`<article class="owner-row"><div><h3>${esc(o.title)}</h3><span class="badge">${labels[o.status]}</span></div><button class="button outline" data-owner-edit="${esc(o.id)}">تعديل</button></article>`).join('')||'<p>لا توجد فرص بعد.</p>'}</div></section><section class="owner-section"><h2>تجارب الطلاب</h2><label>حالة التجربة<select id="owner-story-filter"><option value="pending">قيد المراجعة</option><option value="all">جميع التجارب</option><option value="published">منشورة</option><option value="rejected">تحتاج تعديلًا</option></select></label><div id="owner-stories" class="owner-list"></div></section>`;
   renderStories();$('#owner-story-filter').onchange=renderStories;
  }catch{if(token===generation&&canUse())$('#admin-content').innerHTML='<p class="empty">تعذّر تحميل لوحة المالك. تحقق من صلاحية الحساب والاتصال.</p><button class="button outline" data-owner-reload>إعادة المحاولة</button>';}
 }
 function renderStories(){
  const state=$('#owner-story-filter').value;
  $('#owner-stories').innerHTML=snapshot.experiences.filter(e=>state==='all'||e.status===state).map(e=>`<article class="owner-row"><div><h3>${esc(e.title||'تجربة طالب')}</h3><span class="badge">${labels[e.status]}</span></div><button class="button outline" data-owner-story="${esc(e.id)}">قراءة ومراجعة</button></article>`).join('')||'<p class="empty">لا توجد تجارب بهذه الحالة.</p>';
 }
 function edit(id){
  if(!canUse()||!snapshot)return;
  const o=id?snapshot.opportunities.find(x=>x.id===id):{};if(!o)return;
  // Deadline inputs use the owner's browser timezone, explicitly shown to avoid ambiguity.
  const dt=o.deadline_at?new Date(o.deadline_at):null;
  const local=dt?new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().slice(0,16):'';
  show(id?'تعديل الفرصة':'إضافة فرصة',`<form id="owner-opportunity-form" class="platform-form">
   ${field('عنوان الفرصة','title',o.title,'text',true)}${field('الجهة المقدمة','source_name',o.source_name,'text',true)}
   ${select('نوع الفرصة','type',[['hackathon','هاكاثون'],['competition','مسابقة']],o.type||'hackathon')}
   ${select('طريقة المشاركة','mode',[['','غير معلنة'],['حضوري','حضوري'],['عن بُعد','عن بُعد'],['حضوري وعن بُعد','حضوري وعن بُعد']],o.mode||'')}
   ${field('الموعد كما ورد في الإعلان (اختياري)','deadline_text',o.deadline_text,'text',false,500)}
   ${field('وقت إغلاق التسجيل الدقيق (اختياري)','deadline_at',local,'datetime-local')}
   <p class="muted">الوقت حسب منطقة جهازك: ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}. اتركيه فارغًا إذا لم يعلن موعد دقيق.</p>
   <label>نبذة قصيرة<textarea name="description" required maxlength="500" rows="3">${esc(o.description||'')}</textarea></label>
   <label>نص الإعلان والتفاصيل<textarea name="original_text" required maxlength="20000" rows="8">${esc(o.original_text||'')}</textarea></label>
   ${field('رابط المصدر الرسمي','source_url',o.source_url,'url',true,2000)}${field('رابط التسجيل (اختياري)','registration_url',o.registration_url,'url',false,2000)}
   <fieldset><legend>المجالات (اختياري)</legend>${snapshot.fields.map(f=>`<label class="check-label"><input type="checkbox" name="fields" value="${esc(f.id)}" ${(o.fields||[]).includes(f.id)?'checked':''}>${esc(f.label)}</label>`).join('')}</fieldset>
   ${select('الحالة','status',[['draft','مسودة'],['published','منشورة'],['hidden','مخفية']],o.status||'draft')}
   <p id="owner-edit-feedback" class="form-feedback" role="status" hidden></p><button type="submit" class="button">حفظ الفرصة</button></form>`,true);
  $('#owner-opportunity-form').onsubmit=async event=>{
   event.preventDefault();const form=event.currentTarget;if(!form.reportValidity()||!canUse())return;
   await formRequest(form,'#owner-edit-feedback',async()=>{
    const fd=new FormData(form),values=Object.fromEntries(fd);values.fields=fd.getAll('fields');
    if(!safeURL(values.source_url)||(values.registration_url&&!safeURL(values.registration_url)))throw new Error('استخدم روابط تبدأ بـ https:// أو http://.');
    values.id=o.id||null;values.updated_at=o.updated_at||null;
    values.deadline_at=values.deadline_at?new Date(values.deadline_at).toISOString():null;
    await api.ownerSaveOpportunity(values);dialog.close();await render();status('#owner-feedback','تم حفظ الفرصة.');await loadCatalog();
   });
  };
 }
 function review(id){
  const e=snapshot?.experiences.find(x=>x.id===id);if(!e||!canUse())return;
  show(e.title||'تجربة طالب',`<div class="experience-detail-copy">${paragraphs(e.body)}</div><p>الحالة الحالية: ${labels[e.status]}</p><p id="owner-review-feedback" class="form-feedback" role="status" hidden></p><div class="owner-actions">${[['published','اعتماد ونشر'],['rejected','تحتاج تعديلًا'],['pending','إعادة للمراجعة / إخفاء']].filter(([s])=>s!==e.status).map(([s,l])=>`<button class="button ${s==='published'?'':'outline'}" data-owner-decision="${s}">${l}</button>`).join('')}</div>`,true);
  dialog.classList.add('experience-detail-dialog');
  dialog.querySelectorAll('[data-owner-decision]').forEach(button=>button.onclick=async()=>{
   if(!canUse())return;
   const buttons=[...dialog.querySelectorAll('[data-owner-decision]')];buttons.forEach(b=>b.disabled=true);
   try{await api.ownerReviewExperience(e.id,button.dataset.ownerDecision,e.status);dialog.close();await render();status('#owner-feedback','تم حفظ قرار المراجعة.');await loadCatalog();}
   catch(error){status('#owner-review-feedback',error.message,true);}finally{buttons.forEach(b=>b.disabled=false);}
  });
 }
 function clear(){generation++;snapshot=null;}
 document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!canUse())return;
  if(button.hasAttribute('data-owner-new'))edit();
  if(button.dataset.ownerEdit)edit(button.dataset.ownerEdit);
  if(button.dataset.ownerStory)review(button.dataset.ownerStory);
  if(button.hasAttribute('data-owner-reload'))render();
 });
 window.addEventListener('sai:signout',clear);
 return {render,clear};
})();
