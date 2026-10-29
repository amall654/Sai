/* Shareable hash routes work on GitHub Pages without server rewrites. */
window.SaiContentPages=(()=>{
 const sections={opportunity:'opportunities',provider:'learning',experience:'experiences'};
 let previous=location.hash,returnHash='',registrationState='';const positions=new Map();
 function parse(hash=location.hash){const match=/^#(opportunities|learning|experiences)\/([^/]+)$/.exec(hash);if(!match)return null;try{return {section:match[1],kind:Object.keys(sections).find(k=>sections[k]===match[1]),id:decodeURIComponent(match[2])};}catch{return null;}}
 const href=(kind,id)=>'#'+sections[kind]+'/'+encodeURIComponent(id);
 function remember(){const next=location.hash;if(next!==previous){positions.set(previous,scrollY);if(parse(next)&&!parse(previous))returnHash=previous;previous=next;}}
 function modalLink(kind,item){if(kind==='opportunity'&&!opportunityAvailable(item))return;$('#dialog-body').insertAdjacentHTML('afterbegin',`<div class="detail-page-tools"><a class="text-link" href="${href(kind,item.id)}">فتح صفحة التفاصيل</a><button type="button" class="text-link" data-copy-content="${href(kind,item.id)}">نسخ الرابط</button></div>`);}
 function render(){const route=parse(),host=$('#content-page');if(!route)return;if(!catalogReady){host.innerHTML='<div class="content-empty"><h1>تعذّر تحميل المحتوى.</h1><button type="button" class="button outline" data-action="retry">إعادة المحاولة</button></div>';return;}const list=route.kind==='opportunity'?catalog.opportunities:route.kind==='provider'?catalog.providers:catalog.experiences;const item=list.find(x=>x.id===route.id);
  host.dataset.contentKind=route.kind;host.dataset.contentId=route.id;delete host.dataset.opportunityId;
  if(!item||(route.kind==='opportunity'&&!opportunityAvailable(item))){host.innerHTML=`<div class="content-empty"><h1>المحتوى غير متاح حاليًا</h1><p>قد تكون فترة الفرصة انتهت أو تغيّرت حالة نشر المحتوى.</p><a class="button outline" href="#${route.section}">العودة إلى القائمة</a></div>`;registrationState='';return;}
  if(route.kind==='opportunity')host.dataset.opportunityId=item.id;
  registrationState=route.kind==='opportunity'?opportunityRegistrationState(item).key:'';
  const title=item.title||item.name||'تجربة طالب',body=route.kind==='opportunity'?opportunityDetail(item):route.kind==='provider'?providerDetail(item):experienceDetail(item),related=window.SaiStudentJourney.related(route.kind,item);
  host.innerHTML=`<div class="content-page-toolbar"><a class="text-link" data-content-back href="${esc(returnHash||'#'+route.section)}">العودة إلى القائمة</a><button class="button outline" type="button" data-copy-content="${href(route.kind,item.id)}">نسخ الرابط</button>${route.kind!=='experience'?saveButton(route.kind,item):''}</div><article class="content-reading ${route.kind==='experience'?'content-story':''}"><h1 tabindex="-1">${esc(title)}</h1>${body}${related?'<aside class="related-content">'+related+'</aside>':''}${window.SaiEngagement.actions(route.kind,item)}</article>`;
  document.title='سعي | '+title;host.querySelector('h1').focus({preventScroll:true});
 }
 function refresh(){const route=parse();if(!route||route.kind!=='opportunity')return;const item=catalog.opportunities.find(x=>x.id===route.id);if(item&&opportunityRegistrationState(item).key!==registrationState)render();}
 function restore(){if(!parse()&&positions.has(location.hash)){const y=positions.get(location.hash);requestAnimationFrame(()=>scrollTo({top:y,behavior:'instant'}));}}
 document.addEventListener('click',event=>{const button=event.target.closest('#content-page [data-detail],#content-page [data-provider],#content-page [data-experience]');if(button){event.preventDefault();event.stopImmediatePropagation();const kind=button.dataset.detail?'opportunity':button.dataset.provider?'provider':'experience';location.hash=href(kind,button.dataset.detail||button.dataset.provider||button.dataset.experience);}},true);
 document.addEventListener('click',async event=>{const button=event.target.closest('[data-copy-content]');if(!button)return;const url=new URL(button.dataset.copyContent,location.href).href;try{await navigator.clipboard.writeText(url);notice('تم نسخ الرابط.');}catch{show('رابط المحتوى',`<label class="platform-form">انسخ الرابط<input readonly value="${esc(url)}"></label>`);$('#dialog-body input').select();}});
 return {parse,href,render,refresh,remember,restore,modalLink};
})();
