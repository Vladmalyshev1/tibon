export type HomeImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type HomeLinkCard = {
  title: string;
  description: string;
  to: string;
  image: HomeImage;
  layout?: "portrait" | "landscape";
};

const image = (file: string, width: number, height: number, alt: string): HomeImage => ({
  src: `/images/home/${file}`,
  width,
  height,
  alt,
});

export const homeImages = {
  hero: image("preparation.webp", 960, 1440, "Руки нарезают овощи на разделочной доске"),
  ingredients: image("ingredients.webp", 960, 640, "Свежие овощи и зелень в лотках"),
  birthday: image("birthday.webp", 960, 640, "Блюдо с овощами и миска томатов на столе"),
  corporate: image("shared-table.webp", 960, 640, "Несколько блюд на общем столе"),
  dinner: image("dinner.webp", 960, 1361, "Тарелка с зеленью и яйцом на тёмном столе"),
  studio: image("kitchen.webp", 960, 575, "Светлая кухня с продуктами и посудой"),
  table: image("prep-board.webp", 960, 960, "Овощи и яйца на деревянной доске"),
  pasta: image("pasta.webp", 960, 641, "Паста с томатами и зеленью"),
  baking: image("dough.webp", 960, 1442, "Руки формуют тесто"),
};

export const directions: HomeLinkCard[] = [
  {
    title: "Для взрослых",
    description: "Совместное приготовление, разговоры за столом и новые вкусовые впечатления.",
    to: "/dlya-vzroslyh/",
    image: homeImages.ingredients,
    layout: "portrait",
  },
  {
    title: "Для детей",
    description: "Форматы, в которых знакомство с продуктами становится частью игры и творчества.",
    to: "/dlya-detey/",
    image: homeImages.baking,
    layout: "landscape",
  },
];

export const eventFormats: HomeLinkCard[] = [
  {
    title: "День рождения",
    description: "Повод собрать близких вокруг общего кулинарного опыта.",
    to: "/dlya-vzroslyh/den-rozhdeniya/",
    image: homeImages.birthday,
  },
  {
    title: "Корпоративные мероприятия",
    description: "Время вне привычного сценария, которое можно провести вместе.",
    to: "/dlya-vzroslyh/korporativ/",
    image: homeImages.corporate,
  },
  {
    title: "Романтический ужин",
    description: "Вечер, где внимание остаётся на вкусе, диалоге и деталях.",
    to: "/dlya-vzroslyh/romanticheskiy-uzhin/",
    image: homeImages.dinner,
  },
];

export const experiences = [
  { number: "01", title: "Готовить вместе", text: "Делить процесс, открывать сочетания и собирать блюдо шаг за шагом." },
  { number: "02", title: "Пробовать новое", text: "Знакомиться с приёмами и продуктами через практику, а не теорию." },
  { number: "03", title: "Собирать событие", text: "Выбирать формат, который поддерживает повод и настроение встречи." },
  { number: "04", title: "Запоминать вкус", text: "Оставлять место для разговора, деталей сервировки и общего впечатления." },
];

export const popularOffers: HomeLinkCard[] = [
  {
    title: "Кулинарные впечатления",
    description: "Направление для тех, кто хочет готовить и пробовать вместе.",
    to: "/dlya-vzroslyh/",
    image: homeImages.pasta,
  },
  {
    title: "Праздничные форматы",
    description: "Идеи для событий, в центре которых — совместный процесс и стол.",
    to: "/dlya-vzroslyh/den-rozhdeniya/",
    image: homeImages.corporate,
  },
  {
    title: "Кулинария для детей",
    description: "Знакомство с приготовлением через понятные действия и любопытство.",
    to: "/dlya-detey/",
    image: homeImages.baking,
  },
];

export const galleryImages = [
  homeImages.table,
  homeImages.corporate,
  homeImages.baking,
  homeImages.dinner,
  homeImages.pasta,
  homeImages.studio,
];
