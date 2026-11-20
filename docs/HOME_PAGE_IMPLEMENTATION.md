# Главная страница TIBON

`frontend/app/routes/home.tsx` собирает девять секций в порядке M4: первый экран, направления, события, о студии, впечатления, подборка форматов, галерея, дополнительные услуги и заявка. Секции находятся в `components/home/` и используют общие кнопки, заголовки, Modal, Header и Footer. Вёрстка использует токены M2 и локальные Playfair Display и Inter.

Данные карточек и галереи находятся в `frontend/app/data/home.ts`. Компоненты используют типизированные поля изображения, текста и маршрута. При интеграции CMS их можно передавать из серверного loader. Подборка форматов редакционная, без цен и заявлений о популярности. CTA ведут на `/zayavka/`, где сообщается о недоступности приёма заявок.

Главная отдаёт title, description и Open Graph в SSR-разметке. После подтверждения домена задайте `PUBLIC_SITE_ORIGIN` на сервере для вывода canonical, `og:url` и абсолютного `og:image`. Внутренние страницы пока используют метаданные каркаса.

## Изображения

Файлы в `frontend/public/images/home/` — временные иллюстрации с [Unsplash License](https://unsplash.com/license). Интерьер и кадры галереи показаны как иллюстрации. Перед запуском их можно заменить фото студии с подтверждёнными правами. Первый кадр имеет две версии WebP с приоритетной загрузкой. Остальные кадры загружаются по мере прокрутки.

- `preparation*.webp` — [нарезка овощей](https://images.unsplash.com/photo-1551218808-94e220e084d2).
- `ingredients.webp` — [ингредиенты](https://images.unsplash.com/photo-1498837167922-ddd27525d352).
- `dough.webp` — [работа с тестом, Jimmy Liu](https://unsplash.com/photos/womans-hands-working-with-dough-j8HMRNf9MYY).
- `birthday.webp` — [овощное блюдо](https://images.unsplash.com/photo-1547592180-85f173990554).
- `shared-table.webp` — [блюда на общем столе](https://images.unsplash.com/photo-1504674900247-0877df9cc836).
- `dinner.webp` — [тарелка с зеленью и яйцом](https://images.unsplash.com/photo-1482049016688-2d3e1b311543).
- `kitchen.webp` — [интерьер кухни](https://images.unsplash.com/photo-1556911220-bff31c812dba).
- `pasta.webp` — [паста с томатами](https://images.unsplash.com/photo-1473093295043-cdd812d0e601).
- `prep-board.webp` — [продукты на разделочной доске](https://images.unsplash.com/photo-1466637574441-749b8f19452f).

## Проверка

Из `frontend/` запустите `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` и `npm run test:ssr`. Последняя команда проверяет на production-сборке SSR, ссылки, изображения, галерею с клавиатуры и мобильную навигацию в Chromium.
