# Спецификация: picloms scroll archive

## 1. Цель

Одна законченная имиджевая главная для `picloms`: холодная студийная сцена раскрывает реальные фотографии бренда, затем отдаёт управление архивной галерее и ведёт к просмотру изделий.

## 2. Продуктовая правда

Используются название `picloms`, тексты и ограничения из `PRODUCT.md` и `CONTENT.md`. Корзина, цена `$97,33`, фиктивная privacy policy, checkout и Telegram-ссылка не публикуются. `CART` заменяется на `ИЗДЕЛИЯ`; outro CTA прокручивает/фокусирует галерею. Неизвестные названия, размеры, составы, наличие и условия скрываются. Допустим технический neutral label `ARCHIVE / PICLOMS`.

## 3. Медиа

Использовать только файлы, перечисленные в `ASSETS.md`, скопировав web-версии в `public/media`. `IMG_2776.PNG` — широкая hero-сцена; портретные/предметные кадры — дуальный scrub и gallery. Wordmark/знак берётся из подтверждённого локального ассета, без имитации `prmpt`. Если видео пользователя отсутствует, hero реализуется как кинематографический двухкадровый scrub тех же фото; это честный placeholder R19, а не подключение чужих CloudFront-видео.

## 4. Технология

React 19, TypeScript, Vite 6, `@vitejs/plugin-react`, Tailwind v4 через `@tailwindcss/vite`, `gsap@3.15.x` + `@gsap/react`, `motion@12.x` через `motion/react`. ScrollTrigger владеет scrub-анимацией подъёма панели в фазе 1. Команды lint/typecheck/test/build/dev должны существовать.

## 5. Поведение

DOM-контракт: `#scroll-spacer`, `#main-canvas`, `#outro-info`, `#outro-buy`, `#outro-overlay`, `#outro-footer`, fixed black panel и `.bp-card`. Root имеет `user-select:none`; на fine-pointer desktop — `cursor:none`. Overlay UI fixed и `pointer-events:none`, текст использует `mix-blend-mode:exclusion`; z-order: media 0, panel 10, white overlay 12, UI 20, cursor 50. Logo, caption, navigation и product info проявляются с задержками 0 / 0.15 / 0.30 / 0.45 сек. Cursor следует `clientX/clientY` прямой записью `left/top`, центрируется translate(-50%,-50%), виден только >=1024px на fine pointer. `view` остаётся декоративным fixed outro-контролом по исходному контракту.

Gallery: inner wrapper `padding-top:min(400px,40vh)`, ровно 10 разрешённых пользовательских изображений. Колонки 2/3/4; cells `aspect-ratio:2/3`. Для каждой строки `a=(r*2+(r%2))%cols`; на `r%3===0` второй элемент идёт в `b=(a+2)%cols`, а при совпадении — `(a+1)%cols`; пустые cells равны `-1`. Transform origin: левая половина `right bottom`, правая `left bottom`. Если `bottom<=0 || top>=vh`, scale=0; иначе `enter=min(1,(vh-top)/(vh*0.6))`, `exit=min(1,bottom/(vh*0.4))`, итог `max(0,min(enter,exit))`.

Scroll: `maxScroll=wrapper.scrollHeight-vh`; высота spacer=`vh+maxScroll+2*vh`. При `scrollY 0..vh` panel translateY линейно `vh→0` (GSAP ScrollTrigger scrub), cards учитывают panel offset. После `vh` panel остаётся у top, wrapper `translateY(-(scrollY-vh))`. Outro progress=`clamp((scrollY-vh-maxScroll)/(vh-100),0,1)`; он управляет белым overlay, offset product info, scale `view` и footer. Hero скрывается после первого viewport. Один RAF напрямую читает `window.scrollY`; scroll handler не используется ни для выборки, ни для мутации animation state.

Photo-cinema вместо отсутствующих пользовательских видео: два слоя загружаются до первого reveal. В dead zone `max(30,width*0.05)` показывается last-active слой в его исходной композиции. Слева от зоны активируется правый кадр, справа — левый; progress от границы зоны до соответствующего края нормализуется 0..1 и управляет плавным `scale(1..1.12)` и `object-position`, без seek. На touch кадры чередуются каждые 4.8 сек с crossfade 600 мс. При ошибке остаётся первый загрузившийся кадр; до загрузки показывается матовый чёрный фон.

## 6. Responsive, a11y, performance

Mobile-first, breakpoints 640/1024. Custom cursor только desktop fine-pointer. Осмысленная landmark-структура и alt только там, где роль подтверждена, иначе пустой alt. `prefers-reduced-motion` выключает pin/scrub/autoplay и показывает статичный последовательный контент. Единый RAF читает `window.scrollY` напрямую и обновляет DOM; resize пересчитывает layout и вызывает ScrollTrigger refresh. Изображения после hero lazy-loaded.

## 7. Проверка

Typecheck, lint, unit tests алгоритма layout, production build, browser smoke на desktop/mobile: отсутствие overflow, все 10 фото загружаются либо показывают честный fallback, fixed geometry соответствует breakpoint, reduced-motion не прячет контент.

## 8. Out of scope

Каталог с реестром товаров, карточка товара, Telegram-конверсия, публикация, оплата, корзина и неподтверждённые коммерческие/юридические данные. Настоящее видео отложено до предоставления пользовательского файла.
