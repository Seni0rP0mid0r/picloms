// All commercial data is fictional, explicitly authorized for this demo.
import { products } from './catalog.mjs';
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
    const elements = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')].filter(el => el.getClientRects().length);
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
  document.querySelector('.color-line').textContent = `${selectedProduct.color} · ${selectedProduct.material} · ${selectedProduct.fit}`;
  document.querySelector('[data-photo="detail"]').textContent = 'Детали ближе';
  const sizeOptions = document.querySelector('#size-picker .size-options');
  sizeOptions.replaceChildren(...selectedProduct.sizes.map(size => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'size'; input.value = size;
    const text = document.createElement('span'); text.textContent = size;
    label.append(input, text);
    return label;
  }));
  document.querySelector('.product-preview').classList.remove('zoom');
  document.querySelectorAll('[data-photo]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.photo === 'full')));
  document.querySelectorAll('[name="size"]').forEach(input => { input.checked = false; });
  addButton.disabled = true;
  addButton.textContent = 'Выберите размер';
  productStatus.textContent = '';
  openDialog(productDialog);
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

document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.product-preview').classList.toggle('zoom', button.dataset.photo === 'detail');
  document.querySelectorAll('[data-photo]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
}));

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
const featured = ['orbit','feral','veil','patch','noct','clasp'].map(id=>products.find(p=>p.id===id)).filter(Boolean);
let featureIndex=0;
function changeFeature(step){
  featureIndex=(featureIndex+step+featured.length)%featured.length;
  const p=featured[featureIndex], section=document.querySelector('.product-feature');
  const photo=section.querySelector('.feature-photo img');photo.src=p.id==='orbit'?'assets/orbit-editorial.png':p.image;photo.alt=p.title;
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
const route = new URLSearchParams(location.search);
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.product-card[data-category]')];
function filterCollection(category, updateAddress = false) {
  if (!['all', 'graphic', 'top', 'bottom', 'accessories'].includes(category)) category = 'all';
  cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  const status = document.querySelector('#filter-status');
  if (status) status.textContent = `Изделий: ${cards.filter(card => !card.hidden).length}`;
  if (updateAddress) {
    const address = new URL(location.href);
    if (category === 'all') address.searchParams.delete('category');
    else address.searchParams.set('category', category);
    history.replaceState(null, '', address);
  }
}
filters.forEach(button => button.addEventListener('click', () => filterCollection(button.dataset.filter, true)));
filterCollection(route.get('category') || 'all');
if (route.get('view') === 'bag') { renderCart(); openDialog(bagDialog); bagDialog.returnFocus = document.querySelector('.bag-toggle'); }
else if (products.some(p => p.id === route.get('product'))) {
  showProduct(route.get('product'));
  productDialog.returnFocus = document.querySelector(`.product-image[data-product="${route.get('product')}"]`);
}
