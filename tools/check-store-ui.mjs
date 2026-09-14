import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
const require=createRequire('C:/Users/SeniorPomidor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];const results=[];
await mkdir('verification/store-ui',{recursive:true});
function assert(value,label){if(!value)throw Error(label);results.push(label);}
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/shop.html');await page.waitForSelector('.catalog-tools');
 if(width<801&&page.url().endsWith('shop.html')){assert(!(await page.locator('.filter-panel').isVisible()),'mobile filters start closed');await page.locator('#filter-toggle').click();assert(await page.locator('.filter-panel').isVisible(),'mobile filters open');await page.locator('#filter-toggle').click();}assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: no page overflow`);
 await page.screenshot({path:`verification/store-ui/shop-${width}.png`});
 await page.locator('[data-favorite="orbit"]').click();
 assert(await page.locator('.favorites-count').textContent()==='1',`${width}: favorite badge updates`);
 if(width<701){await page.locator('.menu-toggle').click();await page.locator('.menu-favorites').click();}else await page.locator('.header-favorites').click();await page.waitForSelector('.catalog-tools');
 assert(await page.locator('.product-card:visible').count()===1,`${width}: favorites route`);
 await page.locator('.product-image[data-product="orbit"]').click();
 assert(await page.locator('.related-card').count()===6,`${width}: related products`);
 assert(await page.locator('#add-to-bag').isDisabled(),`${width}: size required`);
 await page.locator('#size-picker label').first().click();await page.locator('#add-to-bag').click();
 assert(await page.locator('#bag-count').textContent()==='1',`${width}: add to cart`);
 await page.locator('.related-products').scrollIntoViewIfNeeded();await page.screenshot({path:`verification/store-ui/product-${width}.png`});
 await page.locator('.related-card').first().click();assert(await page.locator('#product-title').textContent()!=='Футболка ORBIT',`${width}: related navigation`);
 await page.locator('#product-dialog [data-close-dialog]').click();
 await page.goto('http://localhost:3000/shop.html?search=1');await page.waitForSelector('.catalog-tools');
 assert(await page.locator('#catalog-search').isVisible(),`${width}: search opens`);
 await page.locator('#catalog-search').fill('ORBIT');assert(await page.locator('.product-card:visible').count()===1,`${width}: search works`);
 await page.reload();await page.waitForSelector('.catalog-tools');assert(await page.locator('#catalog-search').inputValue()==='ORBIT',`${width}: query persists`);
 await page.locator('#reset-filters').click();assert(await page.locator('.product-card:visible').count()===26,`${width}: reset filters`);
 const form=page.locator('main .store-newsletter form');await form.locator('[type=email]').fill('test@example.com');
 assert(!(await form.evaluate(f=>f.checkValidity())),`${width}: consents required`);
 for(const c of await form.locator('[type=checkbox]').all())await c.check();await form.locator('[type=submit]').click();
 assert((await form.locator('[role=status]').textContent()).includes('не сохранён'),`${width}: honest demo submission`);
 for(const route of ['buyers.html','silhouette.html','index.html']){
 await page.goto('http://localhost:3000/'+route);await page.waitForSelector('.catalog-link');
 assert(await page.locator('.bag-link svg').count()===1,`${width}: ${route} bag icon`);
 if(width<801&&page.url().endsWith('shop.html')){assert(!(await page.locator('.filter-panel').isVisible()),'mobile filters start closed');await page.locator('#filter-toggle').click();assert(await page.locator('.filter-panel').isVisible(),'mobile filters open');await page.locator('#filter-toggle').click();}assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: ${route} no overflow`);
 await page.locator('.menu-toggle').click();assert(await page.locator('.menu-close').evaluate(e=>e===document.activeElement),`${width}: ${route} menu focus`);
 if(route==='buyers.html')await page.screenshot({path:`verification/store-ui/menu-${width}.png`});await page.keyboard.press('Escape');
 }
 await page.close();
}
assert(!errors.length,'No browser JavaScript errors');
await writeFile('verification/store-ui/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors}));await browser.close();



