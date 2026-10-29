const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const stories=Array.from({length:14},(_,i)=>({id:String(i),title:'تجربة '+i,body:'تعلمت مهارات جديدة من خلال العمل مع الفريق '.repeat(3),topic:i%2?'هاكاثون':'مسابقة',field:i%3?'تجربة عامة':'الأمن السيبراني والشبكات',published_at:`2026-10-${String(i+1).padStart(2,'0')}T10:00:00Z`,status:'published'}));
   stories[0].topic='';stories[0].field='';
   stories.forEach(e=>{e.revision=0;e.review_note='';});window.testStories=stories;window.SAI_BACKEND={session:async()=>({id:'test',name:'طالب',role:'admin'}),saved:async()=>[],catalog:async()=>({...window.SAI_CONTENT,experiences:stories}),submitExperience:async v=>{window.submitted=v;},ownerCatalog:async()=>({opportunities:[],fields:[],experiences:stories}),ownerReviewExperience:async(...args)=>{window.reviewed=args;}};
  });
  await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href+'#experiences');
  await page.waitForSelector('#experience-grid .card');
  assert.equal(await page.locator('#experience-grid .card').count(),6);
  assert.equal(await page.locator('[data-experience]').first().getAttribute('data-experience'),'13');
  await page.locator('#experience-more').click();assert.equal(await page.locator('#experience-grid .card').count(),12);
  await page.locator('#experience-more').click();assert.equal(await page.locator('#experience-grid .card').count(),14);assert.equal(await page.locator('#experience-more').isVisible(),false);
  await page.locator('#experience-filter-topic').selectOption('هاكاثون');assert.equal(await page.locator('#experience-count').textContent(),'6 / 7');
  await page.locator('#experience-filter-field').selectOption('الأمن السيبراني والشبكات');assert.equal(await page.locator('#experience-grid .card').count(),2);
  assert.equal(await page.locator('#experience-search').count(),0);await page.locator('#experience-filter-topic').selectOption('تدريب عملي');assert.equal(await page.locator('#experience-grid .card').count(),0);
  await page.locator('#experience-reset').click();await page.locator('#experience-filter-topic').selectOption('تجربة أخرى');assert.equal(await page.locator('#experience-grid .card').count(),1);
  await page.locator('[data-experience]').click();assert.match(await page.locator('#dialog-body').textContent(),/تجربة عامة/);await page.keyboard.press('Escape');
  await page.locator('#experience-reset').click();await page.locator('[data-action="contribute"]').click();
  await page.locator('#experience-draft').fill('تعلمت الكثير من خلال المشاركة والعمل مع الفريق في تجربة هاكاثون.');await page.locator('#experience-form input[type=checkbox]').check();
  await page.locator('#experience-form button[type=submit]').click();assert.equal(await page.evaluate(()=>window.submitted),undefined,'classification is required');
  await page.locator('#experience-topic').selectOption('هاكاثون');await page.locator('#experience-field').selectOption('تجربة عامة');await page.keyboard.press('Escape');
  await page.locator('[data-action="contribute"]').click();assert.equal(await page.locator('#experience-topic').inputValue(),'هاكاثون');assert.equal(await page.locator('#experience-field').inputValue(),'تجربة عامة');
  await page.locator('#experience-form input[type=checkbox]').check();await page.locator('#experience-form button[type=submit]').click();await page.waitForFunction(()=>window.submitted?.topic==='هاكاثون');
  await page.keyboard.press('Escape');await page.evaluate(()=>location.hash='admin');await page.locator('#owner-story-filter').selectOption('all');await page.locator('[data-owner-story="0"]').click();
  await page.locator('#owner-story-topic').selectOption('تعلّم ذاتي أو دورة');await page.locator('#owner-story-field').selectOption('تجربة عامة');await page.locator('[data-owner-decision="published"]').click();await page.waitForFunction(()=>window.reviewed);
  assert.deepEqual(await page.evaluate(()=>window.reviewed),['0','published','published',{topic:'تعلّم ذاتي أو دورة',field:'تجربة عامة',expected_topic:'تجربة أخرى',expected_field:'',revision:0,review_note:''}]);
  await page.evaluate(()=>location.hash='experiences');await page.locator('#language-toggle').click();await page.waitForFunction(()=>document.querySelector('#experience-filter-topic').textContent.includes('All topics'));
  await page.locator('#experience-filter-topic').selectOption('هاكاثون');assert.equal(await page.locator('#experience-count').textContent(),'6 / 7');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#language-toggle').click();await page.locator('#experience-reset').click();await page.screenshot({path:path.join(require('node:os').tmpdir(),'sai-experiences-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS: newest order, paging, combined topic/field filters, legacy fallback, required classification, drafts, submission, owner review, English values and mobile.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
