/* Draft assistance only: audio stays in memory until the student requests transcription. */
window.SaiExperienceAssistant=(()=>{
 let dispose=()=>{};
 function mount(form){
  dispose();
  const area=form.querySelector('[name="body"]');
  const box=document.createElement('section');box.className='experience-assistant';
  box.innerHTML=`<div class="owner-actions"><button type="button" data-record>سجّل تجربتك بصوتك</button><button type="button" data-rewrite>تحسين الصياغة</button></div><p class="muted">التسجيل حتى دقيقتين. لا يُرسل الصوت إلا عند اختيار تحويله إلى نص. راجع النص المقترح قبل استخدامه.</p><div data-audio hidden><audio controls></audio><button type="button" data-transcribe>تحويل إلى نص</button><button type="button" data-discard>حذف التسجيل</button></div><p data-feedback role="status" hidden></p><div data-proposal hidden><label>النص المقترح<textarea rows="6" maxlength="6000"></textarea></label><div class="owner-actions"><button type="button" data-accept>استخدام النص</button><button type="button" data-cancel>تجاهل</button></div></div>`;
  area.after(box);
  const q=s=>box.querySelector(s),record=q('[data-record]'),rewrite=q('[data-rewrite]'),feedback=q('[data-feedback]');
  let alive=true,stream=null,recorder=null,blob=null,url=null,timer=null,busy=false,original='',kind='';
  const say=(text,error=false)=>{feedback.textContent=text;feedback.hidden=!text;feedback.classList.toggle('is-error',error);};
  const tracks=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;};
  const discard=()=>{blob=null;if(url)URL.revokeObjectURL(url);url=null;q('audio').removeAttribute('src');q('[data-audio]').hidden=true;};
  const lock=value=>{busy=value;record.disabled=value;rewrite.disabled=value;q('[data-transcribe]').disabled=value;q('[data-discard]').disabled=value;form.querySelector('[type="submit"]').disabled=value;};
  const stop=()=>{clearTimeout(timer);if(recorder?.state==='recording')recorder.stop();tracks();};
  record.onclick=async()=>{
   if(recorder?.state==='recording'){stop();return;}
   if(busy)return;
   if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){say('التسجيل غير مدعوم في هذا المتصفح. يمكنك كتابة تجربتك.',true);return;}
   lock(true);say('اسمح باستخدام الميكروفون لبدء التسجيل.');
   try{
    const captured=await navigator.mediaDevices.getUserMedia({audio:true});
    if(!alive){captured.getTracks().forEach(t=>t.stop());return;}
    stream=captured;discard();const chunks=[];let bytes=0;
    recorder=new MediaRecorder(stream);
    recorder.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>10*1024*1024)stop();}};
    recorder.onerror=()=>{stop();if(alive)say('تعذّر إكمال التسجيل. حاول مجددًا.',true);};
    recorder.onstop=()=>{tracks();clearTimeout(timer);if(!alive)return;lock(false);record.textContent='سجّل تجربتك بصوتك';if(bytes>10*1024*1024){say('التسجيل أكبر من الحد المسموح. سجّل مقطعًا أقصر.',true);return;}blob=new Blob(chunks,{type:recorder.mimeType});if(!blob.size){say('لم يتم التقاط صوت. حاول مجددًا.',true);return;}url=URL.createObjectURL(blob);q('audio').src=url;q('[data-audio]').hidden=false;say('يمكنك سماع التسجيل قبل إرساله للتحويل.');};
    recorder.start(1000);record.disabled=false;record.textContent='إيقاف التسجيل';say('جارٍ التسجيل — يتوقف تلقائيًا بعد دقيقتين.');timer=setTimeout(stop,120000);
   }catch{tracks();if(alive){lock(false);say('تعذّر الوصول إلى الميكروفون. تحقق من الإذن أو اكتب تجربتك.',true);}}
  };
  async function request(action){
   if(busy)return;
   original=area.value;kind=action;
   if(action==='rewrite'&&original.trim().length<30){say('اكتب 30 حرفًا على الأقل لتحسين الصياغة.',true);return;}
   if(action==='transcribe'&&!blob)return;
   lock(true);q('[data-proposal]').hidden=true;say(action==='rewrite'?'جارٍ اقتراح صياغة…':'جارٍ تحويل الصوت إلى نص…');
   try{const text=await window.SaiServices.assistExperience(action,action==='rewrite'?original:blob);if(!alive)return;if(typeof text!=='string'||!text.trim()||text.length>6000)throw new Error('لم يصل نص صالح. جرّب مقطعًا أقصر.');q('[data-proposal] textarea').value=text;q('[data-proposal]').hidden=false;say('راجع الاقتراح؛ نصك الأصلي لم يتغير.');}
   catch(error){if(alive)say(error.message||'تعذّر تنفيذ الطلب. مسودتك محفوظة في النموذج.',true);}
   finally{if(alive)lock(false);}
  }
  rewrite.onclick=()=>request('rewrite');q('[data-transcribe]').onclick=()=>request('transcribe');
  q('[data-discard]').onclick=discard;
  q('[data-cancel]').onclick=()=>{q('[data-proposal]').hidden=true;};
  q('[data-accept]').onclick=()=>{
   if(area.value!==original){say('عدّلت النص أثناء تجهيز الاقتراح. انسخ ما يناسبك منه حتى لا نفقد تعديلك.',true);return;}
   const proposed=q('[data-proposal] textarea').value;
   const next=kind==='transcribe'?[original,proposed].filter(Boolean).join('\n\n'):proposed;
   if(next.length>6000){say('النص يتجاوز 6000 حرف. اختصر الاقتراح قبل استخدامه.',true);return;}
   area.value=next;area.dispatchEvent(new Event('input',{bubbles:true}));q('[data-proposal]').hidden=true;say('تم استخدام النص. يمكنك تعديله قبل الإرسال.');
  };
  const dialog=form.closest('dialog');
  const cleanup=()=>{alive=false;stop();discard();dialog?.removeEventListener('close',cleanup);};
  dialog?.addEventListener('close',cleanup);dispose=cleanup;
 }
 return {mount,dispose:()=>dispose()};
})();
