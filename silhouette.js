import { products } from './catalog.mjs';

const groups = [
  {id:'upper',title:'01 / Верх',categories:['top','graphic']},
  {id:'lower',title:'02 / Низ',categories:['bottom']},
  {id:'accent',title:'03 / Акцент',categories:['accessories'],optional:true},
];
const chosen = Object.fromEntries(groups.map(group => [group.id,{product:null,size:''}]));
const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const host = document.querySelector('#builder-options');
const preview = document.querySelector('#outfit-preview');
const status = document.querySelector('#builder-status');
const form = document.querySelector('#outfit-form');
let active = 'upper';
const draftKey = 'picloms-outfit-v1';
const serialize = () => Object.fromEntries(groups.map(({id}) => [id,{id:chosen[id].product?.id || '',size:chosen[id].size}]));
function persist() {
  try { localStorage.setItem(draftKey, JSON.stringify(serialize())); } catch { /* Selection remains available in this tab. */ }
  const address = new URL(location.href);
  if(address.searchParams.has('outfit')) { address.searchParams.delete('outfit'); history.replaceState(null,'',address); }
}
function restore(value) {
  if(!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let restored = false;
  for(const group of groups) {
    const saved = value[group.id];
    const product = products.find(p => p.id === saved?.id && group.categories.includes(p.category));
    chosen[group.id] = {product:product || null,size:product?.sizes.includes(saved?.size)?saved.size:product?.sizes.length===1?product.sizes[0]:''};
    restored ||= Boolean(product);
  }
  return restored;
}
const toolbar = document.createElement('div'); toolbar.className='outfit-tools';
toolbar.innerHTML='<div class="outfit-presets"><label for="outfit-preset">Начать с готового образа</label><select id="outfit-preset"><option value="">Выберите настроение</option><option value="line">Чёткая линия</option><option value="texture">Игра фактур</option><option value="graphic">Графический акцент</option></select></div><div class="outfit-actions"><button type="button" id="random-outfit">Новая комбинация ↻</button><button type="button" id="share-outfit">Поделиться ↗</button></div><div id="share-fallback" hidden><label for="outfit-link">Скопируйте ссылку на образ</label><input id="outfit-link" readonly type="text"></div><p id="outfit-progress" role="status"></p>';
document.querySelector('.builder-controls').prepend(toolbar);
function progress() {
  const selected = Object.values(chosen).filter(item=>item.product);
  const missing = ['upper','lower'].filter(id=>!chosen[id].product);
  const sizes = selected.filter(item=>!item.size).length;
  document.querySelector('#outfit-progress').textContent=missing.length?`Следующий шаг: выберите ${missing.map(id=>id==='upper'?'верх':'низ').join(' и ')}.`:sizes?`Форма собрана. Осталось выбрать размеры: ${sizes}.`:'Образ готов. Можно добавить комплект в корзину.';
  document.querySelector('#share-outfit').disabled=!selected.length;
}
function refresh() { persist(); renderOptions(); renderPreview(); document.querySelector('#share-fallback').hidden=true; }
function useProducts(ids) {
  groups.forEach((group,index)=>{
    const product=products.find(p=>p.id===ids[index]&&group.categories.includes(p.category));
    const oldSize=chosen[group.id].size;
    chosen[group.id]={product:product || null,size:product?.sizes.includes(oldSize)?oldSize:product?.sizes.length===1?product.sizes[0]:''};
  });
  refresh(); status.textContent='Комбинация готова. Вы можете заменить любую вещь.';
}
document.querySelector('#outfit-preset').addEventListener('change',event=>{
  const presets={line:['slate','fold',null],texture:['feral','plume',null],graphic:['orbit','veil','tartan']};
  if(presets[event.target.value])useProducts(presets[event.target.value]);
});
document.querySelector('#random-outfit').addEventListener('click',()=>{
  const ids=groups.map(group=>{
    let options=products.filter(p=>group.categories.includes(p.category)&&p.id!==chosen[group.id].product?.id);
    if(!options.length)options=products.filter(p=>group.categories.includes(p.category));
    return options[Math.floor(Math.random()*options.length)]?.id;
  });
  document.querySelector('#outfit-preset').value='';useProducts(ids);
});
document.querySelector('#share-outfit').addEventListener('click',async()=>{
  const address=new URL(location.href);address.search='';address.hash='';address.searchParams.set('outfit',JSON.stringify(serialize()));
  try{await navigator.clipboard.writeText(address.href);status.textContent='Ссылка скопирована. В ней сохранены вещи и выбранные размеры.';}
  catch{const fallback=document.querySelector('#share-fallback');fallback.hidden=false;const input=document.querySelector('#outfit-link');input.value=address.href;input.focus();input.select();status.textContent='Выделенная ссылка готова к копированию.';}
});
try {
  const shared = new URL(location.href).searchParams.get('outfit');
  if(shared)status.textContent=restore(JSON.parse(shared))?'Открыт образ по ссылке.':'В ссылке нет доступных вещей. Соберите новый образ.';
  else if(restore(JSON.parse(localStorage.getItem(draftKey)||'null')))status.textContent='Ваш последний образ восстановлен.';
} catch { status.textContent='Не удалось восстановить образ. Можно собрать новый.'; }
function renderOptions() {
  const group = groups.find(group => group.id === active);
  host.replaceChildren();
  const options = products.filter(product => group.categories.includes(product.category));
  if(group.optional) {
    const none = document.createElement('button');
    none.type='button'; none.className='builder-option no-accent'; none.textContent='Без акцента';
    none.setAttribute('aria-pressed',String(!chosen[active].product));
    none.onclick=()=>selectProduct(null); host.append(none);
  }
  for(const product of options) {
    const button=document.createElement('button'); button.type='button'; button.className='builder-option';
    button.dataset.product=product.id;
    button.setAttribute('aria-pressed',String(chosen[active].product?.id===product.id));
    const img=document.createElement('img'); img.src=product.image; img.alt=''; img.loading='lazy';
    const title=document.createElement('span'); title.textContent=product.title;
    const price=document.createElement('span'); price.className='option-price'; price.textContent=money(product.price);
    button.append(img,title,price); button.onclick=()=>selectProduct(product); host.append(button);
  }
}
function selectProduct(product) {
  const size=chosen[active].size;
  chosen[active]={product,size:product?.sizes.length===1?product.sizes[0]:product?.sizes.includes(size)?size:''};
  status.textContent=product?`${product.title} добавлен в образ.`:'Образ без дополнительного акцента.';
  document.querySelector('#outfit-preset').value='';refresh();
  host.querySelector(product?`[data-product="${product.id}"]`:'.no-accent')?.focus({preventScroll:true});
}
function renderPreview() {
  preview.replaceChildren(); let total=0,count=0;
  for(const group of groups) {
    const selection=chosen[group.id];
    const slot=document.createElement('div');slot.className=`outfit-slot slot-${group.id}`;
    if(selection.product) {
      const image=document.createElement('img');image.src=selection.product.image;image.alt=selection.product.title;slot.append(image);
      const label=document.createElement('span');label.textContent=selection.product.name;slot.append(label);
      const remove=document.createElement('button');remove.type='button';remove.className='remove-piece';remove.textContent='×';remove.setAttribute('aria-label',`Убрать ${selection.product.title}`);
      remove.addEventListener('click',()=>{chosen[group.id]={product:null,size:''};refresh();status.textContent=`${selection.product.title} убран из образа.`;document.querySelector(`[data-outfit-group="${group.id}"]`).focus({preventScroll:true});});slot.append(remove);
      total+=selection.product.price;count++;
    } else {const label=document.createElement('span');label.textContent=group.optional?'Акцент / по желанию':group.id==='upper'?'Выберите верх':'Выберите низ';slot.append(label);}
    preview.append(slot);
  }
  document.querySelector('#outfit-total').textContent=money(total);
  document.querySelector('#outfit-count').textContent=`В образе: ${count}`;
  const sizes=document.querySelector('#outfit-sizes'); sizes.replaceChildren();
  for(const group of groups) {
    const {product,size}=chosen[group.id]; if(!product)continue;
    const label=document.createElement('label');label.textContent=product.title;
    const select=document.createElement('select');select.name=`size-${group.id}`;select.required=true;
    select.setAttribute('aria-label',`Размер: ${product.title}`);
    const placeholder=new Option('Выберите размер',''); placeholder.disabled=true;select.append(placeholder);
    for(const value of product.sizes)select.append(new Option(value,value));
    select.value=size; select.onchange=()=>{chosen[group.id].size=select.value;persist();progress();document.querySelector('#share-fallback').hidden=true;status.textContent='';};label.append(select);sizes.append(label);
  }
  document.querySelector('#add-outfit').disabled=false;
  progress();
}
document.querySelectorAll('[data-outfit-group]').forEach(button=>button.addEventListener('click',()=>{
  active=button.dataset.outfitGroup;
  document.querySelectorAll('[data-outfit-group]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));
  renderOptions();
}));
document.querySelector('#reset-outfit').addEventListener('click',()=>{
  for(const group of groups)chosen[group.id]={product:null,size:''};
  document.querySelector('#outfit-preset').value='';refresh();status.textContent='Образ очищен. Можно начать заново.';
});
form.addEventListener('invalid',()=>{status.textContent='Выберите размер для каждой вещи перед добавлением.';},true);
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!chosen.upper.product||!chosen.lower.product){const missing=!chosen.upper.product?'upper':'lower';status.textContent=`Сначала выберите ${missing==='upper'?'верх':'низ'}.`;const tab=document.querySelector(`[data-outfit-group="${missing}"]`);tab.click();tab.focus();return;}
  const selections=Object.values(chosen).filter(selection=>selection.product);
  if(selections.some(({product,size})=>!product.sizes.includes(size))){status.textContent='Выберите размер для каждой вещи.';return;}
  let cart=[];
  try {
    const saved=JSON.parse(localStorage.getItem('picloms-demo-bag-v1')||'[]');
    if(Array.isArray(saved))cart=saved.filter(item=>item&&products.some(p=>p.id===item.id&&p.sizes.includes(item.size))&&Number.isInteger(item.quantity)&&item.quantity>0&&item.quantity<=99).map(({id,size,quantity})=>({id,size,quantity}));
  } catch { /* Invalid saved cart is replaced with this selection. */ }
  for(const {product,size} of selections){
    const item=cart.find(row=>row.id===product.id&&row.size===size);
    if(item&&item.quantity>=99){status.textContent=`В корзине уже 99 шт. ${product.title}. Уменьшите количество в корзине.`;return;}
    if(item)item.quantity++;else cart.push({id:product.id,size,quantity:1});
  }
  try{localStorage.setItem('picloms-demo-bag-v1',JSON.stringify(cart));location.href='shop.html?view=bag';}
  catch{status.textContent='Браузер запретил сохранение корзины. Разрешите хранение данных сайта и повторите.';}
});
renderOptions();renderPreview();
