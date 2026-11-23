import type { Photo } from "../components/ui/PhotoTile";
import { servicePages } from "./business";

type HomeLink = {
  title: string;
  description: string;
  to: string;
};

const image = (file: string, width: number, height: number, alt: string): Photo => ({
  src: `/images/home/${file}`,
  width,
  height,
  alt,
});

export const homeImages = {
  hero: image("preparation.webp", 960, 1440, "Руки нарезают овощи на разделочной доске"),
  birthday: image("birthday.webp", 960, 640, "Блюдо с овощами и миска томатов на столе"),
  corporate: image("shared-table.webp", 960, 640, "Несколько блюд на общем столе"),
  dinner: image("dinner.webp", 960, 1361, "Тарелка с зеленью и яйцом на тёмном столе"),
  studio: image("kitchen.webp", 960, 575, "Светлая кухня с продуктами и посудой"),
  table: image("prep-board.webp", 960, 960, "Овощи и яйца на деревянной доске"),
  pasta: image("pasta.webp", 960, 641, "Паста с томатами и зеленью"),
};

export const preparationImage: Photo = {
  ...homeImages.hero,
  srcSet: "/images/gallery/preparation.webp 480w, /images/home/preparation-small.webp 640w, /images/home/preparation.webp 960w",
  sizes: "(min-width: 48rem) 62vw, 100vw",
};

const directionSizes = "(min-width: 85rem) 26rem, (min-width: 48rem) 32vw, calc(100vw - 2rem)";

export const directions: (HomeLink & { image: Photo; illustration?: boolean })[] = [
  {
    title: "Для взрослых",
    description: "Кулинарные мастер-классы и гастрономические ужины.",
    to: servicePages.adults.path,
    image: {
      src: "/images/studio/hero-steak.webp",
      width: 1024,
      height: 846,
      alt: "Стейк со специями на тёмном сланце",
      focalPoint: "center 23%",
      srcSet: "/images/studio/hero-steak-small.webp 660w, /images/studio/hero-steak.webp 1024w",
      sizes: directionSizes,
    },
  },
  {
    title: "Для детей",
    description: "Дети готовят выбранные блюда и пробуют то, что получилось.",
    to: servicePages.kids.path,
    illustration: true,
    image: {
      src: "/images/studio/kids-pizza-1100.webp",
      srcSet: "/images/studio/kids-pizza-640.webp 640w, /images/studio/kids-pizza-1100.webp 1100w",
      sizes: directionSizes,
      width: 1100,
      height: 614,
      alt: "Иллюстрация детского мастер-класса по приготовлению пиццы",
    },
  },
  {
    title: "Корпоративы",
    description: "Мастер-класс и ужин за одним столом для всей команды.",
    to: servicePages.corporate.path,
    image: { ...homeImages.corporate, sizes: directionSizes, srcSet: "/images/gallery/shared-table.webp 480w, /images/home/shared-table.webp 960w" },
  },
];

export const occasions: HomeLink[] = [
  {
    title: "Дни рождения",
    description: "Праздник для близких с мастер-классом и ужином.",
    to: servicePages.birthday.path,
  },
  {
    title: "Романтический ужин",
    description: "Ужин с кулинарным мастер-классом для двоих.",
    to: servicePages.romantic.path,
  },
  {
    title: "Аренда студии",
    description: "Кухня для съёмок, своего мастер-класса или встречи.",
    to: servicePages.rental.path,
  },
];

export const homeHeading = "Кулинарная студия Рената Исмагилова";
export const founderImage = {
  src: "/images/studio/renat.jpg",
  srcSet: "/images/studio/renat-small.jpg 540w, /images/studio/renat.jpg 960w",
  sizes: "(min-width: 84rem) 39rem, (min-width: 48rem) 50vw, 100vw",
  alt: "Ренат Исмагилов, основатель кулинарной студии TIBON",
  width: 960,
  height: 1708,
};
export const eventCompanyImage = {
  src: "/images/studio/druzya.webp",
  srcSet: "/images/studio/druzya-small.webp 540w, /images/studio/druzya.webp 1086w",
  sizes: "(min-width: 82rem) 45rem, (min-width: 48rem) 55vw, calc(100vw - 2rem)",
  alt: "Участники мероприятия ивент-компании «Друзья» в студии TIBON",
  width: 1086,
  height: 1448,
};
