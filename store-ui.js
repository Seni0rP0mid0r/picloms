// This storefront is a demo. Email addresses and consents are never stored or sent.
function newsletter(){
 const section=document.createElement('section');section.className='store-newsletter';
 section.innerHTML=`<div class="orbit-newsletter-inner"><h2>На одной орбите</h2><p>Новые вещи, съёмки и истории picloms.<br>Оставьте почту, чтобы быть ближе.</p><form><label class="email-label"><span class="sr-only">Электронная почта</span><input type="email" name="email" placeholder="Электронная почта" autocomplete="email" required maxlength="254"></label><button class="subscribe-button" type="submit">Подписаться</button><label class="consent"><input type="checkbox" required> <span>Согласен на обработку персональных данных для подписки.</span></label><label class="consent"><input type="checkbox" required> <span>Согласен получать информационные и рекламные письма PICLOMS.</span></label><p class="newsletter-demo">Демо-форма: адрес не сохраняется, письма не отправляются.</p><p class="subscribe-status" role="status"></p></form></div>`;
 section.querySelector('form').addEventListener('submit',event=>{event.preventDefault();if(!event.target.reportValidity())return;section.querySelector('.subscribe-status').textContent='Демо-подписка проверена. Адрес не сохранён, письма не будут отправлены.';event.target.reset();});
 return section;
}
const existingNewsletter=document.querySelector('main .newsletter');
if(existingNewsletter)existingNewsletter.replaceWith(newsletter());else document.querySelector('main')?.append(newsletter());
document.querySelector('#product-dialog')?.append(newsletter());
