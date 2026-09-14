import {createRequire} from 'node:module';
const require=createRequire('C:/Users/SeniorPomidor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const {chromium}=require('playwright');
const base=process.env.CHECK_URL||'http://localhost:3000';
const browser=await chromium.launch({headless:true,channel:'chrome'});let count=0;const errors=[];
const check=(yes,label)=>{if(!yes)throw Error(label);count++;};
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/shop.html');await page.waitForSelector('.catalog-tools');
 check(await page.locator('.header-search').count()===0,'No header search');check(await page.locator('.catalog-link').isVisible(),'Catalog visible');
 await page.locator('[data-favorite="shade"]').scrollIntoViewIfNeeded();
 const before=await page.evaluate(()=>scrollY);await page.locator('[data-favorite="shade"]').click();await page.waitForTimeout(200);
 check(Math.abs(await page.evaluate(()=>scrollY)-before)<2,'Favorite must preserve scroll');
 if(width===1440){
 await page.locator('.category-details summary').click();await page.locator('[data-filter="top"]').click();check(!(await page.locator('.category-details').evaluate(e=>e.open)),'Category closes');
 const size=page.locator('details').filter({has:page.locator('#catalog-size')});await size.locator('summary').click();await page.locator('#catalog-size').selectOption('M');check(!(await size.evaluate(e=>e.open)),'Size closes');
 await size.locator('summary').click();await page.locator('.shop-section-head').click();check(!(await size.evaluate(e=>e.open)),'Outside click closes');
 await size.locator('summary').click();await page.keyboard.press('Escape');check(!(await size.evaluate(e=>e.open)),'Escape closes');
 await page.locator('.category-details summary').click();await page.screenshot({path:'verification/store-ui/filter-adjusted.png'});
 }
 await page.locator('.menu-toggle').click();check(JSON.stringify(await page.locator('#menu nav a').allTextContents())===JSON.stringify(['Главная','Магазин','Собери силуэт ↗','Избранное','Покупателям']),'Menu order');await page.keyboard.press('Escape');
 await page.goto(base+'/silhouette.html');check(await page.locator('.ribbon').count()===1,'Silhouette ribbon');await page.locator('.ribbon-toggle').click();check(await page.locator('.ribbon').evaluate(e=>e.classList.contains('paused')),'Ribbon pause');
 await page.goto(base+'/index.html');check(await page.locator('.carousel-arrows').count()===0,'Gallery arrows removed');if(width===1440)check(!(await page.locator('.story-position').isVisible()),'Desktop counter hidden');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow');await page.close();
}
check(!errors.length,'No JS errors');console.log(JSON.stringify({passed:count,errors}));await browser.close();
