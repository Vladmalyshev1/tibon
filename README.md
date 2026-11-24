<div align="center">

# ТИ-БОН — кулинарная студия

**Современный сайт кулинарной студии с адаптивным интерфейсом, серверным рендерингом и онлайн-заявками.**

[Посмотреть сайт](https://ti-bon.ru) · [Для взрослых](https://ti-bon.ru/dlya-vzroslyh/) · [Для детей](https://ti-bon.ru/dlya-detey/) · [Меню](https://ti-bon.ru/menu/)

</div>

![Главная страница ТИ-БОН](https://github.com/Vladmalyshev1/photo/blob/main/home.jpg)

## О проекте

**ТИ-БОН** — сайт кулинарной студии рядом с Ижевском. Посетители могут выбрать формат мероприятия, ознакомиться с условиями, отправить заявку и запросить PDF-меню для взрослых или детей.

Дизайн строится на тёмной палитре, выразительной типографике, крупных гастрономических фотографиях и красных акцентах. Сайт адаптирован для мобильных устройств.

> **Скриншоты:** изображения загружаются из отдельного репозитория [`Vladmalyshev1/photo`](https://github.com/Vladmalyshev1/photo) (ветка `main`). Имена файлов должны совпадать с указанными в ссылках. Скриншоты могут отличаться от текущей опубликованной версии сайта.

## Скриншоты

### Главная

Кинематографичная обложка, шеф, переходы к основным программам и преимуществам студии.

![Главная — TIBON](https://raw.githubusercontent.com/Vladmalyshev1/photo/main/home.jpg)

### Мастер-классы для взрослых

Описание форматов и поводов для мероприятий.

![Для взрослых — TIBON](https://raw.githubusercontent.com/Vladmalyshev1/photo/main/adults.jpg)

### Детские мероприятия

Страница детских кулинарных мастер-классов.

![Для детей — TIBON](https://raw.githubusercontent.com/Vladmalyshev1/photo/main/kids.jpg)

### Аренда студии

Форматы использования помещения и условия аренды.

![Аренда — TIBON](https://raw.githubusercontent.com/Vladmalyshev1/photo/main/rental.jpg)

### Контакты

Адрес, телефон и карта для планирования маршрута.

![Контакты — TIBON](https://raw.githubusercontent.com/Vladmalyshev1/photo/main/contacts.jpg)

## Возможности

- Адаптивные страницы услуг, меню, аренды и контактов.
- Серверный рендеринг (SSR), SEO-метаданные, `robots.txt` и `sitemap.xml`.
- Формы заявок с валидацией номера телефона и согласием на обработку данных.
- Запрос и защищённая выдача PDF-меню после создания заявки.
- Очередь уведомлений `outbox` и отдельный Telegram Worker.
- Cookie-баннер с выбором пользователя и управлением дополнительными интеграциями.
- Обработка ошибок, защита от повторной отправки и ограничение частоты запросов.

## Технологии

| Часть | Стек |
| --- | --- |
| Frontend | React, TypeScript, React Router Framework Mode, Vite |
| Интерфейс | CSS, Tailwind CSS, Framer Motion |
| Формы | React Hook Form, Zod |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy 2 |
| База данных | PostgreSQL, Alembic |
| Уведомления | Telegram Bot API, outbox worker |
| Инфраструктура | Beget VPS, NGINX; конфигурация запуска зависит от текущего деплоя |
| Тестирование | Vitest, Pytest, Playwright, Lighthouse |


<div align="center">

**ТИ-БОН — готовим впечатления.**

[ti-bon.ru](https://ti-bon.ru)

</div>
