# COMPONENT SPECIFICATION — TIBON

Спецификация компонентов, их связей и ограничений. **Визуальные значения здесь не дублируются** — они в `docs/DESIGN_SYSTEM.md` (далее **DS**): §7 анатомия и размеры, §8 состояния, §2–§6 токены. Страницы и формы — `docs/PAGE_SPECIFICATION.md` (**PS**).

Документ отвечает на вопросы: из чего собрана страница, какие у компонента варианты, что он может содержать, сколько текста в него влезает и что запрещено.

---

## 1. Карта документов

| Что нужно | Где |
| --- | --- |
| Цвет, кегль, отступ, радиус, тень | DS §2, §3.2, §5, §6 |
| Анатомия и размеры компонента | DS §7 |
| default / hover / focus / disabled / loading / error | DS §8 |
| Поведение на брейкпоинтах | DS §9 |
| Правила изображений, alt, форматы | DS §10 |
| Длительности и easing | DS §11 |
| Контраст, фокус, клавиатура | DS §12 |
| **Состав страниц, варианты, вложенность, лимиты текста** | этот документ |
| Поля форм и статусы заявок | PS §2 |

---

## 2. Реестр компонентов (33)

Колонка «Источник» — откуда приходит контент: CMS = API, UI = состояние интерфейса, STATIC = системный текст (не редактируется в админке).

### 2.1 Навигация (5)

| # | Компонент | Назначение | Источник | Варианты |
| --- | --- | --- | --- | --- |
| N1 | `Header` | Сквозная шапка с логотипом, навигацией и телефоном | CMS (`SiteSettings`) | default / scrolled / menu-open |
| N2 | `DesktopNav` | Основная навигация ≥ 1024 | CMS (структура меню) | пункт / пункт с dropdown / активный |
| N3 | `MobileNav` | Полноэкранный sheet < 1024 | CMS | default / открыт / подсписок раскрыт |
| N4 | `Footer` | 4 колонки: форматы, услуги, студия, контакты + реквизиты | CMS | default |
| N5 | `Breadcrumbs` | Путь до страницы, JSON-LD `BreadcrumbList` | CMS (дерево страниц) | 2 уровня / 3 уровня |

### 2.2 Кнопки (5)

| # | Компонент | Назначение | Источник | Варианты |
| --- | --- | --- | --- | --- |
| B1 | `ButtonPrimary` | Главное действие: заявка, отправка | UI | sm / md / lg; icon-right; loading |
| B2 | `ButtonSecondary` | Альтернатива без заливки: «Смотреть форматы» | UI | sm / md / lg; arrow |
| B3 | `ButtonOutline` | Действие внутри карточки: «Запросить» | UI | sm / md; icon |
| B4 | `ButtonText` | Третичное действие: «Все правила», «Отправить ещё» | UI | inline / со стрелкой |
| B5 | `ButtonIcon` | Иконка-действие: закрыть, стрелки лайтбокса, «Наверх» | UI | square / round; 40 / 44 |

### 2.3 Контент (8)

| # | Компонент | Назначение | Источник | Варианты |
| --- | --- | --- | --- | --- |
| C1 | `EventCard` (FormatCard) | Формат мероприятия: фото, факты, цена «от» | CMS (`Format`) | portrait 4:5 / landscape 3:2 (мобиль) |
| C2 | `ServiceCard` | Доп. услуга: фото, описание, цена, «Запросить» | CMS (`Service`) | grid / rail (горизонтальная лента) |
| C3 | `GalleryItem` | Фото галереи с подписью и лайтбоксом | CMS (`MediaItem`) | 1:1 / 4:5 / 3:2; mosaic-крупный |
| C4 | `PriceCard` | Тариф аренды: цена, период, включения, CTA | CMS (`RentalTariff`) | default / featured |
| C5 | `MenuItem` (DishCard) | Блюдо: фото, состав, аллергены, цена, теги | CMS (`Dish`) | card / list (без фото) |
| C6 | `FeatureBlock` | Короткий смысловой блок: номер, заголовок, 2 строки | CMS / STATIC | numbered / icon |
| C7 | `ImageWithText` | Дуэт фото + текст с выравниванием | CMS | photo-left / photo-right / inverse (тёмный) |
| C8 | `SectionHeading` | Надзаголовок секции: overline, H2, lead, ссылка | CMS | with-lead / with-link / with-both |

### 2.4 Формы (8)

| # | Компонент | Назначение | Источник | Варианты |
| --- | --- | --- | --- | --- |
| F1 | `Input` | Текст, телефон, email, число | UI | text / tel / email / number; with-hint |
| F2 | `Textarea` | Комментарий, пожелания, аллергии | UI | 4 строки / auto-grow до 240 px |
| F3 | `Select` | Формат, услуга, тип использования | CMS (опции) | native (мобиль) / custom (десктоп) |
| F4 | `DatePicker` | Дата события или аренды | UI | native / popover-календарь |
| F5 | `Checkbox` | Согласие на обработку ПД, доп. опции | STATIC + CMS (ссылка) | single / group |
| F6 | `Radio` | Взаимоисключающий выбор | CMS | inline / card-radio |
| F7 | `FormError` | Ошибка поля + сводка ошибок | UI | field / summary |
| F8 | `SuccessMessage` | Экран успеха после отправки | STATIC | form-replace / inline |

### 2.5 Утилиты (7)

| # | Компонент | Назначение | Источник | Варианты |
| --- | --- | --- | --- | --- |
| U1 | `Modal` | Заявка (desktop — панель справа), лайтбокс-контейнер | UI | dialog / sheet / lightbox |
| U2 | `Accordion` | FAQ, состав блюда, TOC на мобиле | CMS | single-open / multi-open |
| U3 | `Badge` | Статус, тег, метка тарифа | CMS / UI | neutral / accent / olive / success / warning / error |
| U4 | `Tabs` | Взрослое/детское меню, категории | CMS + URL | underline / pills (только фильтры) |
| U5 | `LoadingState` | Skeleton и спиннер | UI | skeleton / spinner / inline-button |
| U6 | `EmptyState` | Пустая категория, нет фото, нет услуг | STATIC | with-action / без |
| U7 | `ErrorState` | Ошибка загрузки данных | STATIC | retry / без retry |

Итого: 33. Компоненты вне реестра не создаются; составные блоки собираются по §6.

---

## 3. Композиция страниц

Компонент → секции. Номера секций — по PS §3. «Сквозные» присутствуют на всех страницах.

| Страница | Сквозные | Секции и компоненты |
| --- | --- | --- |
| `/` Главная | N1, N4 | 1 фото hero + H1, B1 и ссылка к направлениям; 2 две карточки направлений; 3 три карточки событий; 4 C7 о студии; 5 четыре блока впечатлений; 6 три предложения в редакционной подборке; 7 мозаика из шести C3 + U1; 8 блок допуслуг + B3; 9 финальная CTA-секция + B1 |
| `/dlya-vzroslyh/` | N1, N4, N5 | 1 hero C7 + B1; 2 C8 + 3 × C1; 3 `SectionHeading` + список (2 колонки); 4 `SectionHeading` + timeline (`FeatureBlock` numbered, вертикальная линия); 5 C7; 6 3 × C2; 7 `SectionHeading` + 3 × C6; 8 `Accordion`; 9 `LeadForm` (`type=event`) |
| Формат (`korporativ`, `den-rozhdeniya`, `romanticheskiy-uzhin`) | N1, N4, N5 | 1 C7 + 3–4 `Badge` + B1; 2 timeline; 3 C5 compact × 3–6; 4 список; 5 2–3 × C2; 6 4–6 × C3; 7 `Accordion`; 8 `LeadForm` (`format_id` предзаполнен); 9 2 × C1 |
| `/dlya-detey/` | N1, N4, N5 | 1 C7 + 4 `Badge` + B1; 2 2–3 карточки программ (`ServiceCard`-подобные, вариант `plain`); 3 timeline; 4 `SectionHeading` + 3–4 × C6 (безопасность); 5 C7; 6 4–6 × C3; 7 `Accordion`; 8 `LeadForm` (`type=kids`); 9 перелинковка `ButtonText` × 3 |
| `/arenda/` | N1, N4, N5 | 1 C7 + B1; 2 3 × C2; 3 таблица характеристик → на мобиле `FeatureBlock`; 4 2 × C4; 5 список условий; 6 6–8 × C3; 7 `Accordion`; 8 `LeadForm` (`type=rental`) |
| `/menu/` | N1, N4, N5 | 1 C8 + B1 + B2; 2 `Tabs` (взрослое/детское); 3 `Tabs`-chips категорий; 4 сетка C5; 5 текст-формула + `ButtonText`; 6 2 × B3 (PDF); 7 тёмная полоса + `LeadForm` короткая |
| `/dop-uslugi/` | N1, N4, N5 | `ServiceHero`, редакционная секция «Друзья», `ImageTextSection` о ведущем, список дополнительных услуг и `PageCTA` |
| `/o-studii/` | N1, N4, N5 | 1 C7 + C8; 2 2–3 абзаца (`container-narrow`); 3 3–4 портрета C3 + подпись; 4 3–4 × C3 + B4; 5 3–4 × C6; 6 3 показателя (`FeatureBlock` large); 7 тёмная полоса + B1 |
| `/kontakty/` | N1, N4, N5 | 1 C8 + B1 (`tel:`) + B2; 2 4 карточки контактов (`FeatureBlock` icon); 3 адрес + карта + B3 «Маршрут»; 4 `LeadForm` (`type=callback`); 5 реквизиты `text-caption` |
| `/pravila/` | N1, N4, N5 | 1 C8 + дата редакции; 2 TOC (desktop — sticky-список, mobile — `Accordion`); 3–7 разделы `container-narrow` с якорями; 8 контакты + `ButtonText` |
| `/zayavka/` | N1, N4 | 1 H1 + lead + дисклеймер (`Badge` warning + текст); 2 полная форма (`container-form`); 3 альтернатива: телефон/мессенджеры (`ButtonText`); 4 `SuccessMessage` |
| `/politika-konfidencialnosti/` | N1, N4 | H1 + дата + `container-narrow`; `ButtonText` на главную |
| 404 | N1, N4 | H1 + 1 строка + `ButtonPrimary` «На главную» + `ButtonText` × 2 |
| Админка | `AdminShell` (N1-аналог: лого, разделы, выход) | таблицы (`Input` поиск, `Select` фильтры, `Badge` статусы, `ButtonIcon` действия, `Accordion` история заявки, `Modal` подтверждение, U5–U7) |

**Правила сквозных элементов:** Header и Footer на всех публичных страницах; Breadcrumbs — на всех, кроме главной, 404 и `/zayavka/`; `/zayavka/` и `/politika-konfidencialnosti/` не содержат промо-секций.

---

### Компоненты в M4.1

| Компонент | Вариант на главной |
| --- | --- |
| N1–N3 Header и навигация | Тёмная липкая шапка с `BrandMark`. До 1024 px меню открывается в полноэкранном диалоге. Активный маршрут имеет `aria-current`. Esc закрывает меню и возвращает фокус. |
| N4 Footer | `BrandMark`, разделы сайта, правовые ссылки, копирайт и реквизиты ИП. Контактные данные и соцсети выводятся при наличии. |
| B1–B5 Button и IconButton | Красная заливка Primary, нейтральная рамка Secondary, светло-красный Outline. Общий видимый контур фокуса. |
| C1 Карточки главной | Для направлений доступна вся площадь карточки. В карточках событий и предложений действие обозначает текстовая ссылка. У предложений фото квадратное, расположено сбоку. |
| C3 GalleryItem | Кнопка на весь кадр с видимым знаком «+» и названием для ассистивных технологий. Наведение или фокус меняют заливку знака. |
| C8 SectionHeading | Светло-красный надзаголовок с линией, белый H2, опциональный серый лид. |
| U1 Modal | Центрированный тёмный диалог. Лайтбокс показывает фото целиком, подпись с номером кадра и две кнопки переключения. Стрелки и Esc также доступны с клавиатуры. |

### Основа внутренних страниц M5.1

Компоненты в `frontend/app/components/pages/` получают контент через props. Модуль маршрута задаёт метаданные и собирает нужный набор секций внутри одного `main`.

| Компонент | Контракт и композиция |
| --- | --- |
| `PageHero` | Один H1, опциональные лид, надзаголовок, фото и Primary. Фото можно поставить рядом с текстом (`split`) или ниже него (`stacked`). Текстовый вариант подходит для правил и текущих заготовок. |
| `Breadcrumbs` | Переиспользуется из `components/navigation/`. Предки с URL — ссылки, последний пункт отмечен `aria-current="page"`. Длинная цепочка переносится. |
| `PageSection` | Именованная секция с H2, опциональным якорем, надзаголовком и лидом. Предусмотрены ширины `Container` и поверхности `Section`. |
| `FeatureGrid` | Семантический список с H3. Сетка переходит с одной колонки на две и четыре. |
| `ServiceCard` | H3 и описание, опциональные фото, дополнительная строка и Outline-ссылка. Длинный текст доступен целиком. |
| `ImageTextSection` | H2, контент и фото с опциональной подписью. На широком экране фото можно разместить слева или справа, на мобильном оно следует за текстом. |
| `PageGallery` | Сетка или мозаика из фото с уникальными `src`. Переиспользует `PhotoTile`, `GalleryLightbox` и `Modal`. Enter открывает фото, стрелки переключают кадры, Esc закрывает диалог. |
| `FAQSection` | Именованная секция с нативными раскрывающимися элементами `Accordion`. Enter и пробел раскрывают вопрос. |
| `PageCTA` | H2, опциональный лид и Primary. Центрированная композиция либо заголовок и действие в строку на широком экране. |

Изображение принимает `src`, `alt`, `width`, `height` и опциональные `srcSet`, `sizes`, `focalPoint`. Лайтбокс показывает фото целиком. Пустые списки преимуществ, FAQ и фото скрываются.

## 4. Матрица компонент × токены

Ссылки на группы DS §6. «Обязательные» — используются всегда, «по варианту» — только в указанном варианте.

| Компонент | Цвет | Типографика | Отступы | Радиус | Тень |
| --- | --- | --- | --- | --- | --- |
| N1 Header | surface, border, accent-strong | text-button, body-s | space-4/5, header h 88/64 | xs (кнопка) | sm (scrolled) |
| N2 DesktopNav | text, accent-strong, border | text-button | space-5 | — | md (dropdown) |
| N3 MobileNav | surface-alt, text, accent-strong, border | text-h3 (пункт), body | space-4/5/6 | — | — |
| N4 Footer | surface-inverse, text-inverse(-muted), border | body-s, caption | space-5/7 | — | — |
| N5 Breadcrumbs | text-muted, text | caption | space-2 | — | — |
| B1 Primary | accent, accent-hover, accent-strong, white | text-button | btn-*, space-2 | xs | — |
| B2 Secondary | text, border-strong, surface-raised | text-button | btn-* | xs | — |
| B3 Outline | accent-strong, accent-soft | text-button | btn-* | xs | — |
| B4 Text | text, accent-strong | text-button / body-s | 0, space-2 | — | — |
| B5 Icon | text, text-inverse, surface-alt, overlay | — | btn-icon | xs / pill | sm (на фото) |
| C1 EventCard | surface, border, accent-strong, text-muted | h3, body-s, micro | space-4/5, space-3 | xs | — |
| C2 ServiceCard | surface, border, text-muted | h4, body-s, micro | space-4/5 | xs | — |
| C3 GalleryItem | surface, text, border-strong, accent, focus-ring | h4 (знак «+») | space-2, tap-min | — | — |
| C4 PriceCard | surface(-alt), border, accent, accent-soft | h4, display-h3 (цена), body-s | space-6, space-4 | xs | — |
| C5 MenuItem | surface, border, accent-strong, olive-soft | h4, body-s, micro | space-4, space-2 | xs | — |
| C6 FeatureBlock | text, accent-strong, text-muted | overline, h4, body-s | space-5, space-3 | — | — |
| C7 ImageWithText | surface(-inverse), text(-inverse) | h2/h3, body, caption | space-7/8 | xs (фото) | — |
| C8 SectionHeading | text, accent-strong, text-muted | overline, h2, lead | space-3, space-6/7 | — | — |
| F1–F4 поля | surface-sunken, border-strong, accent-strong, error | body-s (label), body (значение), caption (hint) | space-2/3, space-4, control-h | xs | — |
| F5 Checkbox / F6 Radio | border-strong, accent-strong, #FFF, error | body-s | space-3, tap-min | xs / pill | — |
| F7 FormError | error, error-soft | caption | space-2 | xs | — |
| F8 SuccessMessage | success-soft, success, text | h3, body, caption | space-6 | xs | — |
| U1 Modal | surface-alt, border, overlay | h3, body | space-4/6 | xs | md |
| U2 Accordion | text, border, accent-strong | h4 (триггер), body | space-4, h 56 | — | — |
| U3 Badge | *-soft + основной токен | micro | space-2, h 24 | pill | — |
| U4 Tabs | text, text-muted, accent-strong, border | text-button | space-5, h 44 | — | — |
| U5–U7 состояния | surface-alt, text-muted, error | h4, body-s | space-8 | xs | — |

---

## 5. Варианты и состояния

Визуальные состояния — DS §8. Здесь — какие состояния обязательны для каждого компонента и какие варианты допустимы.

| Компонент | Обязательные состояния | Недопустимые варианты |
| --- | --- | --- |
| N1 Header | default, scrolled, menu-open, focus внутри | прозрачная шапка поверх светлого фото без overlay |
| N2 DesktopNav | default, hover, focus-visible, active (`aria-current`) | больше одного уровня вложенности |
| N3 MobileNav | closed, open, подсписок, focus-trap | частичный (неполноэкранный) вариант |
| N4 Footer | default, hover/focus ссылок | аккордеон-колонки на мобиле |
| N5 Breadcrumbs | default, hover, last (не ссылка) | больше 3 уровней, обрезка последнего элемента |
| B1 Primary | default, hover, active, focus, disabled, loading | два primary рядом в одной зоне |
| B2 Secondary | default, hover, active, focus, disabled | заливка accent |
| B3 Outline | default, hover, active, focus, disabled, loading | использование вместо Primary в hero |
| B4 Text | default, hover, focus, disabled | текст без подчёркивания при hover |
| B5 Icon | default, hover, focus, disabled, pressed (стрелки) | иконка без `aria-label` |
| C1 EventCard | default, hover, focus-within, без фото (placeholder), без цены («Цена по запросу») | более 3 чипов фактов |
| C2 ServiceCard | default, hover, focus-within, цена «по запросу», loading | длинное описание без обрезки |
| C3 GalleryItem | default, hover (desktop), focus, loading, без подписи | подпись, перекрывающая лицо/блюдо |
| C4 PriceCard | default, featured, hover (только если карточка ссылка) | больше одного featured в группе |
| C5 MenuItem | default, expanded (состав), hover, без фото, без цены, disabled (не в меню) | аллергены скрыты в collapsed-состоянии |
| C6 FeatureBlock | default | больше 2 строк текста |
| C7 ImageWithText | photo-left, photo-right, inverse, без фото (текст на всю ширину) | текст поверх фото без overlay |
| C8 SectionHeading | with-lead, with-link, with-both | больше одного H2 в компоненте |
| F1–F4 | default, hover, focus, filled, error, disabled, read-only | placeholder вместо label; ошибка только цветом |
| F5 Checkbox | unchecked, checked, focus, error, disabled | чекбокс согласия предустановлен отмеченным |
| F6 Radio | unselected, selected, focus, error, disabled | больше 6 вариантов без селекта |
| F7 FormError | field, summary (`role="alert"`) | ошибка без текста, только иконка |
| F8 SuccessMessage | default, focus на H3 | слова «вы забронировали» (PS §2.4) |
| U1 Modal | open, closing, scroll-locked, focus-trap, loading (внутри) | вложенная модалка; модалка без закрытия по Esc |
| U2 Accordion | collapsed, expanded, focus, disabled | autoplay-раскрытие |
| U3 Badge | 6 цветовых вариантов | больше 2 слов, перенос строки |
| U4 Tabs | active, inactive, hover, focus, scrollable | переиспользуемый компонент переключения вкладок |
| U5 LoadingState | skeleton, spinner, inline-button | спиннер на всю страницу вместо skeleton |
| U6 EmptyState | with-action, без действия | пустой блок без текста |
| U7 ErrorState | retry, без retry | ошибка без альтернативы (телефон/повтор) |

---

## 6. Вложенность и композиция

Разрешённое содержимое. Всё, что не указано, — запрещено.

| Контейнер | Может содержать | Не может |
| --- | --- | --- |
| Секция страницы | C8, сетка C1/C2/C3/C4/C5, C6, C7, `LeadForm`, U2, U4, B1/B2 | два C8 подряд, модалку, другой hero |
| C1 EventCard | изображение, H3, 2–3 U3 или чипа-факта, цена, B5/B4-стрелка | B1 (primary внутри карточки), больше 2 строк описания |
| C2 ServiceCard | изображение, H4, 2 строки, цена/«по запросу», B3 | форму, U2 внутри карточки |
| C4 PriceCard | H4, цена, период, список 4–6 пунктов, U3, B1 или B3 | больше 6 пунктов, вторую цену |
| C5 MenuItem | изображение 1:1, H4, 2 строки, U2 (состав/аллергены), цена, U3-теги | B1, ссылку на другую страницу блюда (страниц блюд нет) |
| C7 ImageWithText | изображение + (C8-lite, body, B1/B2/B4) | форму, галерею, U4 |
| C8 SectionHeading | overline, H2, lead, B4 | H1, изображение, больше одной ссылки |
| `LeadForm` | F1–F8, B1, текст-дисклеймер, ссылку на политику | больше 8 полей в модалке; U4 внутри формы |
| U1 Modal | заголовок, контент, B5-закрытие, `LeadForm` (короткая) | другую модалку, навигацию сайта |
| U2 Accordion | H4-триггер + body | изображения-галерею, вложенный аккордеон |
| U4 Tabs | табы + панель с C5 / C3 | табы без панели, вложенные табы |
| N4 Footer | списки ссылок, контакты, реквизиты, B5 «Наверх» | форму, CTA-полосу, галерею |
| N3 MobileNav | список ссылок, подсписок, телефон, B1, соцсети | форму, поиск, язык |

**Порядок в секции:** overline → H2 → lead → контент → действие. Действие никогда не стоит выше заголовка. В hero: overline → H1 → lead → действия → факты.

**Плотность:** не больше одной primary-кнопки в зоне видимости (исключение: Header + hero — считается одна пара); не больше 3 смысловых блоков в секции; между секциями — только `space-8/9`.

---

## 7. Лимиты контента

Ограничения для CMS-полей и вёрстки. Превышение — обрезка с многоточием только там, где указано; иначе поле не принимается админкой.

| Поле / элемент | Лимит | Поведение при превышении |
| --- | --- | --- |
| H1 | 60 символов, ≤ 3 строки (desktop) / 4 (mobile) | предупреждение в CMS |
| H2 | 70 символов, ≤ 2 строки | предупреждение |
| H3 в карточке | 40 символов, ≤ 2 строки | перенос, без обрезки |
| H4 в карточке | 36 символов, ≤ 2 строки | обрезка не применяется, CMS блокирует |
| Overline | 4 слова / 30 символов | CMS блокирует |
| Lead | 200 символов, ≤ 3 строки | предупреждение |
| Описание в C1 | 1 строка, ≤ 80 символов | обрезка с ellipsis |
| Описание в C2 | 2 строки, ≤ 140 символов | обрезка с ellipsis + раскрытие по клику (PS §3.7) |
| Описание блюда (C5) | 2 строки, ≤ 160 символов | обрезка с ellipsis |
| Состав / аллергены | без лимита (accordion) | — |
| Пункт списка «что входит» | 90 символов | перенос |
| Пункт FAQ (вопрос) | 120 символов | перенос, без обрезки |
| Ответ FAQ | 600 символов | предупреждение |
| Чип-факт (U3) | 2 слова / 20 символов | CMS блокирует |
| Цена | `от 3 300 ₽` + единица (`/чел.`, `/час`) | всегда `tabular-nums`, неразрывный пробел перед ₽ |
| Подпись под фото | 90 символов | обрезка в лайтбоксе не применяется — перенос |
| Alt | 5–12 слов, 120 символов | обязателен для содержательного фото |
| Текст кнопки | 3 слова / 28 символов | CMS блокирует |
| Дисклеймер формы | фиксированный (PS §2.3) | не редактируется |
| Сообщение успеха | фиксированное (DS §7.4) | не редактируется |
| Реквизиты в футере | 2 строки, `caption` | перенос |

Числовые правила: цена всегда «от» + сумма + единица; при отсутствии цены — «Цена по запросу» (никогда «0», «—», пусто); длительность — «N ч», гости — «от N человек».

---

## 8. Do / Don't

| Do | Don't |
| --- | --- |
| Собирать страницы из компонентов §2 в порядке §6 | Верстать секцию «с нуля» ради одного блока |
| Один primary-CTA на зону, остальные — Secondary/Text | Три красные кнопки в одном экране |
| Факты — чипами и списками | Факты в абзаце с ценой, выделенной цветом (ошибка референса) |
| Фото 4:5/3:2/1:1 из §10 DS с обязательным alt | Произвольный кроп и пустой alt |
| C8 как единственный вход в секцию | Два заголовка H2 подряд без контента между ними |
| C5 с раскрытием состава и аллергенов | Скрывать аллергены в PDF или за формой |
| B3 «Запросить» с `service_id` в заявке | Одинаковые CTA, ведущие на общую страницу контактов |
| U6/U7 с действием и альтернативой | Пустой блок или битая картинка вместо пустого состояния |
| Дисклеймер «заявка не является бронированием» рядом с отправкой и в успехе | «Вы забронировали» до подтверждения менеджером |
| `aria-current`, `aria-expanded`, `aria-invalid` по назначению | Интерактивный `div` без роли и клавиатуры |
| Токены DS §6 | Произвольные hex, px, тени на карточках |

---

## 9. Открытые вопросы

1. **Кириллица Playfair Display** — проверена на заголовках главной. При добавлении страниц проверяйте их реальные тексты.
2. **Число карточек в сетках** — 4 формата на главной и 3 на `/dlya-vzroslyh/`; при появлении 4-го взрослого формата раскладка 4/3/2 должна работать без правок (проверить на реальных данных CMS).
3. **Карточка программы для детей** — вариант `plain` у `ServiceCard` не подтверждён; если программ нет, блок не выводится (PS §3.4).
4. **Лайтбокс главной** использует общий `Modal` с нативным `dialog` и управлением кадрами в `GallerySection`.
5. **Статусы заявок в админке** — маппинг на существующие токены (DS §13.2) требует подтверждения после согласования статус-модели (PS §2.4).
6. **Тени** — DS допускает `shadow-sm` у sticky-панели; если визуально «грязнит» фото под ней, заменить на `border` (решение на прототипе).
