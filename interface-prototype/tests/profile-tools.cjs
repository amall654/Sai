const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  window.accountToolsTest={read:false};
  window.SAI_BACKEND={session:async()=>({id:'student-tools',name:'أمل',role:'student'}),catalog:async()=>window.SAI_CONTENT,
   saved:async()=>[{kind:'provider',id:window.SAI_CONTENT.providers[0].id}],
   profile:async()=>({name:'أمل',interests:['البرمجة وهندسة البرمجيات'],learning_level:'beginner'}),myExperiences:async()=>[],
   notifications:async()=>({unread:accountToolsTest.read?0:2,checked_at:'2026-10-30T06:00:00Z',items:accountToolsTest.read?[]:[{id:'note-tools',kind:'experience',status:'published',title:'تجربتي',created_at:'2026-10-30T05:00:00Z',read_at:null}]}),
   readNotifications:async()=>{accountToolsTest.read=true;},suggestions:async()=>[],accountRequests:async()=>[],learningProgress:async()=>[],outcomes:async()=>[],logout:async()=>{}};
 });
 await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href+'#home');
 await page.waitForFunction(()=>!document.body.hasAttribute('data-booting'));
 for(const route of ['home','opportunities','learning','experiences']){
  await page.evaluate(route=>location.hash=route,route);await page.locator('[data-page='+route+']').waitFor();
  assert.equal(await page.locator('.header-actions a[href="#saved"],.header-actions a[href="#notifications"],.header-actions a[href="#journey"],[data-action="saved"],[data-compare-provider],[data-compare-open],#provider-comparison-bar').count(),0);
  assert.equal(await page.locator('[data-page='+route+'] [data-suggestion-open]').count(),0);
 }
 assert.equal(await page.evaluate(()=>typeof window.SaiProviderComparison),'undefined');
 assert.equal(await page.locator('script[src*="provider-comparison"],link[href*="provider-comparison"]').count(),0);
 await page.locator('#profile-link').click();await page.locator('#profile-tools-title').waitFor();
 assert.equal(await page.locator('.profile-tools-grid>a').count(),5);
 assert.equal(await page.locator('.profile-summary a').count(),0,'identity card must not repeat the tools');
 assert.equal(await page.locator('.profile-tools a[href="#admin"]').count(),0,'owner access is absent for students');
 await page.waitForFunction(()=>document.querySelector('#notifications-count').textContent==='2');
 assert.equal(await page.locator('#saved-count').innerText(),'1');
 assert.equal(await page.locator('#profile-link').getAttribute('href'),'#profile');
 for(const route of ['saved','journey','notifications','suggestions','support']){
  await page.locator('.profile-tools-grid a[href="#'+route+'"]').focus();await page.keyboard.press('Enter');
  await page.locator('[data-page='+route+']').waitFor();
  await page.locator('[data-page='+route+'] .account-back').click();await page.locator('#profile-tools-title').waitFor();
 }
 await page.locator('.profile-tools-grid a[href="#notifications"]').click();await page.locator('[data-read-all]').click();
 await page.waitForFunction(()=>accountToolsTest.read);await page.locator('[data-page=notifications] .account-back').click();
 await page.locator('#profile-tools-title').waitFor();assert.equal(await page.locator('#notifications-count').isVisible(),false);
 await page.locator('.profile-tools-grid a[href="#suggestions"]').click();await page.locator('[data-suggestion-open]').click();
 await page.locator('#suggestion-form [name=kind]').selectOption('provider');await page.keyboard.press('Escape');
 await page.locator('[data-page=suggestions] .account-back').click();await page.locator('#profile-tools-title').waitFor();
 for(const width of [320,390,430,768,1280]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'profile overflow at '+width);
  for(const link of await page.locator('.profile-tools-grid>a').all())assert.ok((await link.boundingBox()).height>=48);
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/profile-tools-mobile.png',fullPage:true});
 await page.locator('#language-toggle').click();await page.waitForFunction(()=>document.querySelector('#profile-tools-title').textContent==='My tools');
 assert.equal(await page.locator('.profile-tools').evaluate(el=>/[\u0600-\u06ff]/.test(el.innerText)),false);
 await page.evaluate(()=>{user.role='admin';loadProfile();});await page.locator('.profile-owner-tools a').waitFor();
 assert.equal(await page.locator('.profile-owner-tools a').getAttribute('href'),'#admin');
 await page.locator('#language-toggle').click();await page.setViewportSize({width:1280,height:960});
 await page.screenshot({path:'tmp/profile-tools-desktop.png'});await page.locator('.profile-tools').screenshot({path:'tmp/profile-tools-panel.png'});
 await page.locator('[data-action=logout]').click();await page.waitForFunction(()=>location.hash==='#home');
 assert.equal(await page.locator('.profile-tools-grid a').count(),0,'private tools cleared on sign-out');
 await page.evaluate(()=>location.hash='suggestions');await page.locator('#login-page').waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: no comparison, clean public pages/header, account-only tool grid, saved/unread counts, all tool routes and return links, suggestion entry, keyboard, mobile widths, English, owner separation and sign-out privacy.');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
