/* Account image: decode and resize locally; store only the compressed image. */
window.SaiAvatar={
 paint(element,url,name){
  element.replaceChildren();element.textContent=(name||'س').slice(0,1);
  if(!url)return;
  let parsed;try{parsed=new URL(url);}catch{return;}
  if(parsed.origin!=='https://xzdhyccemkndxabwbrpe.supabase.co'||!parsed.pathname.startsWith('/storage/v1/object/sign/account-avatars/'))return;
  const img=new Image();img.alt='';img.src=url;
  img.onerror=()=>{element.textContent=(name||'س').slice(0,1);};
  element.replaceChildren(img);
 },
 async prepare(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file?.type)||file.size>5*1024*1024)throw new Error('اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 5 ميجابايت.');
  const url=URL.createObjectURL(file),image=new Image();
  try{
   await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('تعذّر قراءة الصورة. اختر صورة أخرى.'));image.src=url;});
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
   const side=Math.min(image.naturalWidth,image.naturalHeight);
   canvas.getContext('2d').drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,256,256);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.85));
   if(!blob)throw new Error('تعذّر تجهيز الصورة. اختر صورة أخرى.');return blob;
  }finally{URL.revokeObjectURL(url);}
 },
 mount(profile){
  const host=document.querySelector('.profile-summary');
  const userId=user.id,version=accountVersion;
  user.avatar=profile.avatar||'';
  this.paint(host.querySelector('.profile-avatar'),user.avatar,profile.name||user.name);
  this.paint(document.querySelector('.profile-mini-avatar'),user.avatar,profile.name||user.name);
  const form=document.createElement('form');form.className='avatar-form';
  form.innerHTML='<label class="avatar-picker button outline"><span>صورة الحساب</span><input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="صورة الحساب" required></label><div class="avatar-preview" hidden></div><button class="button outline" type="submit" disabled hidden>حفظ الصورة</button><p class="form-feedback" role="status" hidden></p>';
  host.append(form);
  const input=form.querySelector('input'),button=form.querySelector('button'),message=form.querySelector('[role="status"]'),preview=form.querySelector('.avatar-preview');
  let prepared=null,previewUrl='',selection=0;
  const feedback=text=>{message.textContent=text;message.hidden=!text;};
  input.onchange=async()=>{
   const currentSelection=++selection;prepared=null;button.disabled=true;button.hidden=true;preview.hidden=true;feedback('');
   if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl='';
   if(!input.files[0])return;
   try{const blob=await this.prepare(input.files[0]);if(currentSelection!==selection||!form.isConnected)return;prepared=blob;previewUrl=URL.createObjectURL(blob);const img=new Image();img.alt='معاينة صورة الحساب';img.onload=()=>URL.revokeObjectURL(img.src);img.src=previewUrl;preview.replaceChildren(img);preview.hidden=false;button.disabled=false;button.hidden=false;}
   catch(error){if(currentSelection===selection)feedback(error.message);}
  };
  form.onsubmit=async event=>{
   event.preventDefault();if(!prepared||user?.id!==userId||accountVersion!==version)return;
   button.disabled=true;input.disabled=true;feedback('جارٍ حفظ الصورة…');
   try{const url=await api.updateAvatar(prepared);if(user?.id!==userId||accountVersion!==version)return;user.avatar=url;this.paint(host.querySelector('.profile-avatar'),url,profile.name||user.name);this.paint(document.querySelector('.profile-mini-avatar'),url,profile.name||user.name);feedback('تم حفظ صورة الحساب.');prepared=null;input.value='';preview.hidden=true;button.hidden=true;}
   catch(error){feedback(error.message);}
   finally{input.disabled=false;button.disabled=!prepared;}
  };
 }
};
