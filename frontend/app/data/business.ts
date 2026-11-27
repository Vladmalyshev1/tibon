const addressRegion = "Удмуртская Республика";
const addressLocality = "село Первомайский";
const studioStreet = "ул. Архитектора Сергея Макарова, 2/4";
const studioOffice = "офис 3";
const studioBuilding = `${addressRegion}, Завьяловский район, ${addressLocality}, ${studioStreet}`;
const studioMapPoint = "53.310386,56.872993";

export const studioOperator = { name: "ИП Исмагилов Р.С.", registrationNumber: "325180000086978" };

const studioPhones = [
  { label: "57-69-90", href: "tel:+73412576990" },
  { label: "+7 (982) 117-69-90", href: "tel:+79821176990" },
] as const;

export const studioContact = {
  phone: studioPhones[0],
  phones: studioPhones,
  address: `${studioBuilding}, ${studioOffice}`,
  postalAddress: { addressRegion, addressLocality, streetAddress: `${studioStreet}, ${studioOffice}`, addressCountry: "RU" },
  hours: "Ежедневно 10:00–23:00, по записи",
  mapUrl: "https://yandex.ru/maps/?indoorLevel=1&ll=53.310613%2C56.872996&mode=poi&poi%5Bpoint%5D=53.310145%2C56.872895&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D137562118087&z=20",
  mapEmbedUrl: `https://yandex.ru/map-widget/v1/?ll=53.27,56.865&z=11&pt=${studioMapPoint}&l=map`,
  socials: [
    { label: "ВКонтакте", href: "https://vk.ru/ti_bon_studio" },
    { label: "MAX", href: "https://max.ru/u/f9LHodD0cOLGJIMXMm0xJ4xy0ylfANwtci4zF38HkXVIVETBq0J01j8tbc0", icon: "/images/studio/max.svg" },
  ],
};

export type Price = {
  amount: number;
  unit?: "человек" | "ребёнок" | "час" | "штука";
  from?: boolean;
};

const priceUnits = { человек: "за человека", ребёнок: "за ребёнка", час: "в час", штука: "за штуку" };
const numberFormat = new Intl.NumberFormat("ru-RU");

export function formatPrice({ amount, unit, from }: Price) {
  return `${from ? "от " : ""}${numberFormat.format(amount)}\u00a0₽${unit ? ` ${priceUnits[unit]}` : ""}`;
}

export const requestAction = { label: "Оставить заявку", to: "/zayavka/" };
export const requestFormatIds = ["adults", "kids", "corporate", "birthday", "romantic", "rental", "extras"] as const;
export type RequestFormat = typeof requestFormatIds[number];

export function getRequestFormat(value: string | null) {
  return requestFormatIds.find(format => format === value);
}

export function requestActionFor(format: RequestFormat) {
  return { ...requestAction, to: `${requestAction.to}?format=${format}` };
}

export const romanticDinner = {
  price: { amount: 14000, from: true } satisfies Price,
  guests: "Для двоих",
  rentalDuration: "3 часа",
  courses: "Три блюда",
  show: "Шоу с огнём или жидким азотом",
};

export const servicePages = {
  adults: {
    path: "/dlya-vzroslyh/", crumb: "Для взрослых", title: "Кулинарные мастер-классы для взрослых",
    description: "Готовьте с шефом или выберите ужин, который он приготовит для вашей компании. Форматы для дня рождения, корпоратива и встречи с друзьями.",
    seo: {
      title: "Кулинарные мастер-классы для взрослых в Ижевске",
      description: "Готовьте вместе с шефом или закажите ужин для компании. Выберите формат для взрослого дня рождения, корпоратива или встречи с друзьями.",
    },
  },
  kids: {
    path: "/dlya-detey/", crumb: "Для детей", title: "Детские кулинарные мастер-классы",
    description: "Детский праздник, на котором гости готовят и пробуют выбранные блюда. Для компаний от восьми детей.",
    seo: {
      title: "Детские кулинарные мастер-классы в Ижевске",
      description: "Детский праздник для группы от восьми участников. Дети готовят выбранные блюда и пробуют их вместе. Посмотрите программу и запросите детское меню.",
    },
  },
  corporate: {
    path: "/dlya-vzroslyh/korporativ/", crumb: "Корпоратив", title: "Кулинарный корпоратив",
    description: "Соберите команду за одним столом. Вместе приготовьте блюда с шефом и попробуйте их за ужином.",
    seo: {
      title: "Кулинарный корпоратив в Ижевске",
      description: "Команда готовит блюда с шефом и пробует их за общим столом. Посмотрите программу кулинарного корпоратива, меню и варианты дополнительных услуг.",
    },
  },
  birthday: {
    path: "/dlya-vzroslyh/den-rozhdeniya/", crumb: "День рождения", title: "День рождения за общим столом",
    description: "Пригласите близких на кулинарный мастер-класс. Выберите меню для праздника и приготовьте его вместе с шефом.",
    seo: {
      title: "Кулинарный день рождения для взрослых",
      description: "Отметьте день рождения в Ижевске с кулинарным мастер-классом и ужином. Выберите меню и приготовьте блюда вместе с шефом.",
    },
  },
  romantic: {
    path: "/dlya-vzroslyh/romanticheskiy-uzhin/", crumb: "Романтический ужин", title: "Романтический ужин для двоих",
    description: "Гастрономический ужин из трёх блюд с мастер-классом. В формат входят три часа аренды студии и кулинарное шоу.",
    seo: {
      title: `Романтический ужин для двоих в Ижевске ${formatPrice(romanticDinner.price)}`,
      description: `Ужин из трёх блюд с кулинарным мастер-классом и шоу ${formatPrice(romanticDinner.price)}. В стоимость входят три часа аренды студии.`,
    },
  },
  rental: {
    path: "/arenda/", crumb: "Аренда студии", title: "Аренда кулинарной студии",
    description: "Кухня и пространство для вашей фотосессии, авторского мастер-класса или частного мероприятия.",
    seo: {
      title: "Аренда кулинарной студии в Ижевске",
      description: "Почасовая аренда кухни для съёмок, мастер-класса или частного мероприятия. Посмотрите тарифы и маршрут до студии в селе Первомайском.",
    },
  },
  menu: {
    path: "/menu/", crumb: "Меню", title: "Меню кулинарной студии",
    description: "Запросите взрослое или детское меню кулинарных мастер-классов. Актуальный PDF можно скачать после заполнения формы.",
    seo: { title: "Меню мастер-классов для взрослых и детей" },
  },
  extras: {
    path: "/dop-uslugi/", crumb: "Дополнительные услуги", title: "Дополнительные услуги для праздника",
    description: "Организация праздников с ивент-компанией «Друзья», ведущий Александр Подкин, игры, квизы и фотосъёмка в кулинарной студии TIBON.",
    seo: {
      title: "Ведущий, игры и фотосъёмка для праздника",
      description: "Дополните кулинарный мастер-класс ведущим, квизом, детской анимацией или фотосъёмкой. Посмотрите варианты и цены на дополнительные услуги.",
    },
  },
};

export const adultGroup = {
  price: { amount: 3300, from: true, unit: "человек" } satisfies Price,
  minimum: 8,
  duration: "4 часа",
  cooking: "2,5–3 часа",
};

export const kidsGroup = {
  price: { amount: 2200, from: true, unit: "ребёнок" } satisfies Price,
  minimum: 8,
  duration: "2,5 часа",
  cooking: "1,5–2 часа",
};

export const rentalRates = [
  { id: "weekday", label: "Будние дни", price: { amount: 3000, unit: "час" } },
  { id: "evening-weekend", label: "Вечер и выходные", price: { amount: 6000, unit: "час" } },
] satisfies { id: string; label: string; price: Price }[];

export const rentalUses = [
  { id: "photo", title: "Фотосессии", description: "Для съёмок с кухней и сервированным столом в кадре." },
  { id: "class", title: "Мастер-классы", description: "Площадка для вашего занятия по кулинарии." },
  { id: "event", title: "Мероприятия", description: "Пространство с профессиональной кухней для своего формата встречи." },
];

export const extraServices = [
  { id: "mafia", title: "Мафия / Бункер", description: "Игры для компании.", price: { amount: 5100, from: true, unit: "час" } },
  { id: "quiz", title: "Квиз", description: "Командная викторина.", price: { amount: 10000, from: true, unit: "час" } },
  { id: "photo", title: "Фотограф", description: "Фотосъёмка мероприятия.", price: { amount: 4000, from: true, unit: "час" } },
  { id: "animation", title: "Детские аниматоры", description: "Развлечения для детского праздника.", priceNote: "Цена по запросу" },
] satisfies { id: string; title: string; description: string; price?: Price; priceNote?: string }[];

export const studioRules = {
  booking: "Чтобы подтвердить бронирование, студия просит внести 50% предоплаты.",
  guestCount: "Изменить число гостей можно не позднее чем за два дня до мероприятия.",
  food: "Свою еду, напитки и фрукты приносить нельзя.",
  parents: "За детей на мероприятии отвечают родители.",
  participation: "Гости старше пяти лет участвуют в мастер-классе и оплачивают полную стоимость.",
  belongings: "Студия не несёт ответственности за личные вещи гостей.",
  smoking: "На территории студии нельзя курить.",
  breakage: "Если посуда разбилась, оплачивается стоимость предмета.",
  cancellation: "При отмене за 10 дней предусмотрен полный возврат. При отмене за 5 дней студия предлагает перенести дату.",
  rescheduling: "Если отменить мероприятие после переноса, возврат не предусмотрен.",
};

export const informationPages = {
  contact: {
    path: "/contact/", title: "Контакты", description: "Телефоны, адрес и часы работы по записи. Карта проезда до кулинарной студии в селе Первомайском.",
    seo: { title: "Контакты кулинарной студии в Ижевске" },
  },
};
