/* Feature rendering. Shared helpers/state are supplied by app.js and ui.js. */
function providerCard(p){return `<article class="provider-card"><span class="provider-monogram">${esc(p.mark||(p.name||'').slice(0,1))}</span><div><h3>${esc(p.name)}</h3><p>${esc(p.description||'')}</p><div class="opportunity-tags">${tags(p.fields)}</div><div class="provider-actions"><button class="text-link" data-provider="${esc(p.id)}">استكشف الجهة ${icon('arrow')}</button>${saveButton('provider',p)}</div></div></article>`;}

function renderProviders(){const q=normal($('#provider-search').value);const items=catalog.providers.filter(p=>normal([p.name,p.description,...(p.fields||[]),...(p.contentTypes||[])].flatMap(value=>[value,window.SaiI18n?.t(value||'')||value]).join(' ')).includes(q));$('#provider-grid').innerHTML=items.map(providerCard).join('');status('#provider-state',items.length?'':'لا توجد جهات مطابقة. جرّب كلمة أقصر أو امسح البحث.');}

function openProvider(id){const p=catalog.providers.find(x=>x.id===id);if(!p)return;show(p.name,`${paragraphs(p.details||p.description)}<div class="opportunity-tags">${tags(p.fields)}${tags(p.contentTypes)}</div><dl class="detail-facts"><div><dt>اللغة</dt><dd>${esc(p.language||'تحقق من الموقع الرسمي')}</dd></div><div><dt>التكلفة</dt><dd>${esc(p.cost||'تحقق من الموقع الرسمي')}</dd></div></dl><div class="detail-actions">${external(p.url,'زيارة الجهة')}<button class="text-link" data-save="${esc(p.id)}" data-kind="provider">حفظ الجهة</button></div>`);}

document.querySelector('#provider-search').addEventListener('input',renderProviders);
