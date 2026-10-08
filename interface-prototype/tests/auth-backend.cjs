const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/auth-backend.js'),'utf8');
function storage(){const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
let session=null,options,authHandler,inserted,failInsert=false;
const verified={id:'student-a',email_confirmed_at:'2026-10-08',user_metadata:{name:'طالب',role:'admin'}};
const client={auth:{
 getSession:async()=>({data:{session}}),getUser:async()=>({data:{user:session?.user},error:null}),
 onAuthStateChange:fn=>{authHandler=fn;},
 signInWithPassword:async()=>{session={user:verified};return {error:null};},
 signUp:async()=>({data:{session:null},error:null}),
 signOut:async()=>{session=null;authHandler('SIGNED_OUT');return {error:null};},
 resetPasswordForEmail:async()=>({error:null}),updateUser:async()=>({error:null})
 },from:table=>({insert:async values=>{inserted={table,values};return {error:failInsert?{code:'42501'}:null};}})};
const local=storage(),tab=storage(),events=[];
const context={window:{supabase:{createClient:(url,key,o)=>{options=o;return client;}},dispatchEvent:e=>events.push(e.type)},location:{protocol:'https:',origin:'https://sai.example',pathname:'/',search:''},localStorage:local,sessionStorage:tab,URLSearchParams,Event,history:{replaceState(){}}};
vm.runInNewContext(source,context);
(async()=>{
 const api=context.window.SAI_BACKEND;
 assert.equal(await api.session(),null);
 await assert.rejects(()=>api.submitExperience({title:'',body:'x'.repeat(30),field:''}),/سجّل الدخول/);
 const u=await api.login({email:'example@example.com',password:'placeholder'});
 assert.equal(u.role,'student','metadata must never grant administrator privileges');
 await api.submitExperience({title:'تجربة',body:'x'.repeat(30),field:'تقنية',status:'published',user_id:'student-b'});
 assert.deepEqual(Object.keys(inserted.values).sort(),['body','field','title']);
 assert.equal(inserted.table,'experiences');
 failInsert=true;
 await assert.rejects(()=>api.submitExperience({title:'',body:'x'.repeat(30),field:''}),/تعذّر/);
 await assert.rejects(()=>api.signup({name:'طالب',email:'test@example.com',password:'1234567'}),/8/);
 await api.signup({name:'طالب',email:'test@example.com',password:'Ab12!xyz'});
 await assert.rejects(()=>api.changePassword('a-long-password'),/رابط الاستعادة/);
 options.auth.storage.setItem('sb-session','token');
 assert.equal(local.getItem('sb-session'),null);assert.equal(tab.getItem('sb-session'),'token');
 options.auth.storage.setItem('sb-code-verifier','verifier');assert.equal(local.getItem('sb-code-verifier'),'verifier');
 await api.logout();assert.equal(await api.session(),null);assert.ok(events.includes('sai:signout'));
 console.log('PASS: session validation, no metadata admin, owner/status payload exclusion, write failure, password length, recovery gating, session storage, logout.');
})().catch(e=>{console.error(e);process.exitCode=1;});
