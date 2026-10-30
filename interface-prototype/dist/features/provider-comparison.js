/* Compare published learning providers without storing account or browser data. */
window.SaiProviderComparison=window.SaiProviderComparison||(()=>{
 let selected=[];
 const providers=()=>catalog.providers.filter(p=>!p.status||p.status==='published');
 const find=id=>providers().find(p=>p.id===id);
 const selectedItems=()=>selected.map(find).filter(Boolean);
 const toggleLabel=chosen=>chosen?'إزالة من المقارنة':'أضف للمقارنة';
 function button(provider){const chosen=selected.includes(provider.id);return `<button type="button" class="text-link comparison-toggle" data-compare-provider="${esc(provider.id)}" aria-pressed="${chosen}" ${!chosen&&selected.length===2?'disabled':''}><span>${toggleLabel(chosen)}</span><span class="sr-only"> ${esc(provider.name)}</span></button>`;}
 function toolbar(){const items=selectedItems();return `<div class="comparison-toolbar" role="region" aria-label="مقارنة جهات التعلم"><div class="comparison-summary"><h2>مقارنة جهات التعلم</h2><p id="provider-comparison-status" class="muted" role="status"><span>اختر جهتين للمقارنة.</span> <bdi>${items.length} / 2</bdi></p><div class="comparison-selection">${items.map(p=>`<button type="button" class="comparison-chip" data-compare-provider="${esc(p.id)}"><span>${esc(p.name)}</span><span aria-hidden="true">×</span><span class="sr-only">إزالة من المقارنة</span></button>`).join('')}</div></div><div class="comparison-actions"><button type="button" class="button outline" data-compare-open ${items.length!==2?'disabled':''}>قارن الجهتين</button>${items.length?'<button type="button" class="text-link" data-compare-clear>مسح المقارنة</button>':''}</div></div>`;}
 const values=list=>(list||[]).filter(Boolean).length?`<div class="comparison-values">${list.filter(Boolean).map(value=>`<span class="badge">${esc(value)}</span>`).join('')}</div>`:'<span>غير محدد</span>';
 function card(provider){const guidance=providerGuidance(provider),labels=window.SaiLearningGuidance.labels;
  const fact=(name,body)=>`<div class="comparison-fact"><dt>${name}</dt><dd>${body}</dd></div>`;
  return `<article class="provider-comparison-card"><div class="comparison-provider-heading">${providerMark(provider)}<h3>${esc(provider.name)}</h3></div><dl class="comparison-facts">${fact('المجالات',values(provider.fields))}${fact('المستويات المتاحة',values((guidance.levels||[]).map(key=>labels.levels[key]||'غير محدد')))}${fact('نوع المحتوى',values(provider.contentTypes))}${fact('اللغة',provider.language?esc(provider.language):values((guidance.languages||[]).map(key=>labels.languages[key]||'غير محدد')))}${fact('التكلفة',esc(provider.cost||labels.costs[guidance.cost]||'غير محدد'))}</dl><div class="comparison-provider-link">${external(provider.url,'زيارة الجهة')}</div></article>`;
 }
 function renderComparison(){const items=selectedItems();if(items.length!==2){show('مقارنة جهات التعلم','<div data-provider-comparison><p class="comparison-empty">اختر جهتين متاحتين للمقارنة.</p><button type="button" class="button outline" data-compare-return>العودة إلى الجهات</button></div>',true);return;}show('مقارنة جهات التعلم',`<div class="provider-comparison-grid" data-provider-comparison>${items.map(card).join('')}</div>`,true);}
 function refresh(){selected=selected.filter(id=>!!find(id));const host=$('#provider-comparison-bar');if(host)host.innerHTML=toolbar();
  document.querySelectorAll('button[data-compare-provider]').forEach(el=>{const chosen=selected.includes(el.dataset.compareProvider);el.setAttribute('aria-pressed',String(chosen));el.disabled=!chosen&&selected.length===2;if(el.classList.contains('comparison-toggle'))el.innerHTML=`<span>${toggleLabel(chosen)}</span><span class="sr-only"> ${esc(find(el.dataset.compareProvider)?.name||'')}</span>`;});
  const dialog=$('#detail-dialog');if(dialog?.open&&dialog.querySelector('[data-provider-comparison]'))renderComparison();
 }
 function clear(){selected=[];refresh();}
 function focusToolbar(){const open=$('#provider-comparison-bar [data-compare-open]'),target=open&&!open.disabled?open:$('#provider-comparison-bar h2');if(target){if(target===open)target.focus();else{target.tabIndex=-1;target.focus({preventScroll:true});}}}
 document.addEventListener('click',event=>{const action=event.target.closest('button[data-compare-provider],button[data-compare-open],button[data-compare-clear],button[data-compare-return]');if(!action)return;
  if(action.hasAttribute('data-compare-provider')){const id=action.dataset.compareProvider;if(!find(id))return;const chosen=selected.includes(id);if(chosen)selected=selected.filter(value=>value!==id);else if(selected.length<2)selected.push(id);else return;refresh();if(!action.isConnected){const buttons=[...document.querySelectorAll('button[data-compare-provider]')];const replacement=buttons.find(el=>el.dataset.compareProvider===id&&el.getClientRects().length);if(replacement)replacement.focus();else focusToolbar();}}
  else if(action.hasAttribute('data-compare-open')){if(selectedItems().length===2)renderComparison();}
  else if(action.hasAttribute('data-compare-clear')){clear();focusToolbar();}
  else{$('#detail-dialog')?.close();location.hash='learning';}
 });
 return {button,toolbar,refresh,clear};
})();
