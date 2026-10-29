const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({timezoneId:'America/New_York'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.testNow=Date.parse('2026-10-26T20:59:59Z');Date.now=()=>window.testNow;
  const common={title:'فرصة اختبار',description:'وصف',sourceUrl:'https://example.com',registrationUrl:'https://example.com/register',fields:[],type:'هاكاثون'};
  const opportunities=[{...common,id:'date',registrationKind:'date',deadlineAt:'2026-10-26T21:00:00Z'},{...common,id:'expired',registrationKind:'exact',deadlineAt:'2026-10-25T21:00:00Z'},{...common,id:'ongoing',registrationKind:'ongoing'},{...common,id:'unknown',registrationKind:'unknown'}];
  window.SAI_BACKEND={session:async()=>({id:'test',role:'admin',name:'اختبار'}),saved:async()=>[],catalog:async()=>({...window.SAI_CONTENT,opportunities}),ownerCatalog:async()=>({fields:[],experiences:[],opportunities:[{id:'locked',title:'مثبتة',source_name:'جهة',source_url:'https://example.com',description:'وصف',original_text:'تفاصيل',type:'hackathon',status:'published',registration_kind:'date',registration_date:'2026-10-26',deadline_at:'2026-10-26T21:00:00Z',registration_locked:true}]}),ownerSaveOpportunity:async payload=>{window.savedPayload=payload;}};
 });
 await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href+'#opportunities');
 await page.waitForSelector('[data-detail="date"]');assert.equal(await page.locator('#opportunity-grid .card').count(),2);
 await page.locator('[data-detail="date"]').click();assert.equal(await page.locator('#dialog-body .opportunity-actions a').count(),1);
 await page.evaluate(()=>{window.testNow=Date.parse('2026-10-26T21:00:00Z');refreshRegistrationAvailability();});
 assert.equal(await page.locator('#opportunity-grid .card').count(),1);assert.equal(await page.locator('#dialog-body .opportunity-actions a').count(),0);assert.match(await page.locator('#dialog-body').innerText(),/انتهى التسجيل/);await page.keyboard.press('Escape');
 await page.evaluate(()=>location.hash='admin');await page.locator('[data-owner-new]').click();
 const form=page.locator('#owner-opportunity-form');await form.locator('[name=title]').fill('فرصة جديدة');await form.locator('[name=source_name]').fill('جهة');await form.locator('[name=description]').fill('وصف');await form.locator('[name=original_text]').fill('تفاصيل');await form.locator('[name=source_url]').fill('https://example.com');await form.locator('[name=status]').selectOption('published');
 await form.locator('[type=submit]').click();assert.equal(await page.evaluate(()=>window.savedPayload),undefined);assert.match(await page.locator('#owner-edit-feedback').innerText(),/موعد التسجيل/);
 await form.locator('[name=registration_kind]').selectOption('exact');await form.locator('[name=deadline_at]').fill('2026-11-05T23:30');await form.locator('[type=submit]').click();await page.waitForFunction(()=>window.savedPayload);assert.equal(await page.evaluate(()=>window.savedPayload.deadline_at),'2026-11-05T20:30:00.000Z','Saudi time independent of device timezone');
 await page.locator('[data-owner-edit="locked"]').click();assert.equal(await page.locator('#registration-settings select').isDisabled(),true);await page.locator('#owner-opportunity-form [type=submit]').click();await page.waitForFunction(()=>window.savedPayload.id==='locked');assert.equal(await page.evaluate(()=>window.savedPayload.deadline_at),'2026-10-26T21:00:00Z');
 await page.evaluate(()=>{location.hash='opportunities';dialog.close();window.testNow=Date.parse('2026-11-20T21:00:00Z');catalog.opportunities=[{id:'estimated',title:'فرصة بموعد افتراضي',description:'وصف',sourceUrl:'https://example.com',type:'هاكاثون',fields:[],registrationKind:'date',deadlineEstimated:true,deadlineAt:'2026-11-21T21:00:00Z'}];renderOpportunities();});
 assert.match(await page.locator('#opportunity-grid').innerText(),/ينتهي عرضها خلال 3 أيام/);await page.locator('[data-detail="estimated"]').click();
 await page.evaluate(()=>{window.testNow=Date.parse('2026-11-21T21:00:00Z');refreshRegistrationAvailability();});assert.equal(await page.locator('#opportunity-grid .card').count(),0);assert.match(await page.locator('#dialog-body').innerText(),/انتهت فترة العرض في سعي/);assert.equal(await page.locator('#dialog-body .opportunity-actions a').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: date boundary, expired and unknown exclusion, ongoing, open detail expiry, required deadline, Saudi timezone and locked original preservation.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
