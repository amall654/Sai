/* Optional self-reports and in-platform reminders. No background visit analytics. */
window.SaiEngagement=(()=>{
 const stages={not_yet:'لم أبدأ بعد',registered:'سجلت في الفرصة',participated:'شاركت في الفرصة',started:'بدأت التعلم',completed:'أكملت ما اخترت تعلمه'};
 const reasons={broken_link:'الرابط لا يعمل',incorrect:'معلومة غير صحيحة',expired:'التسجيل مغلق أو الفرصة منتهية',other:'ملاحظة أخرى'};
 let followup=null;
 const lookup=(kind,id)=>(kind==='opportunity'?catalog.opportunities:kind==='provider'?catalog.providers:catalog.experiences).find(x=>x.id===id);
 function attach(kind,item){
  $('#dialog-body').insertAdjacentHTML('beforeend',`<div class="engagement-actions">${kind!=='experience'?`<button type="button" class="text-link" data-outcome-kind="${kind}" data-outcome-id="${esc(item.id)}">سجّل استفادتك</button>`:''}${kind==='opportunity'&&item.deadlineAt&&opportunityAvailable(item)?`<button type="button" class="text-link" data-calendar="${esc(item.id)}">أضف الموعد إلى التقويم</button>`:''}<button type="button" class="text-link" data-report-kind="${kind}" data-report-id="${esc(item.id)}">أبلغ عن رابط أو معلومة</button></div>`);
 }
 // RFC 5545 folds content lines at 75 UTF-8 octets, without splitting Arabic characters.
 const foldCalendarLine=line=>{let result='',part='',size=0;const encoder=new TextEncoder();for(const char of line){const length=encoder.encode(char).length;if(size+length>75){result+=part+'\r\n';part=' ';size=1;}part+=char;size+=length;}return result+part;};
 const icsEscape=value=>String(value||'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 function calendarText(item){
  const date=new Date(item.deadlineAt);if(!Number.isFinite(date.getTime()))throw new Error('الموعد غير متاح للتقويم.');
  const utc=value=>value.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  // Text is escaped so a title cannot inject calendar properties or additional events.
  const title=(item.deadlineEstimated?'إيقاف العرض في سعي: ':'آخر موعد للتسجيل: ')+item.title;
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sai//Opportunity reminder//AR','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+icsEscape(item.id)+'@sai','DTSTAMP:'+utc(new Date()),'DTSTART:'+utc(date),'DTEND:'+utc(new Date(date.getTime()+15*60000)),'SUMMARY:'+icsEscape(title),'DESCRIPTION:'+icsEscape(item.deadline),'URL:'+icsEscape(safeURL(item.registrationUrl||item.sourceUrl)||''),'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:'+icsEscape(title),'END:VALARM','END:VEVENT','END:VCALENDAR',''].map(foldCalendarLine).join('\r\n');
 }
 function downloadCalendar(item){
  if(!opportunityAvailable(item))return notice('انتهت فترة التسجيل أو العرض.');
  try{const url=URL.createObjectURL(new Blob([calendarText(item)],{type:'text/calendar;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='sai-'+item.id.replace(/[^a-zA-Z0-9-]/g,'')+'.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){notice(error.message);}
 }
 function refreshReminders(){
  const host=$('#journey-reminders');if(!host||!user||location.hash!=='#journey')return;
  const closing=catalog.opportunities.filter(o=>savedItems.some(s=>s.kind==='opportunity'&&s.id===o.id)&&o.deadlineAt&&opportunityAvailable(o)&&Date.parse(o.deadlineAt)-Date.now()<=72*3600000).sort((a,b)=>Date.parse(a.deadlineAt)-Date.parse(b.deadlineAt));
  host.innerHTML=`<section class="journey-section"><h2>تذكيرات محفوظاتي</h2><p class="muted">الفرص التي حفظتها واقترب موعدها خلال 3 أيام. يمكنك إضافة تذكير إلى تقويمك.</p>${closing.length?closing.map(o=>`<article class="reminder-row"><button type="button" class="text-link" data-detail="${esc(o.id)}">${esc(o.title)}</button><p>${esc(o.deadline)}</p><button type="button" class="text-link" data-calendar="${esc(o.id)}">أضف الموعد إلى التقويم</button></article>`).join(''):'<p>لا توجد فرص محفوظة تقترب من الإغلاق حاليًا.</p>'}</section>`;
 }
 async function renderPersonal(saved){
  savedItems=saved;syncAccount();refreshReminders();const host=$('#journey-outcomes'),owner=user?.id,version=accountVersion;
  if(!host||!owner)return;
  try{const rows=await api.outcomes();if(user?.id!==owner||version!==accountVersion||!host.isConnected)return;
   host.innerHTML=`<section class="journey-section"><h2>مشاركتي وتعلمي</h2><p class="muted">إجاباتك اختيارية ويمكنك تحديثها، ولا تُعد إثباتًا مستقلًا للمشاركة.</p>${rows.length?rows.map(row=>{const item=lookup(row.kind,row.target_id);return `<article class="reminder-row"><strong>${esc(item?.title||item?.name||'محتوى غير متاح حاليًا')}</strong><p>${esc(stages[row.stage]||'')}</p>${item?`<button type="button" class="text-link" data-outcome-kind="${row.kind}" data-outcome-id="${esc(row.target_id)}">تحديث إجابتي</button>`:''}</article>`;}).join(''):'<p>يمكنك تسجيل استفادتك من صفحة تفاصيل الفرصة أو جهة التعلم.</p>'}</section>`;
  }catch{if(user?.id===owner&&version===accountVersion)host.innerHTML='<p>تعذّر تحميل متابعتك.</p><button type="button" class="text-link" data-engagement-retry>إعادة المحاولة</button>';}
 }
 async function outcome(kind,id){
  if(!requireUser(()=>outcome(kind,id)))return;
  const item=lookup(kind,id);if(!item||kind==='experience')return;
  const owner=user.id,version=accountVersion;show('متابعة استفادتي','<p role="status">جارٍ تحميل متابعتك…</p>');dialog.dataset.outcomeId=id;const revision=dialog.dataset.revision;
  try{const rows=await api.outcomes();if(user?.id!==owner||version!==accountVersion||!dialog.open||dialog.dataset.outcomeId!==id||dialog.dataset.revision!==revision)return;
   const old=rows.find(r=>r.kind===kind&&r.target_id===id),options=kind==='opportunity'?['not_yet','registered','participated']:['not_yet','started','completed'];
   show('متابعة استفادتي',`<p>${esc(item.title||item.name)}</p><form id="outcome-form" class="platform-form"><p>الإجابة اختيارية، وتساعد على فهم فائدة سعي. هي تحديث منك وليست تحققًا من الجهة الخارجية.</p><label>${kind==='opportunity'?'هل سجلت أو شاركت؟':'هل بدأت التعلم؟'}<select name="stage" required><option value="">اختر حالتك</option>${options.map(k=>`<option value="${k}" ${old?.stage===k?'selected':''}>${stages[k]}</option>`).join('')}</select></label><label>هل وجدت المحتوى مفيدًا؟<select name="helpful"><option value="" ${old?.helpful==null?'selected':''}>لم أستطع التقييم بعد</option><option value="true" ${old?.helpful===true?'selected':''}>نعم</option><option value="false" ${old?.helpful===false?'selected':''}>لا</option></select></label><p id="outcome-feedback" role="status" hidden></p><button type="submit" class="button">حفظ إجابتي</button></form>`);
   const formRevision=dialog.dataset.revision;
   $('#outcome-form').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;await formRequest(form,'#outcome-feedback',async()=>{const fd=new FormData(form);await api.saveOutcome(kind,id,fd.get('stage'),fd.get('helpful')===''?null:fd.get('helpful')==='true');if(user?.id!==owner||version!==accountVersion||!dialog.open||dialog.dataset.revision!==formRevision)return;dialog.close();notice('تم حفظ إجابتك.');if(location.hash==='#journey')renderPersonal(savedItems);});};
  }catch{if(user?.id===owner&&version===accountVersion&&dialog.open&&dialog.dataset.revision===revision&&dialog.dataset.outcomeId===id)show('متابعة استفادتي','<p>تعذّر تحميل متابعتك.</p>');}
 }
 function report(kind,id){
  if(!requireUser(()=>report(kind,id)))return;const item=lookup(kind,id);if(!item)return;
  const owner=user.id,version=accountVersion;
  show('الإبلاغ عن محتوى',`<p>${esc(item.title||item.name||'تجربة طالب')}</p><form id="content-report-form" class="platform-form"><label>سبب البلاغ<select name="reason" required><option value="">اختر السبب</option>${Object.entries(reasons).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>توضيح الملاحظة (اختياري)<textarea name="note" maxlength="1500" rows="4"></textarea></label><p class="muted">يصل البلاغ إلى مالك المنصة للمراجعة. اكتفِ بوصف الخطأ دون بيانات شخصية.</p><p id="report-feedback" role="status" hidden></p><button type="submit" class="button">إرسال البلاغ</button></form>`);
  const reportRevision=dialog.dataset.revision;
  $('#content-report-form').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;await formRequest(form,'#report-feedback',async()=>{const fd=new FormData(form);await api.reportContent(kind,id,fd.get('reason'),fd.get('note'));if(user?.id!==owner||version!==accountVersion||!dialog.open||dialog.dataset.revision!==reportRevision)return;show('وصل بلاغك','<p>شكرًا لك. سيُراجع مالك المنصة الملاحظة.</p>');});};
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(button){if(button.dataset.calendar){const item=lookup('opportunity',button.dataset.calendar);if(item)downloadCalendar(item);}if(button.dataset.outcomeId)outcome(button.dataset.outcomeKind,button.dataset.outcomeId);if(button.dataset.reportId)report(button.dataset.reportKind,button.dataset.reportId);if(button.hasAttribute('data-engagement-retry'))renderPersonal(savedItems);if(button.hasAttribute('data-dismiss-followup')){followup=null;$('#activity-followup').hidden=true;}return;}
  const link=event.target.closest('#dialog-body .opportunity-actions a,#dialog-body .detail-actions a');
  if(!event.defaultPrevented&&link&&user&&['provider','opportunity'].includes(dialog.dataset.contentKind))followup={kind:dialog.dataset.contentKind,id:dialog.dataset.contentId,owner:user.id};
 });
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden||!followup||user?.id!==followup.owner)return;
  const host=$('#activity-followup');host.innerHTML=`<p>هل بدأت التعلم أو سجلت في الفرصة؟ يمكنك تحديث متابعتك اختياريًا.</p><button type="button" class="text-link" data-outcome-kind="${followup.kind}" data-outcome-id="${esc(followup.id)}">تحديث متابعتي</button><button type="button" class="text-link" data-dismiss-followup>إغلاق</button>`;host.hidden=false;followup=null;
 });
 window.addEventListener('sai:signout',()=>{followup=null;const host=$('#activity-followup');if(host){host.replaceChildren();host.hidden=true;}});
 return {attach,calendarText,refreshReminders,renderPersonal,stages,reasons};
})();
