// Shared navigation. Shopping runs only on shop.html.
const navigationStyles = document.createElement('link');
navigationStyles.rel = 'stylesheet';
navigationStyles.href = 'navigation.css';
document.head.append(navigationStyles);

const navIcons = {
  catalog: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="6" height="6"/><rect x="14.5" y="3.5" width="6" height="6"/><rect x="3.5" y="14.5" width="6" height="6"/><rect x="14.5" y="14.5" width="6" height="6"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 4.8a5.2 5.2 0 0 0-7.3 0L12 5.9l-1.1-1.1a5.2 5.2 0 0 0-7.3 7.4L12 21l8.3-8.8a5.2 5.2 0 0 0 0-7.4Z"/></svg>',
  bag: '<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M4 8h16l2 17H2L4 8Z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>'
};
const header = document.querySelector('.header');
const catalogLink = header?.querySelector('nav a[href="shop.html"]');
if (catalogLink) {
  catalogLink.classList.add('nav-icon', 'catalog-link');
  catalogLink.setAttribute('aria-label', 'Открыть каталог');
  catalogLink.title = 'Каталог';
  catalogLink.innerHTML = navIcons.catalog;
}
const headerRight = header?.querySelector('.header-right');
if (headerRight) {
  const favoritesLink = document.createElement('a');
  favoritesLink.className = 'nav-icon header-favorites';
  favoritesLink.href = 'shop.html?favorites=1';
  favoritesLink.title = 'Избранное';
  favoritesLink.innerHTML = `${navIcons.heart}<span class="favorites-count" hidden></span>`;
  headerRight.prepend(favoritesLink);
  const updateFavoritesBadge = () => {
    let favorites = [];
    try { favorites = JSON.parse(localStorage.getItem('picloms-favorites-v1') || '[]'); } catch {}
    const count = Array.isArray(favorites) ? new Set(favorites).size : 0;
    const badge = favoritesLink.querySelector('.favorites-count');
    badge.hidden = !count;
    badge.textContent = count > 99 ? '99+' : String(count);
    favoritesLink.setAttribute('aria-label', count ? `Избранное, товаров: ${count}` : 'Избранное');
  };
  updateFavoritesBadge();
  window.addEventListener('storage', updateFavoritesBadge);
  window.addEventListener('favorites-changed', updateFavoritesBadge);
  const bagLink = headerRight.querySelector('.bag-link');
  if (bagLink) {
    bagLink.classList.add('nav-icon');
    bagLink.innerHTML = navIcons.bag;
    bagLink.title = 'Корзина';
  }
}
const ribbonToggle = document.querySelector('.ribbon-toggle');
ribbonToggle?.addEventListener('click', () => {
  const paused = ribbonToggle.closest('.ribbon').classList.toggle('paused');
  ribbonToggle.setAttribute('aria-pressed', String(paused));
  ribbonToggle.setAttribute('aria-label', paused ? 'Запустить бегущую строку' : 'Остановить бегущую строку');
});
const menu = document.querySelector('#menu');
const menuFavorites=document.createElement('a');menuFavorites.href='shop.html?favorites=1';menuFavorites.textContent='Избранное';menuFavorites.className='menu-favorites';menu.querySelector('nav').prepend(menuFavorites);
const menuNav=menu.querySelector('nav');
const menuOrder=['index.html','shop.html','silhouette.html','shop.html?favorites=1','buyers.html#sizes'];
menuNav.replaceChildren(...menuOrder.map(href=>menuNav.querySelector(`a[href="${href}"]`)).filter(Boolean));
const trigger = document.querySelector('.menu-toggle');
document.documentElement.classList.add('js');
let navigationTarget = null;
const menuClose = menu.querySelector('.menu-close');
menuClose.setAttribute('autofocus', '');
trigger.addEventListener('click', () => {
  menu.showModal();
  menuClose.focus({preventScroll: true});
  trigger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
});
menu.querySelector('.menu-close').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  trigger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  const target = navigationTarget || trigger;
  navigationTarget = null;
  if (target !== trigger) target.setAttribute('tabindex', '-1');
  target.focus({preventScroll:true});
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
  const destination = new URL(link.href);
  const normalize = path => path.endsWith('/') ? `${path}index.html` : path;
  const samePage = destination.origin === location.origin && normalize(destination.pathname) === normalize(location.pathname) && destination.search === location.search;
  navigationTarget = samePage && destination.hash ? document.getElementById(decodeURIComponent(destination.hash.slice(1))) : null;
  if (navigationTarget) {
    event.preventDefault();
    history.pushState(null, '', destination.href);
    navigationTarget.scrollIntoView({behavior:'auto'});
  }
  menu.close();
}));
menu.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const items = [...menu.querySelectorAll('button,a[href]')];
  if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
  else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
});
menu.addEventListener('click', event => {
  const bounds = menu.getBoundingClientRect();
  if (event.target === menu && (event.clientX < bounds.left || event.clientX > bounds.right)) menu.close();
});

