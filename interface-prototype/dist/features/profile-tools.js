/* Personal tools live in the account; public directories focus on their content. */
window.SaiProfileTools={
 render(){
  const tool=(href,label,symbol,extra='')=>`<a class="profile-tool" href="#${href}" ${href==='notifications'?'id="notifications-link"':''}>${icon(symbol)}<span>${label}</span>${extra}</a>`;
  return `<section class="profile-panel profile-tools" aria-labelledby="profile-tools-title"><h2 id="profile-tools-title">أدواتي</h2><nav class="profile-tools-grid" aria-label="أدوات الحساب">${tool('saved','المحفوظات','bookmark','<span id="saved-count" class="profile-tool-count" hidden></span>')}${tool('journey','خطوتك القادمة','compass')}${tool('notifications','التنبيهات','bell','<span id="notifications-count" class="profile-tool-count" hidden></span>')}${tool('suggestions','اقتراحاتي','plus')}${tool('support','مساعدة وطلبات البيانات','info')}</nav>${user?.role==='admin'?'<div class="profile-owner-tools"><a class="button outline" href="#admin">إدارة المحتوى</a></div>':''}</section>`;
 },
 syncSaved(){const count=document.querySelector('#saved-count');if(count){count.textContent=savedItems.length>99?'99+':savedItems.length;count.hidden=!savedItems.length;}}
};
