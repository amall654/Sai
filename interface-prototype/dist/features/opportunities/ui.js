/* Feature rendering. Shared helpers/state are supplied by app.js and ui.js. */
function opportunityCard(o){return `<article class="card"><div class="card-top"><span class="category-icon ${esc(o.color||'')}">${icon(o.icon||'compass')}</span>${saveButton('opportunity',o)}</div><div class="opportunity-tags">${tags(o.fields)}</div><h3>${esc(o.title)}</h3><p>${esc(o.description||o.sourceName||'')}</p>${o.sourceName?`<p class="muted">${esc(o.sourceName)}</p>`:''}<div class="card-meta"><span>${esc(o.mode||'')}</span><span>${esc(o.type||'')}</span></div><div class="card-bottom"><span>${esc(o.deadline||'')}</span><button class="text-link" data-detail="${esc(o.id)}">عرض المنشور ${icon('arrow')}</button></div></article>`;}

function renderOpportunities(){
 const words=normal($('#opportunity-search').value).trim().split(/\s+/).filter(Boolean);
 const items=catalog.opportunities.filter(o=>{const fields=o.fields||[];const text=normal([o.title,o.sourceName,o.description,o.originalText,o.audience,...fields,o.type,o.mode].flatMap(value=>[value,window.SaiI18n?.t(value||'')||value]).join(' '));return (activeInterest==='الكل'||fields.includes(activeInterest))&&(!$('#opportunity-type').value||o.type===$('#opportunity-type').value)&&(!$('#opportunity-mode').value||o.mode===$('#opportunity-mode').value)&&words.every(w=>text.includes(w));});
 $('#opportunity-grid').innerHTML=items.map(opportunityCard).join('');
 $('#empty-opportunities').hidden=items.length>0;
 document.querySelectorAll('[data-interest]').forEach(el=>{el.classList.toggle('active',el.dataset.interest===activeInterest);el.setAttribute('aria-pressed',String(el.dataset.interest===activeInterest));});
}

function openOpportunity(id){const o=catalog.opportunities.find(x=>x.id===id);if(!o)return;show(o.title,`<div class="opportunity-tags">${tags(o.fields)}</div>${o.sourceName?`<p><strong>المصدر:</strong> ${esc(o.sourceName)}</p>`:''}${paragraphs(o.originalText||o.details||o.description)}${o.publishedAt?`<p>تاريخ النشر: ${esc(o.publishedAt)}</p>`:''}${o.deadline?`<p>الموعد: ${esc(o.deadline)}</p>`:''}${(o.attachments||[]).map(a=>external(a.url,a.name||'فتح المرفق')).join('')}<div class="detail-actions">${external(o.registrationUrl||o.sourceUrl,o.registrationUrl?'زيارة التسجيل':'فتح المصدر الأصلي')}<button class="text-link" data-save="${esc(o.id)}" data-kind="opportunity">حفظ الفرصة</button></div>`);}

document.querySelector('#opportunity-search').addEventListener('input',renderOpportunities);
['opportunity-type','opportunity-mode'].forEach(id=>document.querySelector('#'+id).addEventListener('change',renderOpportunities));
