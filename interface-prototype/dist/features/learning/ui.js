/* Feature rendering. Shared helpers/state are supplied by app.js and ui.js. */
function providerLogoURL(path){return /^logos\/[0-9a-f-]{36}\.webp$/.test(path||'')?'https://xzdhyccemkndxabwbrpe.supabase.co/storage/v1/object/public/provider-logos/'+path:null;}
function providerMark(p){const uploaded=providerLogoURL(p.logoPath);if(uploaded)return `<span class="provider-monogram provider-logo"><img src="${esc(uploaded)}" alt="${esc(p.name)}" width="50" height="50"></span>`;let host='';try{host=new URL(p.url).hostname;}catch{}const logo=['coursera.org','www.coursera.org'].includes(host)?['coursera-logo.svg','Coursera']:host==='sdaia.gov.sa'?['sdaia-logo.svg','سدايا']:host==='tuwaiq.edu.sa'?['tuwaiq-logo.webp','طويق']:['nmkkn.com','www.nmkkn.com'].includes(host)?['nmkkn-logo.svg','نمكّن']:host==='learn.ihashplus.com'?['hashplus-logo.png','هاش بلس']:host==='www.deeplearning.ai'?['deeplearning-logo.png','DeepLearning.AI']:host==='www.freecodecamp.org'?['freecodecamp-logo.png','freeCodeCamp']:host==='elzero.org'?['elzero-logo.png','أكاديمية الزيرو']:host==='maharatech.gov.eg'?['maharatech-logo.png','Mahara-Tech']:host==='www.netacad.com'?['cisco-logo.svg','Cisco Networking Academy']:host==='kaspersky.tuwaiq.edu.sa'?['kaspersky-logo.svg','Kaspersky Academy']:host==='tryhackme.com'?['tryhackme-logo.svg','TryHackMe']:host==='portswigger.net'?['portswigger-logo.svg','PortSwigger Web Security Academy']:host==='learn.microsoft.com'?['microsoft-learn-logo.ico','Microsoft Learn']:host==='skillsbuild.org'?['ibm-skillsbuild-logo.png','IBM SkillsBuild']:host==='skillbuilder.aws'?['aws-logo.svg','AWS Skill Builder']:null;return logo?`<span class="provider-monogram provider-logo ${['nmkkn-logo.svg','elzero-logo.png','tryhackme-logo.svg'].includes(logo[0])?'provider-logo-dark':''}"><img src="assets/${logo[0]}" alt="${logo[1]}" width="50" height="50"></span>`:`<span class="provider-monogram">${esc(p.mark||(p.name||'').slice(0,1))}</span>`;}
function providerHost(p){try{return new URL(p.url).hostname.replace(/^www\./,'');}catch{return '';}}
function providerGuidance(p){return p.guidance||window.SaiLearningGuidance.providers[providerHost(p)]||{levels:['variable'],cost:'variable',languages:['variable']};}
function providerGuideTags(p){const g=providerGuidance(p),l=window.SaiLearningGuidance.labels;return tags([...new Set([...g.levels.map(x=>l.levels[x]),l.costs[g.cost]])]);}
function providerCard(p){return `<article class="provider-card"><div class="card-top">${providerMark(p)}${saveButton('provider',p)}</div><h3><a href="#learning/${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><div class="opportunity-tags">${tags(p.fields)}</div><div class="provider-guidance opportunity-tags">${providerGuideTags(p)}</div><div class="provider-copy">${paragraphs(p.description||'')}</div><div class="provider-actions"><button class="text-link" data-provider="${esc(p.id)}">استكشف الجهة ${icon('arrow')}</button>${window.SaiProviderComparison.button(p)}</div></article>`;}

let providerField='', providerLimit=9;
const providerFilterIds=['provider-level','provider-cost','provider-language'];
function renderProviders(){
 const fields=[...new Set(catalog.providers.flatMap(p=>p.fields||[]))];
 if(providerField&&!fields.includes(providerField))providerField='';
 $('#provider-fields').innerHTML=['',...fields].map(field=>`<button type="button" class="chip ${field===providerField?'active':''}" data-provider-field="${esc(field)}" aria-pressed="${field===providerField}">${esc(field||'الكل')}</button>`).join('');
 const q=normal($('#provider-search').value).trim();
 const [level,cost,language]=providerFilterIds.map(id=>$('#'+id).value);
 const items=catalog.providers.filter(p=>(!providerField||(p.fields||[]).includes(providerField))&&(!level||providerGuidance(p).levels.includes(level))&&(!cost||providerGuidance(p).cost===cost)&&(!language||providerGuidance(p).languages.includes(language))&&normal([p.name,p.description,...(p.fields||[]),...(p.contentTypes||[])].flatMap(value=>[value,window.SaiI18n?.t(value||'')||value]).join(' ')).includes(q));
 $('#provider-grid').innerHTML=items.slice(0,providerLimit).map(providerCard).join('');
 $('#provider-more').hidden=items.length<=providerLimit;
 $('#provider-reset').hidden=!providerField&&!q&&!level&&!cost&&!language;
 $('#provider-count').textContent=`${Math.min(providerLimit,items.length)} / ${items.length}`;
 status('#provider-state',items.length?'':'لا توجد جهات مطابقة. غيّر المجال أو امسح البحث.');
 renderLearningPaths();window.SaiProviderComparison.refresh();
}

function providerDetail(p){return `<div class="opportunity-detail provider-detail"><div class="opportunity-tags">${tags(p.fields)}${tags(p.contentTypes)}</div><div class="opportunity-copy">${paragraphs(p.details||p.description)}</div><dl class="detail-facts"><div><dt>المستويات المتاحة</dt><dd>${tags(providerGuidance(p).levels.map(x=>window.SaiLearningGuidance.labels.levels[x]))}</dd></div><div><dt>اللغة</dt><dd>${esc(p.language||'تحقق من الموقع الرسمي')}</dd></div><div><dt>التكلفة</dt><dd>${esc(p.cost||'تحقق من الموقع الرسمي')}</dd></div></dl><div class="detail-actions">${external(p.url,'زيارة الجهة')}</div></div>`;}
function openProvider(id){const p=catalog.providers.find(x=>x.id===id);if(!p)return;show(p.name,providerDetail(p));window.SaiStudentJourney.attach('provider',p);}


document.querySelector('#provider-search').addEventListener('input',()=>{providerLimit=9;renderProviders();});
document.querySelector('#provider-fields').addEventListener('click',event=>{const button=event.target.closest('[data-provider-field]');if(!button)return;providerField=button.dataset.providerField;providerLimit=9;renderProviders();document.querySelectorAll('[data-provider-field]').forEach(b=>{if(b.dataset.providerField===providerField)b.focus();});});
document.querySelector('#provider-reset').addEventListener('click',()=>{providerField='';providerLimit=9;$('#provider-search').value='';providerFilterIds.forEach(id=>$('#'+id).value='');renderProviders();$('#provider-search').focus();});
document.querySelector('#provider-more').addEventListener('click',()=>{const previous=providerLimit;providerLimit+=9;renderProviders();$('#provider-grid').querySelectorAll('[data-provider]')[previous]?.focus();});

providerFilterIds.forEach(id=>document.querySelector('#'+id).addEventListener('change',()=>{providerLimit=9;renderProviders();}));
function renderLearningPaths(){
 const available=window.SaiLearningGuidance.paths.filter(path=>(!providerField||path.field===providerField)&&path.steps.some(([host])=>catalog.providers.some(p=>providerHost(p)===host)));
 $('#learning-path-list').innerHTML=available.map(path=>`<article class="learning-path"><h3>${esc(path.title)}</h3><p>${esc(path.intro)}</p><button type="button" class="text-link" data-learning-path="${path.id}">خطوات المسار ${icon('arrow')}</button></article>`).join('');
 $('#learning-paths').hidden=!available.length;
}
function openLearningPath(id){const path=window.SaiLearningGuidance.paths.find(x=>x.id===id);if(!path)return;
 const steps=path.steps.map(([host,title,copy])=>{const provider=catalog.providers.find(p=>providerHost(p)===host);return provider?`<li data-path-step="${esc(host)}"><h3>${esc(title)}</h3><p>${esc(copy)}</p><button type="button" class="text-link" data-provider="${esc(provider.id)}">${esc(provider.name)} ${icon('arrow')}</button></li>`:'';}).join('');
 show(path.title,`<ol class="learning-path-steps">${steps}</ol><p class="muted">المسار مقترح؛ يمكنك اختيار جهات بديلة.</p><button type="button" class="button outline" data-path-opportunities="${path.id}">استكشف فرص التطبيق</button>`);window.SaiStudentJourney.mountPath(path);
}
document.addEventListener('click',event=>{
 const pathButton=event.target.closest('button[data-learning-path]');if(pathButton){openLearningPath(pathButton.dataset.learningPath);return;}
 const opportunitiesButton=event.target.closest('[data-path-opportunities]');if(opportunitiesButton){const path=window.SaiLearningGuidance.paths.find(x=>x.id===opportunitiesButton.dataset.pathOpportunities);if(!path)return;activeInterest=path.field;$('#opportunity-search').value='';$('#opportunity-type').value='';$('#opportunity-mode').value='';renderOpportunities();dialog.close();location.hash='opportunities';}
});

// A temporarily unavailable uploaded logo falls back to the provider initial.
document.addEventListener("error",event=>{const img=event.target;if(img.tagName==="IMG"&&img.parentElement?.classList.contains("provider-logo")&&img.src.startsWith("https://xzdhyccemkndxabwbrpe.supabase.co/storage/v1/object/public/provider-logos/")){const host=img.parentElement;host.textContent=(img.alt||"ج").slice(0,1);host.classList.remove("provider-logo");}},true);
