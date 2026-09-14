const form = document.querySelector('#newsletter-form');
form.querySelector('fieldset').disabled = false;
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  document.querySelector('#newsletter-status').textContent = 'Готово — вы проверили подписку. Это демо: почта не сохранена, письма не отправляются.';
  form.reset();
});

