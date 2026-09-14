// Shared navigation. Shopping runs only on shop.html.
const ribbonToggle = document.querySelector('.ribbon-toggle');
ribbonToggle?.addEventListener('click', () => {
  const paused = ribbonToggle.closest('.ribbon').classList.toggle('paused');
  ribbonToggle.setAttribute('aria-pressed', String(paused));
  ribbonToggle.setAttribute('aria-label', paused ? 'Запустить бегущую строку' : 'Остановить бегущую строку');
});
const menu = document.querySelector('#menu');
const trigger = document.querySelector('.menu-toggle');
document.documentElement.classList.add('js');
let navigationTarget = null;
trigger.addEventListener('click', () => {
  menu.showModal();
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

