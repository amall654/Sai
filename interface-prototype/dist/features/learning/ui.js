/* Feature rendering. Shared helpers/state are supplied by app.js and ui.js. */
function providerMark(p){let host='';try{host=new URL(p.url).hostname;}catch{}const logo=['coursera.org','www.coursera.org'].includes(host)?['coursera-logo.svg','Coursera']:host==='sdaia.gov.sa'?['sdaia-logo.svg','سدايا']:host==='tuwaiq.edu.sa'?['tuwaiq-logo.webp','طويق']:['nmkkn.com','www.nmkkn.com'].includes(host)?['nmkkn-logo.svg','نمكّن']:host==='learn.ihashplus.com'?['hashplus-logo.png','هاش بلس']:host==='www.deeplearning.ai'?['deeplearning-logo.png','DeepLearning.AI']:host==='www.freecodecamp.org'?['freecodecamp-logo.png','freeCodeCamp']:host==='elzero.org'?['elzero-logo.png','أكاديمية الزيرو']:host==='maharatech.gov.eg'?['maharatech-logo.png','Mahara-Tech']:host==='www.netacad.com'?['cisco-logo.svg','Cisco Networking Academy']:host==='kaspersky.tuwaiq.edu.sa'?['kaspersky-logo.svg','Kaspersky Academy']:host==='tryhackme.com'?['tryhackme-logo.svg','TryHackMe']:host==='portswigger.net'?['portswigger-logo.svg','PortSwigger Web Security Academy']:host==='learn.microsoft.com'?['microsoft-learn-logo.ico','Microsoft Learn']:host==='skillsbuild.org'?['ibm-skillsbuild-logo.png','IBM SkillsBuild']:host==='skillbuilder.aws'?['aws-logo.svg','AWS Skill Builder']:null;return logo?`<span class="provider-monogram provider-logo ${['nmkkn-logo.svg','elzero-logo.png','tryhackme-logo.svg'].includes(logo[0])?'provider-logo-dark':''}"><img src="assets/${logo[0]}" alt="${logo[1]}" width="50" height="50"></span>`:`<span class="provider-monogram">${esc(p.mark||(p.name||'').slice(0,1))}</span>`;}
function providerCard(p){return `<article class="provider-card"><div class="card-top">${providerMark(p)}${saveButton('provider',p)}</div><h3>${esc(p.name)}</h3><div class="opportunity-tags">${tags(p.fields)}</div><div class="provider-copy">${paragraphs(p.description||'')}</div><div class="provider-actions"><button class="text-link" data-provider="${esc(p.id)}">استكشف الجهة ${icon('arrow')}</button></div></article>`;}

let providerField='', providerLimit=9;
function renderProviders(){
 const fields=[...new Set(catalog.providers.flatMap(p=>p.fields||[]))];
 if(providerField&&!fields.includes(providerField))providerField='';
 $('#provider-fields').innerHTML=['',...fields].map(field=>`<button type="button" class="chip ${field===providerField?'active':''}" data-provider-field="${esc(field)}" aria-pressed="${field===providerField}">${esc(field||'الكل')}</button>`).join('');
 const q=normal($('#provider-search').value).trim();
 const items=catalog.providers.filter(p=>(!providerField||(p.fields||[]).includes(providerField))&&normal([p.name,p.description,...(p.fields||[]),...(p.contentTypes||[])].flatMap(value=>[value,window.SaiI18n?.t(value||'')||value]).join(' ')).includes(q));
 $('#provider-grid').innerHTML=items.slice(0,providerLimit).map(providerCard).join('');
 $('#provider-more').hidden=items.length<=providerLimit;
 $('#provider-reset').hidden=!providerField&&!q;
 $('#provider-count').textContent=`${Math.min(providerLimit,items.length)} / ${items.length}`;
 status('#provider-state',items.length?'':'لا توجد جهات مطابقة. غيّر المجال أو امسح البحث.');
}

function openProvider(id){const p=catalog.providers.find(x=>x.id===id);if(!p)return;show(p.name,`<div class="opportunity-detail provider-detail"><div class="opportunity-tags">${tags(p.fields)}${tags(p.contentTypes)}</div><div class="opportunity-copy">${paragraphs(p.details||p.description)}</div><dl class="detail-facts"><div><dt>اللغة</dt><dd>${esc(p.language||'تحقق من الموقع الرسمي')}</dd></div><div><dt>التكلفة</dt><dd>${esc(p.cost||'تحقق من الموقع الرسمي')}</dd></div></dl><div class="detail-actions">${external(p.url,'زيارة الجهة')}</div></div>`);}

document.querySelector('#provider-search').addEventListener('input',()=>{providerLimit=9;renderProviders();});
document.querySelector('#provider-fields').addEventListener('click',event=>{const button=event.target.closest('[data-provider-field]');if(!button)return;providerField=button.dataset.providerField;providerLimit=9;renderProviders();document.querySelectorAll('[data-provider-field]').forEach(b=>{if(b.dataset.providerField===providerField)b.focus();});});
document.querySelector('#provider-reset').addEventListener('click',()=>{providerField='';providerLimit=9;$('#provider-search').value='';renderProviders();$('#provider-search').focus();});
document.querySelector('#provider-more').addEventListener('click',()=>{const previous=providerLimit;providerLimit+=9;renderProviders();$('#provider-grid').querySelectorAll('[data-provider]')[previous]?.focus();});
