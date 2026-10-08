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
function opportunityCard(o){return `<article class="card opportunity-card"><div class="card-top"><div class="opportunity-kind"><span class="category-icon">${opportunityIcon(/هاكاثون|hackathon/i.test(o.type)?'code':'trophy')}</span><span>${esc(o.type||'')}</span></div>${saveButton('opportunity',o)}</div><h3>${esc(o.title)}</h3>${o.sourceName?`<p class="opportunity-source">${esc(o.sourceName)}</p>`:''}${opportunityFacts(o)}<div class="opportunity-actions">${external(o.registrationUrl||o.sourceUrl,o.registrationUrl?'زيارة التسجيل':'فتح المصدر الأصلي')}<button class="button outline" data-detail="${esc(o.id)}">عرض التفاصيل</button></div></article>`;}

function renderOpportunities(){
 const words=normal($('#opportunity-search').value).trim().split(/\s+/).filter(Boolean);
 const items=catalog.opportunities.filter(o=>{const fields=o.fields||[];const text=normal([o.title,o.sourceName,o.description,o.originalText,o.audience,...fields,o.type,o.mode].flatMap(value=>[value,window.SaiI18n?.t(value||'')||value]).join(' '));return (activeInterest==='الكل'||fields.includes(activeInterest))&&(!$('#opportunity-type').value||o.type===$('#opportunity-type').value)&&(!$('#opportunity-mode').value||o.mode===$('#opportunity-mode').value)&&words.every(w=>text.includes(w));});
 $('#opportunity-grid').innerHTML=items.map(opportunityCard).join('');
 $('#empty-opportunities').hidden=items.length>0;
 document.querySelectorAll('[data-interest]').forEach(el=>{el.classList.toggle('active',el.dataset.interest===activeInterest);el.setAttribute('aria-pressed',String(el.dataset.interest===activeInterest));});
}

function openOpportunity(id){const o=catalog.opportunities.find(x=>x.id===id);if(!o)return;show(o.title,`<div class="opportunity-detail"><div class="opportunity-kind"><span class="category-icon">${opportunityIcon(/هاكاثون|hackathon/i.test(o.type)?'code':'trophy')}</span><div><strong>${esc(o.type||'')}</strong>${o.sourceName?`<p class="opportunity-source">${esc(o.sourceName)}</p>`:''}</div></div><div class="opportunity-tags">${tags(o.fields)}</div><div class="opportunity-copy">${paragraphs(o.description)}${(o.originalText||o.details)&&((o.originalText||o.details)!==o.description)?paragraphs(o.originalText||o.details):''}</div>${(o.attachments||[]).map(a=>external(a.url,a.name||'فتح المرفق')).join('')}<div class="opportunity-actions">${external(o.registrationUrl||o.sourceUrl,o.registrationUrl?'زيارة التسجيل':'فتح المصدر الأصلي')}</div></div>`);}

document.querySelector('#opportunity-search').addEventListener('input',renderOpportunities);
['opportunity-type','opportunity-mode'].forEach(id=>document.querySelector('#'+id).addEventListener('change',renderOpportunities));
