/* Local exploration only: no account updates or stored preferences. */
(() => {
 const choices = [
  {title:'اكتشف فرصة',text:'ابدأ بفرصة مشاركة تلفت اهتمامك.',link:'#opportunities',action:'استكشف الفرص'},
  {title:'تعلّم',text:'تعرّف على جهة تساعدك في خطوتك التعليمية.',link:'#learning',action:'استكشف جهات التعلم'},
  {title:'استلهم',text:'اكتشف ما تعلّمه طالب سبقك بالتجربة.',link:'#experiences',action:'اقرأ تجارب الطلاب'},
  {title:'استكشف مجالًا جديدًا',text:'تصفّح مجالات الفرص، وجرّب اهتمامًا مختلفًا.',link:'#opportunities',action:'استكشف المجالات'}
 ];
 const wheel=document.querySelector('#discovery-wheel');
 const button=document.querySelector('#spin-wheel');
 const status=document.querySelector('#wheel-status');
 const destination=document.querySelector('#wheel-destination');
 let rotation=0, previous=-1, spinning=false, timer;
 button.addEventListener('click',()=>{
  if(spinning)return;
  spinning=true;button.disabled=true;button.textContent='تدور…';destination.hidden=true;
  status.textContent='نختار لك بداية للاستكشاف…';
  const candidates=choices.map((_,i)=>i).filter(i=>i!==previous);
  const selected=candidates[Math.floor(Math.random()*candidates.length)];
  const target=(360-selected*90)%360;
  rotation+=1080+(target-rotation%360+360)%360;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finish=()=>{
   if(!spinning)return;
   clearTimeout(timer);wheel.removeEventListener('transitionend',onEnd);
   previous=selected;spinning=false;button.disabled=false;button.textContent='جرّب مرة أخرى';
   const result=choices[selected];status.textContent=result.title+' — '+result.text;
   destination.href=result.link;destination.textContent=result.action;destination.hidden=false;
  };
  const onEnd=event=>{if(event.target===wheel&&event.propertyName==='transform')finish();};
  wheel.addEventListener('transitionend',onEnd);
  wheel.style.setProperty('--wheel-angle',rotation+'deg');
  if(reduced)finish();else timer=setTimeout(finish,3550);
 });
})();
