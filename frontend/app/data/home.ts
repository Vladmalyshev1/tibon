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
  avifSrcSet: "/images/home/preparation-480.avif 480w, /images/home/preparation-768.avif 768w, /images/home/preparation-960.avif 960w",
  sizes: "(min-width: 48rem) 62vw, 100vw",
};

const directionSizes = "(min-width: 85rem) 26rem, (min-width: 48rem) 32vw, calc(100vw - 2rem)";

const groupCookingImage: Photo = {
  src: "/images/home/adults-format-960.webp",
  width: 960,
  height: 540,
  alt: "Иллюстрация мастер-класса: взрослые готовят пиццу вместе",
  focalPoint: "90% center",
  srcSet: "/images/home/adults-format-640.webp 640w, /images/home/adults-format-960.webp 960w",
  avifSrcSet: "/images/home/adults-format-480.avif 480w, /images/home/adults-format-768.avif 768w, /images/home/adults-format-960.avif 960w",
  sizes: directionSizes,
};

export const directions: (HomeLink & { image: Photo })[] = [
  {
    title: "Для взрослых",
    description: "Кулинарные мастер-классы и гастрономические ужины.",
    to: servicePages.adults.path,
    image: groupCookingImage,
  },
  {
    title: "Для детей",
    description: "Дети готовят выбранные блюда и пробуют то, что получилось.",
    to: servicePages.kids.path,
    image: {
      src: "/images/studio/kids-pizza-1100.webp",
      srcSet: "/images/studio/kids-pizza-640.webp 640w, /images/studio/kids-pizza-1100.webp 1100w",
      avifSrcSet: "/images/studio/kids-pizza-480.avif 480w, /images/studio/kids-pizza-768.avif 768w, /images/studio/kids-pizza-1100.avif 1100w",
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
    image: {
      ...image("corporate-format-960.webp", 960, 1200, "Иллюстрация мастер-класса: участники вместе оформляют блюда"),
      focalPoint: "center 24%",
      srcSet: "/images/home/corporate-format-640.webp 640w, /images/home/corporate-format-960.webp 960w",
      avifSrcSet: "/images/home/corporate-format-480.avif 480w, /images/home/corporate-format-768.avif 768w, /images/home/corporate-format-960.avif 960w",
      sizes: directionSizes,
    },
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
