const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let upload,metadata,failUpload=false;
const user={id:'student-a',email_confirmed_at:'2026-10-26',user_metadata:{}};
const client={auth:{getSession:async()=>({data:{session:{user}}}),getUser:async()=>({data:{user}}),onAuthStateChange(){},updateUser:async value=>{metadata=value;user.user_metadata=value.data;return {error:null};}},rpc:async()=>({data:false}),storage:{from:bucket=>{
 assert.equal(bucket,'account-avatars');return {
 upload:async(name,blob,options)=>{upload={name,blob,options};return {error:failUpload?{}:null};},
 createSignedUrl:async(name,ttl)=>{assert.equal(name,'student-a/avatar.webp');assert.equal(ttl,3600);return {data:{signedUrl:'https://xzdhyccemkndxabwbrpe.supabase.co/storage/v1/object/sign/account-avatars/'+name+'?token=test'}};}
 };}}};
const context={window:{supabase:{createClient:()=>client}},location:{protocol:'https:',search:''},URLSearchParams,URL};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/auth-backend.js'),'utf8'),context);
(async()=>{
 const api=context.window.SAI_BACKEND;
 assert.equal((await api.session()).avatar,'');
 await assert.rejects(()=>api.updateAvatar({type:'image/svg+xml',size:100}));
 await assert.rejects(()=>api.updateAvatar({type:'image/webp',size:262145}));
 const result=await api.updateAvatar({type:'image/webp',size:1500});
 assert.equal(upload.name,'student-a/avatar.webp');assert.equal(upload.options.upsert,true);
 assert.equal(metadata.data.sai_avatar,true);assert.match(result,/token=test&v=/);
 assert.match((await api.session()).avatar,/student-a\/avatar.webp/);
 failUpload=true;await assert.rejects(()=>api.updateAvatar({type:'image/webp',size:1500}),/تعذّر حفظ/);
 console.log('PASS: owner-bound avatar path, image limits, upload failure, saved metadata and session reload.');
})().catch(e=>{console.error(e);process.exitCode=1;});
