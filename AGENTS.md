<!-- autopilot:start -->
# picloms

Одностраничная имиджевая web-витрина fashion-бренда picloms: полноэкранная hero-сцена, scroll-driven архив из 10 локальных изображений и финальный outro. Стек: Vite 6, React 19, TypeScript, GSAP/ScrollTrigger, Motion и CSS.

## Команды

```powershell
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run dev` печатает фактический локальный URL и при занятом 5173 автоматически выбирает следующий порт. Production-результат создаётся в `dist/`.

## Структура

```text
index.html                 Vite entry shell
src/main.tsx               React root, Onest и глобальные стили
src/App.tsx                вся сцена, refs, GSAP/RAF и состояния медиа
src/index.css              дизайн-система, responsive и reduced-motion режим
src/data/media.ts          типизированный реестр hero/archive медиа
src/lib/layout.ts          pure раскладка архива и responsive columns
src/lib/heroState.ts       готовность hero при load/error кадров
src/lib/*.test.ts          Vitest-тесты двух pure-модулей
public/media/              локальные исходные и responsive производные
```

## Важные особенности

- Hero становится видимым только после завершения загрузки обоих кадров; если один сломан, используется успешный, если сломаны оба — показывается текстовый fallback.
- Desktop с точным указателем меняет hero от движения мыши; touch переключает доступные кадры таймером. Не ломай `loadedFrames`, `activeSide` и единый RAF-цикл.
- `buildLayout()` обозначает пустые клетки как `-1`; число колонок меняется на 640 и 1024 px. Порядок `archiveMedia` определяет refs карточек.
- При `prefers-reduced-motion` фиксированная scroll-сцена намеренно превращается в обычный документ; новые эффекты обязаны сохранять этот fallback.
- Пути `/media/...`, `srcSet`, исходные имена и роли централизованы в `src/data/media.ts`; не дублируй их в компонентах.

## Как здесь работает Autopilot

Сборка ведётся навыком `/autopilot`. Требования, спецификация и таски — в `.autopilot/`. Прогресс — `.autopilot/dashboard.html`. Требование из `manifest.md` может снять только пользователь.

Если работа продолжается — скажи «продолжи автопилот»: состояние поднимется из `.autopilot/state.js`, переспрашивать ничего не нужно.
<!-- autopilot:end -->
