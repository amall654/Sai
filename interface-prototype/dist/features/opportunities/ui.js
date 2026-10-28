/* Feature rendering. Shared helpers/state are supplied by app.js and ui.js. */
const opportunitySymbols = {
 trophy:'<path d="M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 13v6m-4 2h8m-7-2h6"/>',
 code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
 screen:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10"/>',
 pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-12 4h3m3 0h3"/>'
};
function opportunityIcon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+opportunitySymbols[name]+'</svg>';}
function opportunityFacts(o, showDeadline=true){return '<dl class="opportunity-facts">'+(o.mode?'<div><dt>'+opportunityIcon(/حضوري/.test(o.mode)?'pin':'screen')+'<span>طريقة المشاركة</span></dt><dd>'+esc(o.mode)+'</dd></div>':'')+(showDeadline&&o.deadline?'<div><dt>'+opportunityIcon('calendar')+'<span>الموعد</span></dt><dd>'+esc(o.deadline)+'</dd></div>':'')+'</dl>';}
function opportunityAvailable(o){return o.registrationKind!=='unknown'&&(!o.deadlineAt||Date.parse(o.deadlineAt)>Date.now());}
function opportunityRegistrationState(o){
 if(o.registrationKind==='unknown')return {key:'unknown',label:'موعد التسجيل غير مؤكد'};
 if(o.deadlineAt){const remaining=Date.parse(o.deadlineAt)-Date.now();if(!Number.isFinite(remaining))return {key:'unknown',label:'موعد التسجيل غير مؤكد'};if(remaining<=0)return {key:'closed',label:o.deadlineEstimated?'انتهت فترة العرض في سعي':'انتهى التسجيل'};if(remaining<=72*60*60*1000)return {key:'soon',label:o.deadlineEstimated?'ينتهي عرضها خلال 3 أيام':'يغلق خلال 3 أيام'};return {key:'open',label:o.deadlineEstimated?'التسجيل متاح — الإغلاق الرسمي غير معلن':'التسجيل مفتوح'};}
 return o.registrationKind==='ongoing'?{key:'ongoing',label:'تسجيل مستمر'}:{key:'unknown',label:'موعد التسجيل غير مؤكد'};
}
function opportunityStatusBadge(o){const state=opportunityRegistrationState(o);return `<span class="registration-state ${state.key}" data-registration-state="${state.key}">${esc(state.label)}</span>`;}
function opportunityEligibility(o){
 const text=String(o.originalText||o.details||'').replace(/\r\n/g,'\n');
 const sentences=text.split(/(?<=[.؟!])\s+|\n+/).map(s=>s.trim()).filter(s=>s&&/يشترط|يلزم|يجب|العمر|شروطه|شروط المشاركة/.test(s));
 const copy=sentences.slice(0,2).join(' ')||o.audience||'راجع شروط الجهة المنظمة لمعرفة الأهلية ومتطلبات المشاركة.';
 return `<div class="opportunity-eligibility"><strong>متطلبات المشاركة</strong><p>${esc(copy)}</p></div>`;
}
function opportunityRegistration(o){return opportunityAvailable(o)?external(o.registrationUrl||o.sourceUrl,o.registrationUrl?'زيارة التسجيل':'فتح المصدر الأصلي'):'';}
function opportunityCard(o){return `<article class="card opportunity-card" data-opportunity-id="${esc(o.id)}"><div class="card-top"><div class="opportunity-kind"><span class="category-icon">${opportunityIcon(/هاكاثون|hackathon/i.test(o.type)?'code':'trophy')}</span><span>${esc(o.type||'')}</span></div>${saveButton('opportunity',o)}</div><h3>${esc(o.title)}</h3>${o.sourceName?`<p class="opportunity-source">${esc(o.sourceName)}</p>`:''}${opportunityStatusBadge(o)}${opportunityFacts(o)}${opportunityEligibility(o)}<div class="opportunity-actions">${opportunityRegistration(o)}<button class="button outline" data-detail="${esc(o.id)}">عرض التفاصيل</button></div></article>`;}

function renderOpportunities(){
 const words=normal($('#opportunity-search').value).trim().split(/\s+/).filter(Boolean);
 const items=catalog.opportunities.filter(o=>{if(!opportunityAvailable(o))return false;const fields=o.fields||[];const text=normal([o.title,o.sourceName,o.description,o.originalText,o.audience,...fields,o.type,o.mode].flatMap(value=>[value,window.SaiI18n?.t(value||'')||value]).join(' '));return (activeInterest==='الكل'||fields.includes(activeInterest))&&(!$('#opportunity-type').value||o.type===$('#opportunity-type').value)&&(!$('#opportunity-mode').value||o.mode===$('#opportunity-mode').value)&&words.every(w=>text.includes(w));});
 $('#opportunity-grid').innerHTML=items.map(opportunityCard).join('');
 $('#empty-opportunities').hidden=items.length>0;
 document.querySelectorAll('[data-interest]').forEach(el=>{el.classList.toggle('active',el.dataset.interest===activeInterest);el.setAttribute('aria-pressed',String(el.dataset.interest===activeInterest));});
}

function openOpportunity(id){const o=catalog.opportunities.find(x=>x.id===id);if(!o)return;show(o.title,`<div class="opportunity-detail"><div class="opportunity-kind"><span class="category-icon">${opportunityIcon(/هاكاثون|hackathon/i.test(o.type)?'code':'trophy')}</span><div><strong>${esc(o.type||'')}</strong>${o.sourceName?`<p class="opportunity-source">${esc(o.sourceName)}</p>`:''}</div></div>${opportunityStatusBadge(o)}${opportunityFacts(o)}<div class="opportunity-tags">${tags(o.fields)}</div>${opportunityEligibility(o)}<div class="opportunity-copy">${paragraphs(o.description)}${(o.originalText||o.details)&&((o.originalText||o.details)!==o.description)?paragraphs(o.originalText||o.details):''}</div>${(o.attachments||[]).map(a=>external(a.url,a.name||'فتح المرفق')).join('')}<div class="opportunity-actions">${opportunityRegistration(o)}</div></div>`);dialog.dataset.opportunityId=o.id;window.SaiStudentJourney.attach('opportunity',o);}

document.querySelector('#opportunity-search').addEventListener('input',renderOpportunities);
['opportunity-type','opportunity-mode'].forEach(id=>document.querySelector('#'+id).addEventListener('change',renderOpportunities));

// Expire already-loaded cards too; recheck on tab return before showing stale actions.
function refreshRegistrationAvailability(){
 if(typeof catalogReady==='undefined'||!catalogReady)return;
 renderOpportunities();
 if(location.hash==='#saved')renderSaved();
 const id=dialog.dataset.opportunityId;
 if(id&&dialog.open&&dialog.querySelector('.opportunity-detail')){const item=catalog.opportunities.find(o=>o.id===id);if(item&&dialog.querySelector('[data-registration-state]')?.dataset.registrationState!==opportunityRegistrationState(item).key)openOpportunity(id);}
}
setInterval(refreshRegistrationAvailability,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRegistrationAvailability();});
document.addEventListener('click',event=>{const link=event.target.closest('.opportunity-actions a');if(!link)return;const id=link.closest('[data-opportunity-id]')?.dataset.opportunityId||dialog.dataset.opportunityId;const item=catalog.opportunities.find(o=>o.id===id);if(item&&!opportunityAvailable(item)){event.preventDefault();refreshRegistrationAvailability();notice(opportunityRegistrationState(item).label);}},true);
