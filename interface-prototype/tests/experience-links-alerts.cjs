const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

(async () => {
 const browser = await chromium.launch({channel:'msedge', headless:true});
 try {
  const page = await browser.newPage({viewport:{width:1280,height:960}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
   const field = 'البرمجة وهندسة البرمجيات';
   const body = 'تعلمت من هذه التجربة أهمية تنظيم المهام والتعلم المستمر والتعاون مع أعضاء الفريق قبل بدء المشاركة.';
   const provider = (id,name,status='published') => ({id,name,status,fields:[field],description:'جهة تعليمية تقدم مسارات تقنية وتطبيقات عملية.',details:'دروس ومشروعات عملية في تطوير البرمجيات.',url:'https://example.com/'+id,language:'العربية',cost:'مجاني',contentTypes:['دورات'],guidance:{levels:['beginner'],cost:'free',languages:['ar']}});
   const opportunity = (id,title,deadlineAt,status='published') => ({id,title,deadlineAt,status,fields:[field],type:'هاكاثون',mode:'عن بُعد',description:'فرصة للتعلم والتعاون وبناء مشروع تقني.',sourceName:'المصدر الرسمي',sourceUrl:'https://example.com/'+id,registrationUrl:'https://example.com/'+id+'/register',registrationKind:'deadline',deadline:'حتى نهاية فترة التسجيل'});
   const story = (id,title,related_kind=null,related_id=null) => ({id,title,body,field,topic:'هاكاثون',status:'published',related_kind,related_id,published_at:'2026-10-20T06:00:00Z',publishedAt:'20 أكتوبر 2026'});
   window.linkChecks = {
    submissions:[], revisions:[],
    providers:[provider('provider-a','الجهة الأولى'),provider('provider-b','الجهة الثانية'),provider('provider-c','الجهة الثالثة'),provider('provider-draft','جهة مخفية','draft')],
    opportunities:[opportunity('opportunity-main','فرصة الاختبار الرئيسية','2099-12-31T20:59:00Z'),opportunity('opportunity-expired','فرصة انتهى التسجيل فيها','2000-01-01T00:00:00Z')],
    experiences:[story('story-a','تجربة مرتبطة بالأولى','provider','provider-a'),story('story-b','تجربة مرتبطة بالثانية','provider','provider-b'),story('story-opportunity','تجربة مرتبطة بالفرصة','opportunity','opportunity-main'),story('story-general','تجربة عامة في المجال')],
    privateStories:[{...story('revision-a','تجربة تحتاج إلى تعديل','provider','provider-a'),status:'rejected',revision:7,review_note:'أضف النصيحة التي تعلمتها.'},{...story('revision-legacy','تجربة مرتبطة بجهة غير متاحة','provider','unavailable-provider'),status:'rejected',revision:3,review_note:'راجع النص قبل إعادة الإرسال.'}],
    notes:[{id:'alert-opportunity',kind:'opportunity',target_id:'opportunity-main',title:'فرصة الاختبار الرئيسية',created_at:'2026-10-29T06:00:00Z',read_at:null},{id:'alert-story',kind:'experience',experience_id:'revision-a',status:'rejected',title:'تجربة تحتاج إلى تعديل',note:'أضف النصيحة التي تعلمتها.',created_at:'2026-10-29T05:00:00Z',read_at:null}]
   };
   const state = window.linkChecks;
   window.SAI_BACKEND = {
    session:async()=>({id:'student',name:'طالب سعي',role:'student'}),
    saved:async()=>[],
    catalog:async()=>({...window.SAI_CONTENT,providers:state.providers,opportunities:state.opportunities,experiences:state.experiences,interests:[field]}),
    profile:async()=>({name:'طالب سعي',interests:[field]}),
    myExperiences:async()=>state.privateStories,
    submitExperience:async payload=>{if(state.failSubmit)throw Error('تعذّر الإرسال التجريبي');state.submissions.push(payload);},
    resubmitExperience:async(id,revision,payload)=>{state.revisions.push({id,revision,payload});Object.assign(state.privateStories.find(row=>row.id===id),payload,{status:'pending',revision:revision+1,review_note:''});},
    notifications:async()=>({items:state.notes,unread:state.notes.filter(n=>!n.read_at).length,checked_at:'2026-10-29T07:00:00Z'}),
    readNotifications:async id=>state.notes.forEach(n=>{if(!id||n.id===id)n.read_at='2026-10-29T07:00:00Z';}),
    accountRequests:async()=>[],learningProgress:async()=>[],outcomes:async()=>[],logout:async()=>{}
   };
  });
  await page.goto(pathToFileURL(path.resolve('interface-prototype/dist/index.html')).href+'#experiences');
  await page.locator('#experience-grid [data-experience="story-a"]').waitFor();

  // The optional picker offers published providers and only currently available opportunities.
  await page.locator('#experiences-page [data-action="contribute"]').click();
  const association = page.locator('#experience-form [name="related_content"]');
  assert.equal(await association.getAttribute('required'),null);
  assert.equal(await association.inputValue(),'');
  assert.equal(await association.locator('optgroup').count(),2);
  assert.equal(await association.locator('option[value="provider:provider-draft"]').count(),0);
  assert.equal(await association.locator('option[value="opportunity:opportunity-expired"]').count(),0);
  await page.locator('#experience-form [name="title"]').fill('إرسال تجربة عن جهة محددة');
  await page.locator('#experience-form [name="topic"]').selectOption('تعلّم ذاتي أو دورة');
  await page.locator('#experience-form [name="field"]').selectOption('البرمجة وهندسة البرمجيات');
  await association.selectOption('provider:provider-a');
  await page.locator('#experience-form [name="body"]').fill('تعلمت من الدورات أهمية الممارسة اليومية وتنفيذ المشروعات الصغيرة لتثبيت المفاهيم وتطوير مهارات البرمجة.');
  await page.locator('#experience-form [type="checkbox"]').check();
  await page.evaluate(()=>linkChecks.failSubmit=true);
  await page.locator('#experience-form [type="submit"]').click();
  await page.getByText('تعذّر الإرسال التجريبي',{exact:true}).waitFor();
  assert.equal(await association.inputValue(),'provider:provider-a','a failed submission must preserve the association');
  assert.equal(await page.evaluate(()=>linkChecks.submissions.length),0);
  await page.evaluate(()=>linkChecks.failSubmit=false);
  await page.locator('#experience-form [type="submit"]').click();
  await page.getByRole('heading',{name:'وصلتنا تجربتك',exact:true}).waitFor();
  assert.deepEqual(await page.evaluate(()=>({kind:linkChecks.submissions[0].related_kind,id:linkChecks.submissions[0].related_id})),{kind:'provider',id:'provider-a'});
  await page.locator('#close-dialog').click();

  // Empty is a supported choice: sending a general experience explicitly sends null keys.
  await page.locator('#experiences-page [data-action="contribute"]').click();
  assert.equal(await association.inputValue(),'','a successful submission must clear the prior association draft');
  await page.locator('#experience-form [name="topic"]').selectOption('هاكاثون');
  await page.locator('#experience-form [name="field"]').selectOption('البرمجة وهندسة البرمجيات');
  await page.locator('#experience-form [name="body"]').fill('في هذه المشاركة تعلمت توزيع الأدوار بين أفراد الفريق ومراجعة المتطلبات قبل البدء في تنفيذ المشروع.');
  await page.locator('#experience-form [type="checkbox"]').check();
  await page.locator('#experience-form [type="submit"]').click();
  await page.getByRole('heading',{name:'وصلتنا تجربتك',exact:true}).waitFor();
  assert.deepEqual(await page.evaluate(()=>({kind:linkChecks.submissions[1].related_kind,id:linkChecks.submissions[1].related_id})),{kind:null,id:null});
  await page.locator('#close-dialog').click();

  // Resubmission starts with the previous link, can change its kind, and preserves revision control.
  await page.evaluate(()=>location.hash='profile');
  await page.locator('.profile-experience').filter({has:page.locator('[data-revise-story="revision-a"]')}).locator('summary').click();
  await page.locator('[data-revise-story="revision-a"]').click();
  assert.equal(await page.locator('#revise-story-form [name="related_content"]').inputValue(),'provider:provider-a');
  await page.locator('#revise-story-form [name="related_content"]').selectOption('opportunity:opportunity-main');
  await page.locator('#revise-story-form [type="checkbox"]').check();
  await page.locator('#revise-story-form [type="submit"]').click();
  await page.waitForFunction(()=>linkChecks.revisions.length===1);
  assert.deepEqual(await page.evaluate(()=>({id:linkChecks.revisions[0].id,revision:linkChecks.revisions[0].revision,kind:linkChecks.revisions[0].payload.related_kind,target:linkChecks.revisions[0].payload.related_id})),{id:'revision-a',revision:7,kind:'opportunity',target:'opportunity-main'});
  await page.locator('.profile-experience').filter({has:page.locator('[data-revise-story="revision-legacy"]')}).locator('summary').click();
  await page.locator('[data-revise-story="revision-legacy"]').click();
  assert.equal(await page.locator('#revise-story-form [name="related_content"]').inputValue(),'provider:unavailable-provider','an unavailable prior association must not silently disappear');
  await page.locator('#revise-story-form [name="related_content"]').selectOption('');
  await page.locator('#revise-story-form [type="checkbox"]').check();
  await page.locator('#revise-story-form [type="submit"]').click();
  await page.waitForFunction(()=>linkChecks.revisions.length===2);
  assert.deepEqual(await page.evaluate(()=>({revision:linkChecks.revisions[1].revision,kind:linkChecks.revisions[1].payload.related_kind,id:linkChecks.revisions[1].payload.related_id})),{revision:3,kind:null,id:null});

  async function content(route) {
   await page.evaluate(value=>location.hash=value,route);
   await page.locator('#content-page h1').waitFor();
   await page.waitForFunction(value=>document.querySelector('#content-page').dataset.contentId===value,route.split('/').pop());
   return page.locator('#content-page .related-content');
  }
  // Explicit links outrank broad field matches and never leak into another provider's stories.
  let related = await content('learning/provider-a');
  assert.equal(await related.locator('[data-experience="story-a"]').count(),1);
  assert.equal(await related.locator('[data-experience="story-b"],[data-experience="story-opportunity"],[data-experience="story-general"]').count(),0);
  related = await content('learning/provider-b');
  assert.equal(await related.locator('[data-experience="story-b"]').count(),1);
  assert.equal(await related.locator('[data-experience="story-a"],[data-experience="story-opportunity"]').count(),0);
  related = await content('learning/provider-c');
  assert.equal(await related.locator('[data-experience="story-general"]').count(),1);
  assert.equal(await related.locator('[data-experience="story-a"],[data-experience="story-b"],[data-experience="story-opportunity"]').count(),0,'fallback field matching must exclude stories linked explicitly elsewhere');
  related = await content('opportunities/opportunity-main');
  assert.equal(await related.locator('[data-experience="story-opportunity"]').count(),1);
  assert.equal(await related.locator('[data-experience="story-a"],[data-experience="story-b"]').count(),0);

  // The story itself exposes its exact associated content once, with a usable direct route.
  related = await content('experiences/story-a');
  assert.equal(await related.locator('[data-provider="provider-a"]').count(),1,'the direct association must not also repeat among generic suggestions');
  assert.match(await related.locator('.related-group').first().innerText(),/الجهة المرتبطة بالتجربة/);
  assert.equal(await page.locator('#content-page .experience-linked a').getAttribute('href'),'#learning/provider-a');
  await related.locator('[data-provider="provider-a"]').click();
  await page.waitForFunction(()=>location.hash==='#learning/provider-a');
  related = await content('experiences/story-opportunity');
  assert.equal(await related.locator('[data-detail="opportunity-main"]').count(),1);
  assert.match(await related.locator('.related-group').first().innerText(),/الفرصة المرتبطة بالتجربة/);
  assert.equal(await page.locator('#content-page .experience-linked a').getAttribute('href'),'#opportunities/opportunity-main');

  // A new-opportunity alert opens that opportunity; a moderation alert opens private submissions.
  await page.evaluate(()=>location.hash='notifications');
  const opportunityAlert = page.locator('.care-card').filter({has:page.locator('[data-read-notification="alert-opportunity"]')});
  const storyAlert = page.locator('.care-card').filter({has:page.locator('[data-read-notification="alert-story"]')});
  await opportunityAlert.waitFor();
  assert.equal(await opportunityAlert.locator('a').getAttribute('href'),'#opportunities/opportunity-main');
  assert.equal(await storyAlert.locator('a').getAttribute('href'),'#profile');
  assert.match(await opportunityAlert.locator('h2').innerText(),/فرصة جديدة/);
  assert.match(await storyAlert.locator('h2').innerText(),/تجربتك/);
  await opportunityAlert.locator('a').click();
  await page.waitForFunction(()=>location.hash==='#opportunities/opportunity-main');
  await page.locator('#content-page h1').waitFor();
  assert.equal(await page.locator('#content-page h1').innerText(),'فرصة الاختبار الرئيسية');
  await page.evaluate(()=>location.hash='notifications');
  await storyAlert.locator('a').click();
  await page.locator('#profile-form').waitFor();
  assert.equal(await page.evaluate(()=>location.hash),'#profile');

  await page.setViewportSize({width:390,height:844});
  await page.locator('#profile-page [data-action="contribute"]').click();
  assert.equal(await association.isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('#detail-dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);
  assert.deepEqual(errors,[]);
  console.log('PASS: optional association availability, retained retry and mapped submission/resubmission keys, legacy-link clearing, exact related-content priority and exclusion, direct linked routes, distinct opportunity/story notification CTAs and mobile form layout.');
 } finally {
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
