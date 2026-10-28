/* Aggregate voluntary outcomes and owner-only report handling. */
window.SaiOwnerEngagement=(()=>{
 let generation=0;
 async function mount(){
  if(user?.role!=='admin')return;
  const token=++generation,version=accountVersion;
  $('#owner-engagement')?.remove();$('#admin-content').insertAdjacentHTML('beforeend','<section id="owner-engagement" class="owner-section"><h2>الاستفادة والبلاغات</h2><p role="status">جارٍ تحميل الملخص…</p></section>');
  const host=$('#owner-engagement');
  try{const data=await api.ownerEngagement();if(token!==generation||version!==accountVersion||user?.role!=='admin'||!host.isConnected)return;
   host.innerHTML=`<h2>ملخص الاستفادة</h2><p class="muted">هذه إجابات اختيارية يحدّثها الطلاب بأنفسهم؛ العدد يمثل إجابات عن محتوى، وليس عددًا فريدًا من الطلاب أو إثباتًا مستقلًا للأثر.</p><div class="impact-table-wrap"><table class="impact-table"><thead><tr><th>نوع المحتوى</th><th>الحالة المبلّغ عنها</th><th>عدد الإجابات</th><th>مفيد</th><th>غير مفيد</th></tr></thead><tbody>${data.outcomes.map(row=>`<tr><td>${row.kind==='provider'?'جهات التعلم':'الفرص'}</td><td>${esc(window.SaiEngagement.stages[row.stage]||row.stage)}</td><td>${Number(row.total)}</td><td>${Number(row.helpful)}</td><td>${Number(row.unhelpful)}</td></tr>`).join('')||'<tr><td colspan="5">لم تصل إجابات بعد.</td></tr>'}</tbody></table></div><h2>بلاغات المحتوى</h2><div class="owner-filter"><label>حالة البلاغ<select id="owner-report-filter"><option value="open">مفتوحة</option><option value="all">جميع البلاغات</option><option value="resolved">عولجت</option><option value="dismissed">أغلقت بعد المراجعة</option></select></label></div><p id="owner-report-feedback" role="status" hidden></p><div id="owner-report-list" class="owner-list"></div>`;
   const render=()=>{const state=$('#owner-report-filter').value;$('#owner-report-list').innerHTML=data.reports.filter(r=>state==='all'||r.status===state).map(r=>`<article class="owner-report"><h3>${esc(r.title||'محتوى غير متاح حاليًا')}</h3><span class="badge">${esc(window.SaiEngagement.reasons[r.reason]||r.reason)}</span><p class="preserve-text">${esc(r.note)}</p><div class="owner-actions">${lookupButton(r)}${[['resolved','تمت المعالجة'],['dismissed','إغلاق بعد المراجعة'],['open','إعادة فتح البلاغ']].filter(([v])=>v!==r.status).map(([v,l])=>`<button type="button" class="button outline" data-review-report="${esc(r.id)}" data-report-decision="${v}">${l}</button>`).join('')}</div></article>`).join('')||'<p class="empty">لا توجد بلاغات بهذه الحالة.</p>';};
   $('#owner-report-filter').onchange=render;render();
   host.onclick=async event=>{const button=event.target.closest('[data-review-report]');if(!button||user?.role!=='admin')return;const report=data.reports.find(r=>r.id===button.dataset.reviewReport);button.disabled=true;try{await api.ownerReviewReport(report.id,button.dataset.reportDecision,report.updated_at);if(version===accountVersion&&user?.role==='admin')await mount();}catch(error){if(host.isConnected)status('#owner-report-feedback',error.message,true);}finally{button.disabled=false;}};
  }catch{if(token===generation&&version===accountVersion&&host.isConnected)host.innerHTML='<h2>الاستفادة والبلاغات</h2><p>تعذّر تحميل البلاغات وملخص الاستفادة.</p><button type="button" class="text-link" data-owner-engagement-retry>إعادة المحاولة</button>';}
 }
 function lookupButton(report){const list=report.kind==='provider'?catalog.providers:report.kind==='opportunity'?catalog.opportunities:catalog.experiences;return list.some(i=>i.id===report.target_id)?`<button type="button" class="text-link" ${report.kind==='provider'?'data-provider':report.kind==='opportunity'?'data-detail':'data-experience'}="${esc(report.target_id)}">عرض المحتوى</button>`:'';}
 document.addEventListener('click',event=>{if(event.target.closest('[data-owner-engagement-retry]')&&user?.role==='admin')mount();});
 window.addEventListener('sai:signout',()=>generation++);
 return {mount};
})();
