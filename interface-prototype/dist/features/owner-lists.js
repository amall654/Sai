/* Keep owner lists readable as the catalog grows; filtering happens before paging. */
window.SaiOwnerLists={
 limit(host,size=9){
  const old=host.nextElementSibling;if(old?.classList.contains('owner-pagination'))old.remove();
  const rows=[...host.children];if(rows.length<=size)return;
  let page=0;const pages=Math.ceil(rows.length/size),nav=document.createElement('nav');nav.className='owner-pagination';nav.dataset.list=host.id;nav.setAttribute('aria-label','صفحات المحتوى');
  nav.innerHTML='<button type="button" class="button outline" data-owner-prev>السابق</button><span role="status" aria-live="polite"></span><button type="button" class="button outline" data-owner-next>التالي</button>';
  host.after(nav);const prev=nav.querySelector('[data-owner-prev]'),next=nav.querySelector('[data-owner-next]'),counter=nav.querySelector('span');
  const render=()=>{host.replaceChildren(...rows.slice(page*size,(page+1)*size));counter.textContent=(page+1)+' / '+pages;prev.disabled=page===0;next.disabled=page===pages-1;};
  const move=delta=>{page+=delta;render();const heading=host.querySelector('h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}host.scrollIntoView({block:'start',behavior:'instant'});};
  prev.onclick=()=>move(-1);next.onclick=()=>move(1);render();
 }
};
