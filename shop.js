// All commercial data is fictional, explicitly authorized for this demo.
import { products } from './catalog.mjs';
const heartIcon = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const storageKey = 'picloms-demo-bag-v1';
const productDialog = document.querySelector('#product-dialog');
const bagDialog = document.querySelector('#bag-dialog');
const addButton = document.querySelector('#add-to-bag');
const productStatus = document.querySelector('#product-status');
const bagContent = document.querySelector('#bag-content');
let selectedProduct = null;
let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) cart = saved.filter(item => item && products.some(p => p.id === item.id && p.sizes.includes(item.size)) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99).map(({id,size,quantity}) => ({id,size,quantity}));
} catch { /* Private browsing and corrupted storage start with an empty bag. */ }

function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* The current session still works. */ }
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('#bag-count').textContent = count;
  document.querySelector('.bag-toggle').setAttribute('aria-label', `Открыть корзину, товаров: ${count}`);
}

function openDialog(dialog) {
  dialog.returnFocus = document.activeElement;
  dialog.showModal();
  document.body.classList.add('menu-open');
  dialog.scrollTop = 0;
}

for (const dialog of [productDialog, bagDialog]) {
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    const address = new URL(location.href);
    const parameter = dialog === productDialog ? 'product' : 'view';
    if (address.searchParams.has(parameter)) {
      address.searchParams.delete(parameter);
      history.replaceState(null, '', address);
    }
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('menu-open');
    if (dialog.returnFocus?.isConnected) dialog.returnFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const elements = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,summary,[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}

function showProduct(id) {
  selectedProduct = products.find(p => p.id === id);
  if (!selectedProduct) return;
  document.querySelector('#product-title').textContent = selectedProduct.title;
  document.querySelector('#product-price').textContent = money(selectedProduct.price);
  document.querySelector('#product-description').textContent = selectedProduct.description;
  const photo = document.querySelector('#product-preview-image');
  photo.src = selectedProduct.image;
  photo.alt = `${selectedProduct.title}, вид спереди`;
  document.querySelector('.color-line').textContent = `Цвет / ${selectedProduct.color}`;
  document.querySelector('#product-article').textContent = `Артикул / PCL.${selectedProduct.id.toUpperCase()}`;
  document.querySelector('#product-fit').textContent = `${selectedProduct.fit}. Доступные размеры: ${selectedProduct.sizes.join(', ')}.`;
  document.querySelector('#product-material').textContent = selectedProduct.material;
  renderGallery(selectedProduct);syncFavorites();
  const sizeOptions = document.querySelector('#size-picker .size-options');
  sizeOptions.replaceChildren(...selectedProduct.sizes.map(size => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'size'; input.value = size;
    const text = document.createElement('span'); text.textContent = size;
    label.append(input, text);
    return label;
  }));
  resetZoom();
  document.querySelectorAll('[name="size"]').forEach(input => { input.checked = false; });
  addButton.disabled = true;
  addButton.textContent = 'Выберите размер';
  productStatus.textContent = '';
  renderRelated(selectedProduct);
  if(!productDialog.open) openDialog(productDialog);
  else {productDialog.scrollTop=0;productDialog.querySelector('[data-close-dialog]').focus({preventScroll:true});}
}

document.querySelectorAll('[data-product]').forEach(element => element.addEventListener('click', event => {
  event.preventDefault();
  showProduct(element.dataset.product);
}));

document.querySelector('#size-picker').addEventListener('change', () => {
  addButton.disabled = false;
  addButton.textContent = `В корзину · ${money(selectedProduct.price)}`;
  productStatus.textContent = '';
});

addButton.addEventListener('click', () => {
  const size = document.querySelector('[name="size"]:checked')?.value;
  if (!selectedProduct || !selectedProduct.sizes.includes(size)) return;
  const existing = cart.find(item => item.id === selectedProduct.id && item.size === size);
  if (existing?.quantity >= 99) { productStatus.textContent = 'В демо-корзину можно добавить до 99 одинаковых вещей.'; return; }
  if (existing) existing.quantity++;
  else cart.push({id:selectedProduct.id, size, quantity:1});
  saveCart();
  productStatus.replaceChildren();
  const label = document.createElement('span');
  label.textContent = `${selectedProduct.name}, ${size} — добавлено. `;
  const link = document.createElement('button');
  link.className = 'plain-button';
  link.textContent = 'Открыть корзину';
  link.addEventListener('click', () => {
    const originalFocus = productDialog.returnFocus;
    productDialog.addEventListener('close', () => { renderCart(); openDialog(bagDialog); bagDialog.returnFocus = originalFocus; }, {once:true});
    productDialog.close();
  });
  productStatus.append(label, link);
});

document.querySelector('#product-size-guide').addEventListener('click', () => {
  location.href = 'buyers.html#sizes';
});

function renderCart() {
  if (!cart.length) {
    bagContent.innerHTML = '<div class="bag-empty"><p>В корзине пока нет вещей.</p><button class="solid-button" data-continue>Посмотреть коллекцию</button></div>';
    return;
  }
  const items = cart.map((item, index) => {
    const product = products.find(p => p.id === item.id);
    return `<article class="bag-line"><img src="${product.image}" alt="${product.title}" width="95" height="110"><div><h3>${product.title}</h3><p>${item.size} / ${product.color} · ${money(product.price)} за шт.</p><p>${money(product.price * item.quantity)}</p><div class="bag-quantity"><button data-quantity="${index}" data-step="-1" aria-label="Уменьшить количество ${product.name}, ${item.size}">−</button><span aria-live="polite">${item.quantity}</span><button data-quantity="${index}" data-step="1" aria-label="Увеличить количество ${product.name}, ${item.size}" ${item.quantity>=99?'disabled':''}>+</button><button class="remove-item" data-remove="${index}" aria-label="Удалить ${product.name}, ${item.size}">Удалить</button></div></div></article>`;
  }).join('');
  const total = cart.reduce((sum,item) => sum + products.find(p=>p.id===item.id).price * item.quantity, 0);
  bagContent.innerHTML = `${items}<div class="bag-total"><span>Товары</span><span>${money(total)}</span></div><p class="demo-note">Пример доставки: 450 ₽. Итого с доставкой: ${money(total+450)}.</p><button class="solid-button bag-checkout" data-checkout>Завершить демо-заказ</button><button class="plain-button" data-continue>Продолжить выбор</button>`;
}

bagContent.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-continue')) {
    const catalog = document.querySelector('#pieces');
    catalog.setAttribute('tabindex','-1');
    bagDialog.returnFocus = catalog;
    bagDialog.close();
    catalog.scrollIntoView({behavior:'instant'});
  } else if (button.hasAttribute('data-quantity')) {
    const index = Number(button.dataset.quantity);
    cart[index].quantity += Number(button.dataset.step);
    if (cart[index].quantity <= 0) cart.splice(index,1);
    saveCart(); renderCart();
    (bagContent.querySelector(`[data-quantity="${index}"][data-step="${button.dataset.step}"]:not(:disabled)`) || bagContent.querySelector(`[data-quantity="${index}"]:not(:disabled)`) || bagContent.querySelector('button')).focus();
  } else if (button.hasAttribute('data-remove')) {
    cart.splice(Number(button.dataset.remove),1);
    saveCart(); renderCart(); bagContent.querySelector('button').focus();
  } else if (button.hasAttribute('data-checkout')) {
    cart = []; saveCart();
    bagContent.innerHTML = '<div class="order-done" role="status" tabindex="-1"><h3>Демо-заказ завершён</h3><p>Вы прошли сценарий покупки. Деньги не списывались, заказ никуда не отправлен.</p><button class="solid-button" data-continue>Вернуться к вещам</button></div>';
    bagContent.querySelector('.order-done').focus();
  }
});

document.querySelectorAll('.bag-toggle,[data-open-bag]').forEach(button => button.addEventListener('click', () => {renderCart();openDialog(bagDialog);}));
saveCart();
document.documentElement.classList.add('shop-ready');
const featured = [...products];
for(let i=featured.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[featured[i],featured[j]]=[featured[j],featured[i]];}
try{const previous=sessionStorage.getItem('picloms-last-feature');if(featured.length>1&&featured[0].id===previous)[featured[0],featured[1]]=[featured[1],featured[0]];sessionStorage.setItem('picloms-last-feature',featured[0].id);}catch{}
let featureIndex=0;
function changeFeature(step){
  featureIndex=(featureIndex+step+featured.length)%featured.length;
  const p=featured[featureIndex], section=document.querySelector('.product-feature');
  const photo=section.querySelector('.feature-photo img');photo.src=p.image;photo.alt=p.title;
  section.querySelector('.photo-label').textContent=p.name;
  section.querySelector('h2').textContent=p.name;
  section.querySelector('.feature-subtitle').textContent=p.title;
  section.querySelector('.feature-description').textContent=p.description;
  section.querySelectorAll('dd').forEach((el,i)=>el.textContent=[p.material,p.fit,p.sizes.join(', ')][i]);
  section.querySelector('.feature-buy>span').textContent=money(p.price);
  section.querySelector('.feature-buy button').dataset.product=p.id;
  document.querySelector('#feature-count').textContent=`${String(featureIndex+1).padStart(2,'0')} / ${String(featured.length).padStart(2,'0')}`;
}
document.querySelector('#feature-prev').addEventListener('click',()=>changeFeature(-1));
document.querySelector('#feature-next').addEventListener('click',()=>changeFeature(1));
changeFeature(0);
const favoriteKey='picloms-favorites-v1';
let favorites=new Set();
try{const saved=JSON.parse(localStorage.getItem(favoriteKey)||'[]');if(Array.isArray(saved))favorites=new Set(saved.filter(id=>products.some(p=>p.id===id)));}catch{}
function syncFavorites(){
 document.querySelectorAll('[data-favorite]').forEach(button=>{const yes=favorites.has(button.dataset.favorite);button.setAttribute('aria-pressed',String(yes));button.innerHTML=heartIcon;button.setAttribute('aria-label',`${yes?'Убрать из избранного':'В избранное'}: ${products.find(p=>p.id===button.dataset.favorite)?.title}`);});
 const button=document.querySelector('#product-favorite'),yes=favorites.has(selectedProduct?.id);button.innerHTML=heartIcon;button.setAttribute('aria-pressed',String(yes));button.setAttribute('aria-label',yes?'Убрать из избранного':'Добавить в избранное');
}
function toggleFavorite(id){if(favorites.has(id))favorites.delete(id);else favorites.add(id);try{localStorage.setItem(favoriteKey,JSON.stringify([...favorites]));}catch{}syncFavorites();window.dispatchEvent(new Event('favorites-changed'));filterCollection(currentCategory);}
document.querySelector('#product-favorite').addEventListener('click',()=>{if(selectedProduct)toggleFavorite(selectedProduct.id);});
const zoomArea=document.querySelector('.product-preview'),zoomImage=document.querySelector('#product-preview-image'),zoomInput=document.querySelector('#photo-zoom');
let zoom=1,panX=0,panY=0,touchStart=null,hovering=false;
function applyZoom(){const maxX=zoomArea.clientWidth*(zoom-1)/2,maxY=zoomArea.clientHeight*(zoom-1)/2;panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));zoomImage.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;zoomInput.value=zoom;document.querySelector('#zoom-value').textContent=`${Math.round(zoom*100)}%`;}
function resetZoom(){zoom=1;panX=panY=0;hovering=false;applyZoom();}
zoomInput.addEventListener('input',()=>{hovering=false;zoom=Number(zoomInput.value);applyZoom();});
document.querySelector('#reset-photo').addEventListener('click',resetZoom);
zoomArea.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||!matchMedia('(hover:hover)').matches)return;if(zoom===1){zoom=2;hovering=true;}const r=zoomArea.getBoundingClientRect();panX=(.5-(event.clientX-r.left)/r.width)*r.width*(zoom-1);panY=(.5-(event.clientY-r.top)/r.height)*r.height*(zoom-1);applyZoom();});
zoomArea.addEventListener('pointerleave',()=>{if(hovering)resetZoom();});
const touchDistance=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
zoomArea.addEventListener('touchstart',event=>{hovering=false;touchStart=event.touches.length===2?{distance:touchDistance(event.touches),zoom}:event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,panX,panY}:null;},{passive:true});
zoomArea.addEventListener('touchmove',event=>{if(!touchStart)return;if(event.touches.length===2&&touchStart.distance){event.preventDefault();zoom=Math.max(1,Math.min(3,touchStart.zoom*touchDistance(event.touches)/touchStart.distance));applyZoom();}else if(event.touches.length===1&&zoom>1&&touchStart.x!==undefined){event.preventDefault();panX=touchStart.panX+event.touches[0].clientX-touchStart.x;panY=touchStart.panY+event.touches[0].clientY-touchStart.y;applyZoom();}},{passive:false});
zoomArea.addEventListener('touchend',()=>{touchStart=null;});
zoomArea.addEventListener('keydown',event=>{if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='0')resetZoom();else if(event.key==='+'||event.key==='=')zoom=Math.min(3,zoom+.2);else if(event.key==='-')zoom=Math.max(1,zoom-.2);else{panX+=event.key==='ArrowLeft'?30:event.key==='ArrowRight'?-30:0;panY+=event.key==='ArrowUp'?30:event.key==='ArrowDown'?-30:0;}applyZoom();}});
function renderGallery(product){const photos=[{src:product.image,label:'Изделие'}];if(product.id==='orbit')photos.push({src:'assets/orbit-editorial.png',label:'На модели'});const thumbs=document.querySelector('.gallery-thumbs');thumbs.replaceChildren();photos.forEach((photo,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',photo.label);button.setAttribute('aria-pressed',String(index===0));const image=document.createElement('img');image.src=photo.src;image.alt='';button.append(image);button.addEventListener('click',()=>{zoomImage.src=photo.src;zoomImage.alt=`${product.title}: ${photo.label}`;resetZoom();thumbs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});thumbs.append(button);});}
const route = new URLSearchParams(location.search);
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.product-card[data-category]')];
let currentCategory='all';
const controls=document.createElement('div');controls.className='catalog-tools';
controls.innerHTML=`<div class="filter-heading"><span>Фильтры</span><button id="reset-filters" type="button">Сбросить</button></div>
<details class="catalog-search"><summary>Поиск</summary><label>Название или материал<input id="catalog-search" type="search" placeholder="Найти вещь" autocomplete="off"></label></details>
<details><summary>Сортировка <span id="sort-caption">Коллекция</span></summary><label>Порядок<select id="catalog-sort"><option value="default">Коллекция</option><option value="price-up">Сначала дешевле</option><option value="price-down">Сначала дороже</option><option value="name">По названию</option></select></label></details>
<details class="category-details"><summary>Раздел <span id="category-caption">Все вещи</span></summary></details>
<details><summary>Цена <span id="price-caption">Любая</span></summary><label>Цена до, ₽<input id="catalog-price" type="number" min="0" step="100" inputmode="numeric" placeholder="Любая"></label></details>
<details><summary>Цвет <span id="color-caption">Любой</span></summary><label>Цвет<select id="catalog-color"><option value="">Любой цвет</option></select></label></details>
<details><summary>Размер <span id="size-caption">Все</span></summary><label>Размер<select id="catalog-size"><option value="">Все размеры</option></select></label></details>
<button id="favorites-only" type="button" aria-pressed="false" hidden>Избранное</button>`;
document.querySelector('.product-grid').before(controls);
controls.querySelector('.category-details').append(document.querySelector('.catalog-filters'));
const filterPanel=document.createElement('div');filterPanel.id='filter-panel';filterPanel.className='filter-panel';
filterPanel.append(...controls.querySelectorAll(':scope > details'));
controls.append(filterPanel);
const filterToggle=document.createElement('button');filterToggle.id='filter-toggle';filterToggle.type='button';filterToggle.textContent='Фильтры';filterToggle.setAttribute('aria-expanded','false');filterToggle.setAttribute('aria-controls','filter-panel');
controls.querySelector('.filter-heading span').replaceWith(filterToggle);
filterToggle.addEventListener('click',()=>{const expanded=filterToggle.getAttribute('aria-expanded')!=='true';filterToggle.setAttribute('aria-expanded',String(expanded));controls.classList.toggle('filters-expanded',expanded);});
filterPanel.children[1].classList.add('sort-details');
const desktopFilters=matchMedia('(min-width:801px)');
const inlineFilters=[filterPanel.querySelector('.catalog-search'),filterPanel.querySelector('.sort-details')];
const adaptFilters=()=>{for(const detail of inlineFilters)detail.open=desktopFilters.matches;};
adaptFilters();desktopFilters.addEventListener('change',adaptFilters);
for(const detail of filterPanel.children)detail.addEventListener('toggle',()=>{if(detail.open&&desktopFilters.matches&&!inlineFilters.includes(detail))for(const other of filterPanel.children)if(other!==detail&&!inlineFilters.includes(other))other.open=false;});
const colorFilter=document.querySelector('#catalog-color');
[...new Set(products.map(p=>p.color))].forEach(color=>colorFilter.append(new Option(color,color)));
const empty=document.createElement('p');empty.className='catalog-empty';empty.hidden=true;empty.textContent='Ничего не найдено. Измените фильтры или добавьте вещи в избранное.';document.querySelector('.product-grid').after(empty);
const search=document.querySelector('#catalog-search'),priceLimit=document.querySelector('#catalog-price'),sizeFilter=document.querySelector('#catalog-size'),sort=document.querySelector('#catalog-sort'),favoritesOnly=document.querySelector('#favorites-only');
[...new Set(products.flatMap(p=>p.sizes))].forEach(size=>sizeFilter.append(new Option(size,size)));
cards.forEach(card=>{const id=card.querySelector('[data-product]')?.dataset.product;card.dataset.id=id;const button=document.createElement('button');button.type='button';button.className='favorite-heart';button.dataset.favorite=id;button.addEventListener('click',()=>toggleFavorite(id));card.append(button);});
syncFavorites();
for(const input of [search,priceLimit,sizeFilter,sort,colorFilter])input.addEventListener('input',()=>filterCollection(currentCategory,true));
favoritesOnly.addEventListener('click',()=>{favoritesOnly.setAttribute('aria-pressed',String(favoritesOnly.getAttribute('aria-pressed')!=='true'));filterCollection(currentCategory,true);});
document.querySelector('#reset-filters').addEventListener('click',()=>{search.value=priceLimit.value=sizeFilter.value=colorFilter.value='';sort.value='default';favoritesOnly.setAttribute('aria-pressed','false');filterCollection('all',true);});
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('image-revealed');reveal.unobserve(entry.target);}}),{rootMargin:'100px'});
cards.forEach(card=>{const img=card.querySelector('img');img.loading='lazy';img.decoding='async';if(!matchMedia('(prefers-reduced-motion: reduce)').matches){card.classList.add('image-reveal');reveal.observe(card);}});
function filterCollection(category, updateAddress = false) {
  if (!['all', 'graphic', 'top', 'bottom', 'accessories'].includes(category)) category = 'all';
  currentCategory=category;
  const term=search.value.trim().toLocaleLowerCase('ru'),maximum=priceLimit.value===''?Infinity:Math.max(0,Number(priceLimit.value)),only=favoritesOnly.getAttribute('aria-pressed')==='true';
  cards.forEach(card=>{const p=products.find(p=>p.id===card.dataset.id);card.hidden=(category!=='all'&&p.category!==category)||!`${p.title} ${p.description} ${p.material}`.toLocaleLowerCase('ru').includes(term)||p.price>maximum||(sizeFilter.value&&!p.sizes.includes(sizeFilter.value))||(colorFilter.value&&p.color!==colorFilter.value)||(only&&!favorites.has(p.id));});
  const ordered=[...cards];if(sort.value!=='default')ordered.sort((a,b)=>{const x=products.find(p=>p.id===a.dataset.id),y=products.find(p=>p.id===b.dataset.id);return sort.value==='price-up'?x.price-y.price:sort.value==='price-down'?y.price-x.price:x.title.localeCompare(y.title,'ru');});
  document.querySelector('.product-grid').append(...ordered);empty.hidden=cards.some(card=>!card.hidden);
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  const status = document.querySelector('#filter-status');
  if (status) status.textContent = `Изделий: ${cards.filter(card => !card.hidden).length}`;
  document.querySelector('.shop-section-head h2').textContent=only?'Избранное':'Вещи PICLOMS';
  document.querySelector('#sort-caption').textContent=sort.selectedOptions[0].textContent;
  document.querySelector('#category-caption').textContent=filters.find(b=>b.dataset.filter===category)?.textContent||'Все вещи';
  document.querySelector('#price-caption').textContent=priceLimit.value?money(Number(priceLimit.value)):'Любая';
  document.querySelector('#color-caption').textContent=colorFilter.value||'Любой';
  document.querySelector('#size-caption').textContent=sizeFilter.value||'Все';
  if (updateAddress) {
    const address = new URL(location.href);
    if (category === 'all') address.searchParams.delete('category');
    else address.searchParams.set('category', category);
    if(only)address.searchParams.set('favorites','1');else address.searchParams.delete('favorites');
    for(const [key,value] of [['q',search.value],['price',priceLimit.value],['size',sizeFilter.value],['color',colorFilter.value],['sort',sort.value==='default'?'':sort.value]]){if(value)address.searchParams.set(key,value);else address.searchParams.delete(key);}
    history.replaceState(null, '', address);
  }
}
filters.forEach(button => button.addEventListener('click', () => filterCollection(button.dataset.filter, true)));
if(route.get('favorites')==='1')favoritesOnly.setAttribute('aria-pressed','true');
search.value=route.get('q')||'';priceLimit.value=route.get('price')||'';sizeFilter.value=route.get('size')||'';colorFilter.value=route.get('color')||'';sort.value=route.get('sort')||'default';if(!sort.value)sort.value='default';
filterCollection(route.get('category') || 'all');
if(route.get('search')==='1'){controls.classList.add('filters-expanded');filterToggle.setAttribute('aria-expanded','true');controls.querySelector('.catalog-search').open=true;search.focus();}

if (route.get('view') === 'bag') { renderCart(); openDialog(bagDialog); bagDialog.returnFocus = document.querySelector('.bag-toggle'); }
else if (products.some(p => p.id === route.get('product'))) {
  showProduct(route.get('product'));
  productDialog.returnFocus = document.querySelector(`.product-image[data-product="${route.get('product')}"]`);
}

function renderRelated(product){
 let section=productDialog.querySelector('.related-products');
 if(!section){section=document.createElement('section');section.className='related-products';productDialog.append(section);}
 const related=products.filter(p=>p.id!==product.id).sort((a,b)=>Number(b.category===product.category)-Number(a.category===product.category)||Math.abs(a.price-product.price)-Math.abs(b.price-product.price)).slice(0,6);
 section.innerHTML='<div class="related-heading"><h2>Смотреть также</h2><div><button type="button" data-slide="-1" aria-label="Предыдущие похожие товары">←</button><button type="button" data-slide="1" aria-label="Следующие похожие товары">→</button></div></div><div class="related-track" tabindex="0" aria-label="Похожие товары">'+related.map(p=>`<a class="related-card" href="?product=${p.id}" data-related="${p.id}"><img src="${p.image}" alt="${p.title}" loading="lazy" width="260" height="300"><span>${p.title}</span><span>${money(p.price)}</span></a>`).join('')+'</div>';
 const track=section.querySelector('.related-track');
 section.querySelectorAll('[data-related]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showProduct(a.dataset.related);}));
 section.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>track.scrollBy({left:Number(b.dataset.slide)*track.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})));
 const update=()=>{section.querySelector('[data-slide="-1"]').disabled=track.scrollLeft<=1;section.querySelector('[data-slide="1"]').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;};track.addEventListener('scroll',update);requestAnimationFrame(update);
 if(productDialog.querySelector('.store-newsletter')) productDialog.append(productDialog.querySelector('.store-newsletter'));
}

