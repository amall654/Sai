/* Rule-based connections between published learning, opportunities and experiences. */
window.SaiStudentJourney=(()=>{
 const fields=item=>item.fields||[item.field].filter(x=>x&&x!=='تجربة عامة');
 const common=(a,b)=>fields(a).filter(f=>fields(b).includes(f)).length;
 function related(kind,item){
  const group=(title,items,attribute)=>items.length?`<section class="related-group"><h3>${title}</h3><div class="related-list">${items.map(x=>`<button type="button" class="related-item" ${attribute}="${esc(x.id)}"><strong>${esc(x.title||x.name||'تجربة طالب')}</strong><span>${esc(fields(x).join('، ')||x.topic||'')}</span></button>`).join('')}</div></section>`:'';
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
 }
 return {attach,common};
})();
