/* Student proposals stay private until the owner verifies and adds the content. */
window.SaiSuggestions=(()=>{
 const kinds={opportunity:'فرصة',provider:'جهة تعلم'},states={pending:'قيد المراجعة',reviewed:'تمت المراجعة',dismissed:'لم يُعتمد'};
 let draft={kind:'opportunity',name:'',url:'',note:''},draftOwner='',generation=0,ownerGeneration=0,ownerFilter='pending';
 const allowed=()=>user?.role==='admin';
 const current=(id,version)=>user?.id===id&&accountVersion===version;
 const sourceLink=row=>{const url=safeURL(row.url);return url?`<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">فتح المصدر المقترح</a>`:'<p class="muted">رابط المصدر غير صالح.</p>';};
 function clear(){generation++;ownerGeneration++;draft={kind:'opportunity',name:'',url:'',note:''};draftOwner='';ownerFilter='pending';$('#suggestions-content')?.replaceChildren();$('#owner-suggestions')?.remove();}
 function open(kind){if(!requireUser(()=>open(kind)))return;
  const owner=user.id,version=accountVersion;if(draftOwner!==owner){draft={kind:'opportunity',name:'',url:'',note:''};draftOwner=owner;}if(Object.hasOwn(kinds,kind))draft.kind=kind;
  show('اقترح فرصة أو جهة تعلم',`<form id="suggestion-form" class="platform-form"><p>أرسل الرابط الرسمي والمعلومات المتاحة؛ يراجعها المالك قبل إضافتها للمنصة.</p><label>نوع الاقتراح<select name="kind" required>${Object.entries(kinds).map(([key,label])=>`<option value="${key}" ${draft.kind===key?'selected':''}>${label}</option>`).join('')}</select></label><label>الاسم<input name="name" required maxlength="160" value="${esc(draft.name)}"></label><label>الرابط الرسمي<input name="url" type="url" dir="ltr" required maxlength="2000" placeholder="https://" value="${esc(draft.url)}"></label><label>معلومات إضافية (اختياري)<textarea name="note" rows="4" maxlength="2000">${esc(draft.note)}</textarea></label><p class="muted">للـفرص، اذكر موعد إغلاق التسجيل إن كان معلنًا، وتجنب إضافة بيانات شخصية.</p><p id="suggestion-feedback" role="status" hidden></p><button class="button" type="submit">إرسال الاقتراح</button></form>`,true);
  const form=$('#suggestion-form'),remember=()=>{draft=Object.fromEntries(new FormData(form));};form.addEventListener('input',remember);form.addEventListener('change',remember);
  form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;remember();const values={...draft};
   await formRequest(form,'#suggestion-feedback',async stillCurrent=>{
    if(!Object.hasOwn(kinds,values.kind)||!values.name.trim())throw new Error('اختر نوع الاقتراح واكتب الاسم.');
    const url=safeURL(values.url.trim());if(!url)throw new Error('استخدم رابطًا يبدأ بـ https:// أو http://.');
    await api.submitSuggestion(values.kind,values.name.trim(),url,values.note.trim());
    if(!current(owner,version))return;
    if(JSON.stringify(draft)===JSON.stringify(values))draft={kind:'opportunity',name:'',url:'',note:''};
    if(!stillCurrent()){notice('تم إرسال اقتراحك للمراجعة.');return;}
    show('وصل اقتراحك','<p>سيُراجع المالك المصدر والمعلومات قبل الإضافة. يمكنك متابعة الحالة من اقتراحاتي.</p><a class="button outline" href="#suggestions">متابعة اقتراحاتي</a>');
    if(location.hash==='#suggestions')render();
   });
  };
 }
 async function render(){if(!user)return;const owner=user.id,version=accountVersion,token=++generation,host=$('#suggestions-content');if(!host)return;
  host.innerHTML='<p role="status">جارٍ تحميل اقتراحاتك…</p>';
  try{const rows=await api.suggestions();if(!current(owner,version)||token!==generation||!host.isConnected)return;
   host.innerHTML=`<div class="care-toolbar"><p class="muted">اقتراحاتك لا تُنشر تلقائيًا، ويظهر هنا قرار المراجعة.</p><button type="button" class="button" data-suggestion-open>اقتراح جديد</button></div><div class="care-list">${rows.map(row=>`<article class="care-card"><h2>${esc(row.name)}</h2><div class="opportunity-tags"><span class="badge">${kinds[row.kind]||'اقتراح'}</span><span class="badge">${states[row.status]||states.pending}</span></div>${sourceLink(row)}${row.note?paragraphs(row.note):''}${row.owner_note?`<aside class="review-note"><strong>ملاحظة المالك</strong>${paragraphs(row.owner_note)}</aside>`:''}</article>`).join('')||'<p class="empty">لم ترسل اقتراحًا بعد.</p>'}</div>`;
  }catch{if(current(owner,version)&&token===generation&&host.isConnected)host.innerHTML='<p>تعذّر تحميل اقتراحاتك.</p><button class="text-link" type="button" data-suggestions-retry>إعادة المحاولة</button>';}
 }
 async function mountOwner(){if(!allowed())return;const version=accountVersion,owner=user.id,token=++ownerGeneration;
  $('#owner-suggestions')?.remove();const host=document.createElement('section');host.id='owner-suggestions';host.className='owner-section';host.innerHTML='<h2>اقتراحات المحتوى</h2><p role="status">جارٍ تحميل الاقتراحات…</p>';$('#admin-content').append(host);
  try{const rows=await api.ownerSuggestions();if(!allowed()||!current(owner,version)||token!==ownerGeneration||!host.isConnected)return;
   host.innerHTML=`<h2>اقتراحات المحتوى</h2><p class="muted">حتى 200 اقتراح للمراجعة. تحقّق من المصدر والمواعيد؛ قرار المراجعة لا ينشر المحتوى.</p><label class="owner-search">حالة الاقتراح<select id="owner-suggestion-filter"><option value="pending">قيد المراجعة</option><option value="all">جميع الاقتراحات</option><option value="reviewed">تمت المراجعة</option><option value="dismissed">لم يُعتمد</option></select></label><div id="owner-suggestion-list" class="owner-list"></div>`;
   const filter=host.querySelector('select');filter.value=ownerFilter;
   const renderList=()=>{ownerFilter=filter.value;const list=host.querySelector('.owner-list');list.innerHTML=rows.filter(row=>ownerFilter==='all'||row.status===ownerFilter).map(row=>`<article class="owner-row"><div><h3>${esc(row.name)}</h3><div class="opportunity-tags"><span class="badge">${kinds[row.kind]||'اقتراح'}</span><span class="badge">${states[row.status]||states.pending}</span></div></div><div class="suggestion-owner-actions"><button class="button outline" type="button" data-review-suggestion="${esc(row.id)}">قراءة ومراجعة</button>${row.status==='reviewed'?`<button class="text-link" type="button" data-create-suggestion="${esc(row.id)}">${row.kind==='provider'?'فتح نموذج إضافة جهة':'فتح نموذج إضافة فرصة'}</button>`:''}</div></article>`).join('')||'<p class="empty">لا توجد اقتراحات بهذه الحالة.</p>';window.SaiOwnerLists?.limit(list);};filter.onchange=renderList;renderList();
   host.onclick=event=>{const button=event.target.closest('[data-review-suggestion],[data-create-suggestion]');if(!button||!allowed()||!current(owner,version))return;const row=rows.find(r=>r.id===(button.dataset.reviewSuggestion||button.dataset.createSuggestion));if(!row)return;
    if(button.hasAttribute('data-create-suggestion')){prefill(row);return;}
    show('مراجعة الاقتراح',`<h3>${esc(row.name)}</h3><p>${kinds[row.kind]||'اقتراح'}</p>${sourceLink(row)}${row.note?paragraphs(row.note):''}<form id="owner-suggestion-form" class="platform-form"><label>قرار المراجعة<select name="status">${Object.entries(states).map(([key,label])=>`<option value="${key}" ${row.status===key?'selected':''}>${label}</option>`).join('')}</select></label><label>ملاحظة للمقترح (اختياري)<textarea name="owner_note" rows="4" maxlength="1500">${esc(row.owner_note||'')}</textarea></label><p class="muted">اعتماد المراجعة لا يضيف الفرصة أو الجهة تلقائيًا. استخدم نموذج الإضافة بعد التحقق من التفاصيل.</p><p id="owner-suggestion-feedback" role="status" hidden></p><button class="button" type="submit">حفظ قرار المراجعة</button></form>`,true);
    const form=$('#owner-suggestion-form');form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;const values=Object.fromEntries(new FormData(form));await formRequest(form,'#owner-suggestion-feedback',async stillCurrent=>{await api.ownerReviewSuggestion(row.id,row.revision,values.status,values.owner_note.trim());if(!stillCurrent()||!allowed()||!current(owner,version))return;ownerFilter=values.status;dialog.close();await mountOwner();notice('تم حفظ قرار المراجعة.');});};
   };
  }catch{if(allowed()&&current(owner,version)&&token===ownerGeneration&&host.isConnected)host.innerHTML='<h2>اقتراحات المحتوى</h2><p>تعذّر تحميل اقتراحات المحتوى.</p><button class="text-link" type="button" data-owner-suggestions-retry>إعادة المحاولة</button>';}
 }
 function prefill(row){if(!allowed())return;const provider=row.kind==='provider',trigger=$(provider?'[data-owner-provider-new]':'[data-owner-new]');if(!trigger){notice('أعد تحميل لوحة المالك لفتح نموذج الإضافة.');return;}trigger.click();const form=$(provider?'#owner-provider-form':'#owner-opportunity-form');if(!form)return;const name=form.querySelector(provider?'[name="name"]':'[name="title"]'),url=form.querySelector(provider?'[name="official_url"]':'[name="source_url"]');if(name)name.value=row.name;if(url)url.value=safeURL(row.url)||'';for(const element of [name,url])element?.dispatchEvent(new Event('input',{bubbles:true}));notice('نُقل الاسم والرابط إلى النموذج. أكمل التحقق والبيانات قبل الحفظ.');}
 document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-suggestion-open'))open(button.dataset.suggestionKind);if(button.hasAttribute('data-suggestions-retry'))render();if(button.hasAttribute('data-owner-suggestions-retry'))mountOwner();});
 window.addEventListener('sai:signout',clear);
 return {open,render,mountOwner,clear};
})();
