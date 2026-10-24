/* Shared classification and directory UI. Values remain Arabic in either UI language. */
const experienceTopics=['هاكاثون','مسابقة','تعلّم ذاتي أو دورة','مشروع تطبيقي','تدريب عملي','تجربة أخرى'];
function experienceFields(){return [...new Set([...catalog.interests.filter(x=>x!=='الكل'),'تجربة عامة'])];}
function experienceOptions(values,current,placeholder){return `<option value="">${esc(placeholder)}</option>`+[...new Set([...values,...(current?[current]:[])])].map(value=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(value)}</option>`).join('');}
function experienceClassification(e){return `<div class="opportunity-tags">${tags([e.topic||'تجربة أخرى',e.field||'تجربة عامة'])}</div>`;}
let experienceLimit=6;
function renderExperiences(){
 const field=$('#experience-filter-field').value;
 $('#experience-filter-field').innerHTML=experienceOptions([...new Set([...experienceFields(),...catalog.experiences.map(e=>e.field).filter(Boolean)])],field,'كل المجالات');
 const topic=$('#experience-filter-topic').value,q=normal($('#experience-search').value).trim();
 const items=catalog.experiences.filter(e=>(!topic||(e.topic||'تجربة أخرى')===topic)&&(!field||(e.field||'تجربة عامة')===field)&&normal([e.title,e.body,e.description,e.topic,e.field].join(' ')).includes(q)).sort((a,b)=>(Date.parse(b.published_at)||0)-(Date.parse(a.published_at)||0));
 $('#experience-grid').innerHTML=items.slice(0,experienceLimit).map(e=>`<article class="card experience-card"><div class="quote" aria-hidden="true">“</div><h3>${esc(e.title||'تجربة طالب')}</h3>${experienceClassification(e)}<p>${esc(e.description||String(e.body||'').slice(0,150))}</p><div class="experience-author"><span class="avatar">${esc(e.initial||'س')}</span><span>${esc(e.publishedAt||'')}</span></div><button class="text-link" data-experience="${esc(e.id)}">اقرأ التجربة ${icon('arrow')}</button></article>`).join('');
 $('#experience-count').textContent=`${Math.min(experienceLimit,items.length)} / ${items.length}`;
 $('#experience-more').hidden=items.length<=experienceLimit;
 $('#experience-reset').hidden=!topic&&!field&&!q;
 status('#experience-state',items.length?'':catalog.experiences.length?'لا توجد تجارب مطابقة. غيّر التصنيف أو امسح البحث.':'لم تُنشر تجارب بعد. يمكنك مشاركة تجربتك.');
}
document.querySelector('#experience-filter-topic').innerHTML=experienceOptions(experienceTopics,'','كل المواضيع');
['experience-filter-topic','experience-filter-field'].forEach(id=>document.getElementById(id).addEventListener('change',()=>{experienceLimit=6;renderExperiences();}));
document.querySelector('#experience-search').addEventListener('input',()=>{experienceLimit=6;renderExperiences();});
document.querySelector('#experience-reset').addEventListener('click',()=>{['experience-filter-topic','experience-filter-field','experience-search'].forEach(id=>document.getElementById(id).value='');experienceLimit=6;renderExperiences();$('#experience-search').focus();});
document.querySelector('#experience-more').addEventListener('click',()=>{const previous=experienceLimit;experienceLimit+=6;renderExperiences();$('#experience-grid').querySelectorAll('[data-experience]')[previous]?.focus();});
