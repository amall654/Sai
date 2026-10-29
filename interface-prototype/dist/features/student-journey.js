/* Rule-based connections between published learning, opportunities and experiences. */
window.SaiStudentJourney=(()=>{
 const fields=item=>item.fields||[item.field].filter(x=>x&&x!=='تجربة عامة');
 const common=(a,b)=>fields(a).filter(f=>fields(b).includes(f)).length;
 function related(kind,item){
  const group=(title,items,attribute)=>items.length?`<section class="related-group"><h3>${title}</h3><div class="related-list">${items.map(x=>`<button type="button" class="related-item" ${attribute}="${esc(x.id)}"><strong>${esc(x.title||x.name||'تجربة طالب')}</strong><span>${fields(x).length?fields(x).map(f=>'<span>'+esc(f)+'</span>').join(' / '):esc(x.topic||'')}</span></button>`).join('')}</div></section>`:'';
  const rank=list=>list.map(x=>({item:x,score:common(item,x)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.item);
  const providers=kind==='provider'?[]:rank(catalog.providers);
  const opportunities=kind==='opportunity'?[]:rank(catalog.opportunities.filter(opportunityAvailable));
  let stories=[];
  if(kind!=='experience'){
   const topic=kind==='opportunity'?item.type:'تعلّم ذاتي أو دورة';
   stories=catalog.experiences.filter(e=>common(item,e)>0||((!e.field||e.field==='تجربة عامة')&&e.topic===topic)).sort((a,b)=>common(item,b)-common(item,a)).slice(0,3);
  }
  return group('جهات تساعدك على الاستعداد',providers,'data-provider')+group('فرص للتطبيق في المجال',opportunities,'data-detail')+group('تجارب مرتبطة بالمجال أو نوع المشاركة',stories,'data-experience');
 }
 function attach(kind,item){
  dialog.dataset.contentKind=kind;dialog.dataset.contentId=item.id;
  const html=related(kind,item);
  if(html)$('#dialog-body').insertAdjacentHTML('beforeend',`<aside class="related-content" aria-label="محتوى مرتبط">${html}</aside>`);
  window.SaiEngagement?.attach(kind,item);
  window.SaiContentPages?.modalLink(kind,item);
 }
 let renderGeneration=0;
 const states={not_started:'لم أبدأ',in_progress:'أتعلم',completed:'أنجزت'};
 async function mountPath(path){
  dialog.dataset.activeLearningPath=path.id;
  $('#dialog-body').insertAdjacentHTML('beforeend','<div id="path-progress-feedback" role="status"></div>');
  if(!user){$('#path-progress-feedback').innerHTML='<button type="button" class="text-link" data-track-login="'+path.id+'">سجّل دخولك لمتابعة المسار</button>';return;}
  const owner=user.id,version=accountVersion,revision=dialog.dataset.revision;
  status('#path-progress-feedback','جارٍ تحميل تقدم التعلم…');
  try{const rows=await api.learningProgress();if(user?.id!==owner||version!==accountVersion||!dialog.open||dialog.dataset.activeLearningPath!==path.id||dialog.dataset.revision!==revision)return;
   dialog.querySelectorAll('[data-path-step]').forEach(li=>{const step=li.dataset.pathStep,value=rows.find(x=>x.path_id===path.id&&x.step_key===step)?.state||'not_started';li.insertAdjacentHTML('beforeend',`<label class="path-progress-label">حالتي في هذه الخطوة<select data-progress-step="${esc(step)}">${Object.entries(states).map(([k,v])=>`<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join('')}</select></label>`);
    const select=li.querySelector('select');let saved=value;
    select.onchange=async()=>{if(user?.id!==owner)return;select.disabled=true;try{await api.saveLearningProgress(path.id,step,select.value);if(user?.id!==owner||version!==accountVersion)return;saved=select.value;if(dialog.dataset.revision===revision)status('#path-progress-feedback','تم حفظ تقدمك.');if(location.hash==='#journey')render();}catch(error){select.value=saved;if(dialog.dataset.revision===revision)status('#path-progress-feedback',error.message,true);}finally{select.disabled=false;}};
   });status('#path-progress-feedback','هذا تقدم تسجّله بنفسك، ولا يُعد شهادة أو إثباتًا لإكمال الدورات.');
  }catch{if(user?.id===owner&&version===accountVersion&&dialog.open&&dialog.dataset.revision===revision&&dialog.dataset.activeLearningPath===path.id)$('#path-progress-feedback').innerHTML='<p>تعذّر تحميل تقدم التعلم.</p><button class="text-link" data-learning-path="'+path.id+'">إعادة المحاولة</button>';}
 }
 const aliases={software:['برمج','تطوير الويب','software','programming'], 'ai-data':['ذكاء','بيانات','artificial intelligence','data'], 'cyber-networks':['سيبراني','شبكات','cyber','network']};
 function chosenFields(interests){return window.SaiLearningGuidance.paths.filter(path=>(interests||[]).some(i=>normal(i)===normal(path.field)||aliases[path.id].some(a=>normal(i).includes(normal(a))))).map(p=>p.field);}
 const links=(items,attribute)=>items.length?`<div class="related-list">${items.map(item=>`<button type="button" class="related-item" ${attribute}="${esc(item.id)}"><strong>${esc(item.name||item.title)}</strong><span>${fields(item).map(f=>'<span>'+esc(f)+'</span>').join(' / ')}</span></button>`).join('')}</div>`:'<p class="muted">لا يوجد محتوى مطابق حاليًا.</p>';
 async function render(){
  if(!user)return;const generation=++renderGeneration,owner=user.id,version=accountVersion;const host=$('#journey-content');host.innerHTML='<p role="status">جارٍ تجهيز خطوتك القادمة…</p>';
  try{const [profile,progress,saved]=await Promise.all([api.profile(),api.learningProgress(),api.saved()]);if(user?.id!==owner||version!==accountVersion||generation!==renderGeneration)return;
   const selected=chosenFields(profile.interests),level=profile.learning_level||'beginner';
   const matching=item=>fields(item).some(f=>selected.includes(f));
   const providers=catalog.providers.filter(p=>matching(p)&&providerGuidance(p).levels.includes(level)).slice(0,3);
   const opportunities=catalog.opportunities.filter(o=>matching(o)&&opportunityAvailable(o)).sort((a,b)=>(Date.parse(a.deadlineAt)||Infinity)-(Date.parse(b.deadlineAt)||Infinity)).slice(0,3);
   host.innerHTML=`<p>مساحة تجمع تعلمك وما يناسب اهتماماتك، وتساعدك على اختيار خطوة عملية.</p><details class="learning-paths" ${selected.length?'':'open'}><summary>اهتماماتي ومستواي</summary><form id="journey-preferences" class="platform-form"><fieldset><legend>المجالات التي تهمك</legend>${window.SaiLearningGuidance.paths.map(path=>`<label class="check-label"><input type="checkbox" name="interests" value="${esc(path.field)}" ${selected.includes(path.field)?'checked':''}>${esc(path.field)}</label>`).join('')}</fieldset><label>مستواي الحالي<select name="level">${Object.entries(window.SaiLearningGuidance.labels.levels).filter(([k])=>k!=='variable').map(([k,v])=>`<option value="${k}" ${k===level?'selected':''}>${v}</option>`).join('')}</select></label><p id="journey-preferences-feedback" role="status" hidden></p><button type="submit" class="button">حفظ تفضيلاتي</button></form></details>
   <section class="journey-section"><h2>مسارات أتابعها</h2><p class="muted">تقدمك هنا مبني على تحديثاتك الشخصية.</p><div class="learning-path-list">${window.SaiLearningGuidance.paths.filter(path=>selected.includes(path.field)||progress.some(r=>r.path_id===path.id)).map(path=>{const count=path.steps.filter(([step])=>progress.some(r=>r.path_id===path.id&&r.step_key===step&&r.state==='completed')).length;return `<article class="learning-path"><h3>${esc(path.title)}</h3><p><span>خطوات منجزة</span> <bdi>${count} / ${path.steps.length}</bdi></p><progress value="${count}" max="${path.steps.length}" aria-label="${esc(path.title)}"></progress><button type="button" class="text-link" data-learning-path="${path.id}">متابعة المسار</button></article>`;}).join('')||'<p>اختر اهتماماتك لاقتراح مسارات البداية المناسبة.</p>'}</div></section>
   <section class="journey-section"><h2>جهات تناسب اهتماماتي ومستواي</h2>${selected.length?links(providers,'data-provider'):'<p>حدد اهتماماتك من الأعلى لتظهر اقتراحاتك.</p>'}</section><section class="journey-section"><h2>فرص مرتبطة باهتماماتي</h2><p class="muted">الترشيح يعتمد على المجال؛ راجع متطلبات الفرصة قبل التسجيل.</p>${selected.length?links(opportunities,'data-detail'):'<p>حدد اهتماماتك من الأعلى لتظهر اقتراحاتك.</p>'}</section><div id="journey-reminders"></div><div id="journey-outcomes"></div>`;
   $('#journey-preferences').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget;await formRequest(form,'#journey-preferences-feedback',async()=>{const fd=new FormData(form);await api.saveLearningPreferences(fd.get('level'),fd.getAll('interests'));if(user?.id===owner&&version===accountVersion)await render();});};
   if(window.SaiEngagement)window.SaiEngagement.renderPersonal(saved);
  }catch{if(user?.id===owner&&version===accountVersion&&generation===renderGeneration)host.innerHTML='<p class="empty">تعذّر تحميل خطوتك القادمة.</p><button type="button" class="text-link" data-journey-retry>إعادة المحاولة</button>';}
 }
 document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.trackLogin)requireUser(()=>openLearningPath(button.dataset.trackLogin));if(button.hasAttribute('data-journey-retry'))render();});
 window.addEventListener('sai:signout',()=>{renderGeneration++;$('#journey-content')?.replaceChildren();});
 return {attach,related,common,mountPath,render};
})();
