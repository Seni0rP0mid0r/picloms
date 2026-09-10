# Интерфейсы

- `src/data/media.ts`: типизированный реестр локальных web-медиа и ролей.
- `src/lib/layout.ts`: pure `buildLayout(count, cols)` и выбор колонок.
- `src/App.tsx`: композиция сцены, refs и orchestrated RAF/GSAP lifecycle.
- `src/index.css`: визуальная система, responsive и reduced-motion fallback.
- `public/media/*`: производные без ретуши из файлов, разрешённых `ASSETS.md`.

## Что построено

- `buildLayout(count, cols): number[][]` и `columnsForWidth(width): 2 | 3 | 4` — чистые responsive layout-функции.
- `resolveHeroReadiness(states)` — ждёт завершения загрузки двух hero-кадров, выбирает первый успешный и сообщает all-error.
- `ArchiveMedia` поддерживает `srcSet`/`sizes`; галерея использует 19 web-производных общим весом около 749 КБ.
- Scroll choreography обновляется event-woken RAF; geometry reads выполняются до transform writes.
