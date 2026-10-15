const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-results');await fs.mkdir(out,{recursive:true});
 const walk=async dir=>(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();
 const files=(await walk(path.join(root,'dist'))).filter(f=>f.endsWith('.html'));const failures=[];let checks=0;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext();const page=await context.newPage();page.on('pageerror',e=>failures.push(e.message));
 const base='http://127.0.0.1:4174';
 for(const width of [360,390,412,430,1440]){
  await page.setViewportSize({width,height:900});
  for(const file of files){const rel=path.relative(path.join(root,'dist'),file).replaceAll('\\','/');await page.goto(base+'/'+rel);await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)failures.push(`${width}px overflow: ${rel}`);
   const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));if(broken.length)failures.push(...broken);checks++;
   if(width===390&&['index.html','community/index.html','support/index.html','support/report-bug/index.html','contact/index.html','download/index.html','fusions/ultrakill-minecraft/index.html'].includes(rel))await page.screenshot({path:path.join(out,rel.replaceAll('/','-')+'.png'),fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.getByRole('button',{name:'Toggle navigation'}).click();assert.equal(await page.locator('#primary-nav').isVisible(),true);await page.getByRole('button',{name:'Toggle navigation'}).click();
 await page.locator('#how-it-works').screenshot({path:path.join(out,'mobile-how-it-works.png')});
 await page.goto(base+'/fusions/');await page.locator('#fusion-search').fill('Killcraft');assert.equal(await page.locator('[data-fusion-card]:visible').count(),1);await page.locator('#fusion-search').fill('nothing-match');assert.equal(await page.locator('#no-results').isVisible(),true);
 await page.goto(base+'/community/');await page.getByLabel('Game A',{exact:true}).fill('Bully');await page.getByLabel('Game B',{exact:true}).fill('Skate 3');await page.getByRole('button',{name:'Send suggestion'}).click();await page.waitForSelector('.form-result[data-state=success]');
 assert.equal(await page.getByRole('link',{name:'Join the Discord',exact:true}).getAttribute('href'),'https://discord.gg/zRZH4dEVkG');
 await page.goto(base+'/support/report-bug/');await page.getByLabel('Fusion',{exact:true}).selectOption('launcher');await page.getByLabel('Windows version',{exact:true}).fill('Windows 11 — preview test');await page.getByLabel('What happened?',{exact:true}).fill('Local preview test only');await page.getByLabel('What did you expect to happen?',{exact:true}).fill('Report saved');await page.getByLabel('Steps to reproduce',{exact:true}).fill('Open preview and submit');await page.locator('input[type=file]').setInputFiles({name:'test.log',mimeType:'text/plain',buffer:Buffer.from('Preview diagnostic test')});await page.getByRole('button',{name:'Send bug report'}).click();await page.waitForSelector('.form-result[data-state=success]');await page.screenshot({path:path.join(out,'mobile-bug-success.png'),fullPage:true});
 await page.goto(base+'/fusions/ultrakill-minecraft/');await page.locator('input[name=stars][value="5"]').check();await page.getByRole('button',{name:'Save rating'}).click();await page.waitForSelector('.form-result[data-state=success]');await page.reload();await page.waitForFunction(()=>document.querySelector('[data-rating-summary]').textContent.includes('5.0'));assert.equal(await page.locator('input[value="5"]').isChecked(),true);
 const other=await browser.newContext({viewport:{width:390,height:844}});const device=await other.newPage();await device.goto(base+'/fusions/ultrakill-minecraft/');await device.waitForFunction(()=>document.querySelector('[data-rating-summary]').textContent.includes('5.0'));assert.equal(await device.locator('input[value="5"]').isChecked(),false);await other.close();
 await page.route('**/api/suggestions',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Unable to save right now. Please try again, or email support@fuserift.co.uk.'})}));await page.goto(base+'/community/');await page.getByLabel('Game A',{exact:true}).fill('A');await page.getByLabel('Game B',{exact:true}).fill('B');await page.getByRole('button',{name:'Send suggestion'}).click();await page.waitForSelector('.form-result[data-state=error]');assert.equal(await page.getByLabel('Game A',{exact:true}).inputValue(),'A');await page.unroute('**/api/suggestions');
 await page.goto(base+'/contact/');assert.equal(await page.getByRole('link',{name:'Email support',exact:true}).getAttribute('href'),'mailto:support@fuserift.co.uk');
 await page.goto(base+'/download/');assert.equal(await page.locator('a[href*="apps.microsoft.com"]').count(),0);assert.equal(await page.getByText('Coming soon',{exact:true}).count(),1);
 const result={pageViewportChecks:checks,failures,interactionChecks:['mobile menu','catalogue search/empty state','suggestion submission','bug with log submission','ratings refresh','shared ratings on fresh browser','error preserves form','Discord target','email link','Store remains coming soon']};await fs.writeFile(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));await browser.close();assert.deepEqual(failures,[]);console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
