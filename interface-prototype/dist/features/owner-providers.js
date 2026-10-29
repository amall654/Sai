/* Owner content tools. The server checks owner identity on every write. */
window.SaiOwnerProviders=(()=>{
 let data=null;
 const allowed=()=>user?.role==='admin';
 const labels={draft:'مسودة',published:'منشورة',hidden:'مخفية'};
 const stale=p=>!p.reviewed_at||Date.now()-Date.parse(p.reviewed_at)>90*86400000;
 const input=(label,name,value='',required=true,max=1000,type='text')=>`<label>${label}<input type="${type}" name="${name}" value="${esc(value)}" maxlength="${max}" ${required?'required':''}></label>`;
 const checks=(title,name,options,values)=>`<fieldset><legend>${title}</legend>${Object.entries(options).map(([key,label])=>`<label class="check-label"><input type="checkbox" name="${name}" value="${esc(key)}" ${values.includes(key)?'checked':''}>${esc(label)}</label>`).join('')}</fieldset>`;
 function mount(snapshot){
  data=snapshot;if(!allowed())return;
  data.providers=data.providers||[];
  const pending=data.experiences.filter(e=>e.status==='pending').length;
  const soon=data.opportunities.filter(o=>o.status==='published'&&o.deadline_at&&Date.parse(o.deadline_at)>Date.now()&&Date.parse(o.deadline_at)-Date.now()<=72*3600000).length;
  $('#admin-content').insertAdjacentHTML('afterbegin',`<details class="learning-paths"><summary>كيف أدير المحتوى؟</summary><ol><li>أضيفي فرصة أو جهة تعلم، ثم املئي المعلومات وروابط المصدر الرسمي.</li><li>ارفعي شعار الجهة من جهازك، وحددي المجالات والمستوى واللغة والتكلفة.</li><li>احفظي كمسودة للمراجعة، أو اختاري منشورة لعرض المحتوى للجميع.</li><li>استخدمي تعديل لتحديث المعلومات، أو مخفية لإيقاف العرض مع الاحتفاظ بالمحتوى.</li><li>راجعي تجارب الطلاب من قراءة ومراجعة، ثم اعتمدي المناسب للنشر.</li></ol><p>لإضافة تجربتك الشخصية، استخدمي شارك تجربتك ثم راجعيها من هذه اللوحة.</p></details><div class="owner-summary"><p><strong>${pending}</strong> <span>تجربة قيد المراجعة</span></p><p><strong>${soon}</strong> <span>فرصة تغلق خلال 3 أيام</span></p><p><strong>${data.providers.filter(stale).length}</strong> <span>جهة تحتاج مراجعة معلوماتها</span></p></div>`);
  const opportunityList=$('#admin-content .owner-list');
  opportunityList.insertAdjacentHTML('beforebegin','<div class="owner-filter"><label>تصفية الفرص<select id="owner-opportunity-filter"><option value="all">جميع الفرص</option><option value="active">المفتوحة</option><option value="soon">تغلق قريبًا</option><option value="expired">المنتهية</option><option value="draft">مسودة</option><option value="hidden">مخفية</option></select></label></div>');
  const updateOpportunities=()=>{const state=$('#owner-opportunity-filter').value;opportunityList.innerHTML=data.opportunities.filter(o=>{const remaining=o.deadline_at?Date.parse(o.deadline_at)-Date.now():Infinity;return state==='all'||(state==='active'&&o.status==='published'&&remaining>0)||(state==='soon'&&o.status==='published'&&remaining>0&&remaining<=72*3600000)||(state==='expired'&&remaining<=0)||o.status===state;}).map(o=>`<article class="owner-row"><div><h3>${esc(o.title)}</h3><span class="badge">${o.deadline_at&&Date.parse(o.deadline_at)<=Date.now()?((o.deadline_text||'').startsWith('موعد افتراضي من سعي:')?'انتهت فترة العرض في سعي':'انتهى التسجيل'):labels[o.status]}</span></div><button class="button outline" data-owner-edit="${esc(o.id)}">تعديل</button></article>`).join('')||'<p class="empty">لا يوجد محتوى مطابق.</p>';};
  $('#owner-opportunity-filter').onchange=updateOpportunities;
  $('#owner-stories').closest('section').insertAdjacentHTML('beforebegin',`<section class="owner-section" id="owner-provider-section"><div class="section-heading"><h2>جهات التعلم</h2><button class="button" data-owner-provider-new>إضافة جهة تعلم</button></div><div class="owner-provider-filters"><label>البحث عن جهة<input id="owner-provider-search" type="search" placeholder="اسم الجهة"></label><label>تصفية الجهات<select id="owner-provider-filter"><option value="all">جميع الجهات</option><option value="review">تحتاج مراجعة</option><option value="published">منشورة</option><option value="draft">مسودة</option><option value="hidden">مخفية</option></select></label></div><p class="muted">راجعي الروابط والمعلومات من الموقع الرسمي، ثم احفظي الجهة لتحديث تاريخ مراجعتها. يظهر تنبيه بعد 90 يومًا من آخر مراجعة.</p><div id="owner-provider-list" class="owner-list"></div></section>`);
  $('#owner-provider-search').oninput=renderList;$('#owner-provider-filter').onchange=renderList;renderList();window.SaiOwnerEngagement?.mount();window.SaiOwnerWorkflow.dashboard(data);
 }
 function renderList(){
  if(!allowed()||!data)return;
  const query=normal($('#owner-provider-search').value),filter=$('#owner-provider-filter').value;
  $('#owner-provider-list').innerHTML=data.providers.filter(p=>normal(p.name).includes(query)&&(filter==='all'||(filter==='review'?stale(p):p.status===filter))).map(p=>`<article class="owner-row"><div><h3>${esc(p.name)}</h3><span class="badge">${labels[p.status]}</span> ${stale(p)?'<span class="badge">تحتاج مراجعة</span>':''}<p class="muted">${p.reviewed_at?'آخر مراجعة: '+esc(new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{dateStyle:'medium'}).format(new Date(p.reviewed_at))):'لم تُراجع من اللوحة بعد.'}</p></div><button class="button outline" data-owner-provider-edit="${esc(p.id)}">تعديل</button></article>`).join('')||'<p class="empty">لا يوجد محتوى مطابق.</p>';
 }
 async function prepareLogo(file){
  if(!['image/png','image/jpeg','image/webp'].includes(file?.type)||file.size>5*1024*1024)throw new Error('اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 5 ميجابايت.');
  const url=URL.createObjectURL(file),img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('تعذّر قراءة الصورة. اختر صورة أخرى.'));img.src=url;});
   const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
   const ratio=Math.min(448/img.naturalWidth,448/img.naturalHeight,1),w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;
   canvas.getContext('2d').drawImage(img,(512-w)/2,(512-h)/2,w,h);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.85));if(!blob||blob.size>262144)throw new Error('تعذّر تجهيز الشعار. اختر صورة أخرى.');return blob;
  }finally{URL.revokeObjectURL(url);}
 }
 function edit(id){
  if(!allowed()||!data)return;
  const p=id?data.providers.find(x=>x.id===id):{};if(!p)return;
  const g=providerGuidance({url:p.official_url,guidance:p.guidance}),l=window.SaiLearningGuidance.labels;
  show(id?'تعديل جهة التعلم':'إضافة جهة تعلم',`<form id="owner-provider-form" class="platform-form">
   ${input('اسم الجهة','name',p.name||'',true,160)}${input('الرابط الرسمي','official_url',p.official_url||'',true,2000,'url')}
   <label>نبذة قصيرة<textarea name="description" required maxlength="500" rows="3">${esc(p.description||'')}</textarea></label>
   <label>ماذا تقدم الجهة؟<textarea name="details" required maxlength="20000" rows="7">${esc(p.details||'')}</textarea></label>
   ${input('تفاصيل لغة التعلم','language',p.language||'')}${input('تفاصيل التكلفة','cost',p.cost||'')}
   ${input('نوع المحتوى — افصلي بفاصلة','content_types',(p.content_types||[]).join('، '),true,960)}<p class="muted">مثل: دورات، تعلم ذاتي، مسارات تعليمية.</p>
   ${checks('المجالات','fields',Object.fromEntries(data.fields.map(f=>[f.id,f.label])),p.fields||[])}
   ${checks('المستويات المتاحة','levels',l.levels,g.levels)}${checks('لغات المحتوى','languages',l.languages,g.languages)}
   <label>تصنيف التكلفة<select name="cost_kind">${Object.entries(l.costs).map(([k,v])=>`<option value="${k}" ${g.cost===k?'selected':''}>${v}</option>`).join('')}</select></label>
   <fieldset><legend>شعار الجهة</legend><p class="muted">ارفعي صورة من جهازك. يُحافظ على أبعاد الشعار دون قص، ويظهر بالحجم المعتاد في البطاقة.</p><input type="file" id="owner-logo-file" accept="image/png,image/jpeg,image/webp" aria-label="اختيار شعار الجهة"><div id="owner-logo-preview" class="owner-logo-preview">${providerMark({name:p.name||'ج',url:p.official_url,logoPath:p.logo_path})}</div><button type="button" class="text-link" id="owner-logo-default">استخدام الرمز الافتراضي</button><p id="owner-logo-feedback" role="status"></p></fieldset>
   <label>الحالة<select name="status">${Object.entries(labels).map(([k,v])=>`<option value="${k}" ${k===(p.status||'draft')?'selected':''}>${v}</option>`).join('')}</select></label>
   <p class="muted">اختاري مسودة للمراجعة، أو منشورة لعرض الجهة، أو مخفية لإيقاف ظهورها مع الاحتفاظ بها.</p>
   <p id="owner-provider-feedback" class="form-feedback" role="status" hidden></p><button type="submit" class="button">حفظ جهة التعلم</button></form>`,true);
  const form=$('#owner-provider-form');form.addEventListener('change',event=>{const target=event.target;if(!target.checked||!['levels','languages'].includes(target.name))return;for(const box of form.querySelectorAll('input[name="'+target.name+'"]'))if(box!==target&&(target.value==='variable'||box.value==='variable'))box.checked=false;});let blob=null,logoPath=p.logo_path||null,selection=0,previewURL='',preparing=false;
  const revoke=()=>{if(previewURL)URL.revokeObjectURL(previewURL);previewURL='';};dialog.addEventListener('close',revoke,{once:true});
  $('#owner-logo-file').onchange=async event=>{const version=++selection;blob=null;revoke();preparing=true;
   try{if(!event.target.files[0])return;const prepared=await prepareLogo(event.target.files[0]);if(version!==selection||!form.isConnected)return;blob=prepared;previewURL=URL.createObjectURL(blob);const image=new Image();image.src=previewURL;image.alt='معاينة شعار الجهة';$('#owner-logo-preview').replaceChildren(image);status('#owner-logo-feedback','الشعار جاهز للحفظ.');}
   catch(error){if(version===selection){event.target.value='';status('#owner-logo-feedback',error.message,true);}}
   finally{if(version===selection)preparing=false;}
  };
  $('#owner-logo-default').onclick=()=>{selection++;preparing=false;blob=null;logoPath=null;revoke();$('#owner-logo-file').value='';$('#owner-logo-preview').innerHTML=providerMark({name:p.name||'ج',url:p.official_url});status('#owner-logo-feedback','سيُستخدم الرمز الافتراضي.');};
  window.SaiOwnerWorkflow.mountEditor(form,'provider',p,data);
  form.onsubmit=async event=>{event.preventDefault();if(!allowed()||!form.reportValidity())return;
   await formRequest(form,'#owner-provider-feedback',async()=>{
    if(preparing)throw new Error('انتظري تجهيز الشعار ثم احفظي.');
    const fd=new FormData(form),values=Object.fromEntries(fd);values.fields=fd.getAll('fields');values.guidance={levels:fd.getAll('levels'),languages:fd.getAll('languages'),cost:values.cost_kind};
    values.content_types=values.content_types.split(/[,،]/).map(x=>x.trim()).filter(Boolean);
    if(!safeURL(values.official_url))throw new Error('استخدم روابط تبدأ بـ https:// أو http://.');
    if(!values.fields.length||!values.guidance.levels.length||!values.guidance.languages.length)throw new Error('اختاري المجال والمستوى ولغة المحتوى، أو بحسب البرنامج.');
    if(!values.content_types.length||values.content_types.length>12||values.content_types.some(x=>x.length>80))throw new Error('اكتبي حتى 12 نوع محتوى، وكل نوع لا يتجاوز 80 حرفًا.');
    if(blob){const uploadSelection=selection,uploaded=await api.ownerUploadLogo(blob);if(uploadSelection!==selection)throw new Error('تغير الشعار أثناء الرفع. راجعي المعاينة واحفظي مجددًا.');logoPath=uploaded;blob=null;}if(!allowed()||!form.isConnected)return;
    values.id=p.id||null;values.updated_at=p.updated_at||null;values.logo_path=logoPath;
    await api.ownerSaveProvider(values);dialog.close();await window.SaiOwnerConsole.render();status('#owner-feedback','تم حفظ جهة التعلم.');await loadCatalog();
   });
  };
 }
 document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||!allowed())return;if(b.hasAttribute('data-owner-provider-new'))edit();if(b.dataset.ownerProviderEdit)edit(b.dataset.ownerProviderEdit);});
 window.addEventListener('sai:signout',()=>{data=null;});
 return {mount,prepareLogo};
})();
