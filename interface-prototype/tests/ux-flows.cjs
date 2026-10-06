const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const url = pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href;
(async()=>{
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{window.SAI_CATALOG={catalog:async()=>window.SAI_CONTENT};});
  await page.goto(url);await page.waitForSelector('#opportunity-grid .card',{state:'attached'});
  const pilot = await page.evaluate(()=>window.SAI_CONTENT);
  const fields = pilot.interests.filter(field=>field!=='الكل');
  assert.equal(fields.length,3);
  for(const item of [...pilot.opportunities,...pilot.providers]){
   assert.ok(item.fields.every(field=>fields.includes(field)));
  }
  await page.evaluate(()=>location.hash='opportunities');
  for(const field of fields){
   await page.locator('[data-interest]').filter({hasText:field}).click();
   assert.ok(await page.locator('#opportunity-grid .card').count()>0);
  }
  await page.locator('[data-interest="الكل"]').click();
  await page.locator('#language-toggle').click();
  await page.locator('#opportunity-search').fill('cybersecurity');
  assert.ok(await page.locator('#opportunity-grid .card').count()>0);
  assert.equal(await page.locator('#opportunity-grid').evaluate(el=>/[\u0600-\u06ff]/.test(el.innerText)),false);
  await page.locator('#opportunity-search').fill('');
  await page.locator('#language-toggle').click();
  assert.equal(await page.locator('[data-action="preview-account"]').count(),0);
  for(const route of ['opportunities','learning','experiences','home']){await page.evaluate(r=>location.hash=r,route);await page.locator(`[data-page="${route}"]`).waitFor({state:'visible'});assert.equal(await page.locator('[data-page]:visible').count(),1);}
  await page.evaluate(()=>location.hash='opportunities');await page.locator('#opportunity-search').fill('zzzz-no-match');await page.locator('#empty-opportunities').waitFor({state:'visible'});await page.locator('#opportunity-search').fill('');
  await page.locator('[data-save]').first().click();await page.locator('#login-page').waitFor({state:'visible'});
  await page.locator('#email').fill('test@example.com');await page.locator('#password').fill('not-a-real-password');await page.locator('#auth-submit').click();await page.waitForFunction(()=>document.querySelector('#auth-feedback').textContent.includes('لم تُربط'));assert.equal(await page.locator('#password').inputValue(),'');
  await page.locator('#auth-mode-link').click();assert.equal(await page.locator('#signup-name').isVisible(),true);await page.locator('#auth-mode-link').click();await page.locator('[data-action="forgot"]').click();assert.equal(await page.locator('#auth-password').isVisible(),false);
  await page.evaluate(()=>location.hash='learning');await page.locator('#provider-search').fill('zzzz');assert.equal(await page.locator('#provider-grid .provider-card').count(),0);await page.locator('#provider-search').fill('');await page.locator('[data-provider]').first().click();await page.locator('#detail-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>location.hash='opportunities');await page.locator('#opportunities-page').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(require('node:os').tmpdir(),'ux-mobile-check.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  const account = await browser.newPage({viewport:{width:390,height:844}});
  await account.addInitScript(()=>{
   let logged=false;let saved=[];let experiences=[];
   window.SAI_BACKEND={
    session:async()=>logged?{id:'test',name:'طالبة',role:'admin'}:null,
    catalog:async()=>window.SAI_CONTENT,
    login:async()=>{logged=true;return {id:'test',name:'طالبة',role:'admin'};},
    signup:async()=>({}),resetPassword:async()=>({}),logout:async()=>{logged=false;},
    saved:async()=>saved,setSaved:async v=>{saved=saved.filter(s=>s.id!==v.id);if(v.value)saved.push({id:v.id,kind:v.kind});},
    profile:async()=>({name:'طالبة',interests:[],skills:[]}),updateProfile:async()=>({}),
    myExperiences:async()=>experiences,submitExperience:async v=>{experiences.push({...v,status:'pending'});},
    addContent:async()=>({})
   };
  });
  account.on('pageerror',e=>errors.push(e.message));await account.goto(url+'#opportunities');await account.locator('[data-save]').first().click();await account.locator('#email').fill('test@example.com');await account.locator('#password').fill('password');await account.locator('#auth-submit').click();await account.locator('#opportunities-page').waitFor({state:'visible'});await account.waitForFunction(()=>document.querySelector('#saved-count').textContent==='1');
  await account.evaluate(()=>location.hash='saved');await account.locator('#saved-content .card').waitFor();
  await account.evaluate(()=>location.hash='experiences');await account.locator('[data-action="contribute"]').click();await account.locator('#experience-draft').fill('بدأت التجربة بسؤال صغير وتعلمت كيف أبحث وأتعاون مع الآخرين وأستفيد من الأخطاء.');await account.locator('#experience-form [type="checkbox"]').check();await account.screenshot({path:path.join(require('node:os').tmpdir(),'ux-experience-check.png')});await account.locator('#experience-form [type="submit"]').click();await account.waitForFunction(()=>document.querySelector('#dialog-title').textContent==='وصلتنا تجربتك');await account.locator('#dialog-body a').click();await account.locator('#profile-form').waitFor();assert.ok((await account.locator('#profile-content').innerText()).includes('قيد المراجعة'));
  await account.locator('#profile-form [name="name"]').fill('اسمي الجديد');await account.locator('#profile-form [type="submit"]').click();await account.waitForFunction(()=>document.querySelector('#profile-feedback').textContent==='تم حفظ تعديلاتك.');
  await account.evaluate(()=>location.hash='admin');await account.locator('#content-form').waitFor();await account.locator('[name="title"]').fill('فرصة اختبار');await account.locator('[name="originalText"]').fill('نص المنشور الأصلي');await account.locator('[name="sourceUrl"]').fill('https://example.com');await account.locator('#content-form [type="submit"]').click();await account.waitForFunction(()=>document.querySelector('#content-feedback').textContent==='تم حفظ المحتوى.');
  await account.evaluate(()=>location.hash='profile');await account.locator('#profile-form').waitFor();await account.locator('[data-action="logout"]').click();await account.locator('[data-page="home"]').waitFor({state:'visible'});await account.evaluate(()=>location.hash='profile');await account.locator('#login-page').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);console.log('PASS: guest flows, filters, auth modes, disconnected errors, mobile overflow, mock integration, save return, moderation, profile, admin and logout.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
