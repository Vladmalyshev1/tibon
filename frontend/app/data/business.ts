const studioBuilding = "Удмуртская Республика, Завьяловский район, село Первомайский, ул. Архитектора Сергея Макарова, 2/4";
const mapSearch = encodeURIComponent(studioBuilding);

export const studioContact = {
  phone: { label: "57-69-90", href: "tel:+73412576990" },
  address: `${studioBuilding}, офис 3`,
  hours: "Ежедневно 10:00–23:00, по записи",
  mapUrl: `https://yandex.ru/maps/?text=${mapSearch}`,
  mapEmbedUrl: `https://yandex.ru/map-widget/v1/?mode=search&text=${mapSearch}`,
  socials: [
    { label: "ВКонтакте", href: "https://vk.ru/ti_bon_studio" },
    { label: "Telegram", href: "https://t.me/Tibon25" },
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

export const servicePages = {
  adults: {
    path: "/dlya-vzroslyh/", crumb: "Для взрослых", title: "Кулинарные мастер-классы для взрослых",
    description: "Готовьте с шефом или выберите ужин, который он приготовит для вашей компании. Форматы для дня рождения, корпоратива и встречи с друзьями.",
  },
  kids: {
    path: "/dlya-detey/", crumb: "Для детей", title: "Детские кулинарные мастер-классы",
    description: "Детский праздник, на котором гости готовят и пробуют выбранные блюда. Для компаний от восьми детей.",
  },
  corporate: {
    path: "/dlya-vzroslyh/korporativ/", crumb: "Корпоратив", title: "Кулинарный корпоратив",
    description: "Соберите команду за одним столом. Вместе приготовьте блюда с шефом и попробуйте их за ужином.",
  },
  birthday: {
    path: "/dlya-vzroslyh/den-rozhdeniya/", crumb: "День рождения", title: "День рождения за общим столом",
    description: "Пригласите близких на кулинарный мастер-класс. Выберите меню для праздника и приготовьте его вместе с шефом.",
  },
  romantic: {
    path: "/dlya-vzroslyh/romanticheskiy-uzhin/", crumb: "Романтический ужин", title: "Романтический ужин для двоих",
    description: "Гастрономический ужин из трёх блюд с мастер-классом. В формат входят три часа аренды студии и кулинарное шоу.",
  },
  rental: {
    path: "/arenda/", crumb: "Аренда студии", title: "Аренда кулинарной студии",
    description: "Кухня и пространство для вашей фотосессии, авторского мастер-класса или частного мероприятия.",
  },
  menu: {
    path: "/menu/", crumb: "Меню", title: "Меню кулинарной студии",
    description: "Взрослые и детские меню мастер-классов, стоимость наборов, стейки, закуски и напитки.",
  },
  extras: {
    path: "/dop-uslugi/", crumb: "Дополнительные услуги", title: "Дополнительные услуги для праздника",
    description: "Организация праздников с ивент-компанией «Друзья», ведущий Александр Подкин, игры, квизы и фотосъёмка в кулинарной студии TIBON.",
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

export const romanticDinner = {
  price: { amount: 18000, from: true } satisfies Price,
  guests: "Для двоих",
  rentalDuration: "3 часа",
  courses: "Три блюда",
  show: "Шоу с огнём или жидким азотом",
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
  { id: "mafia", title: "Мафия / Бункер", description: "Игры для компании.", price: { amount: 3500, from: true, unit: "час" } },
  { id: "quiz", title: "Квиз", description: "Командная викторина.", price: { amount: 10000, from: true, unit: "час" } },
  { id: "photo", title: "Фотограф", description: "Фотосъёмка мероприятия.", price: { amount: 4000, from: true, unit: "час" } },
  { id: "animation", title: "Детские аниматоры", description: "Развлечения для детского праздника.", priceNote: "Цена по запросу" },
] satisfies { id: string; title: string; description: string; price?: Price; priceNote?: string }[];

export const studioRules = {
  booking: "Чтобы подтвердить бронирование, студия просит внести 50% предоплаты.",
  guestCount: "Изменить число гостей можно не позднее чем за два дня до мероприятия.",
  food: "Свою еду, напитки, фрукты и торты приносить нельзя.",
  parents: "За детей на мероприятии отвечают родители.",
  participation: "Гости старше пяти лет участвуют в мастер-классе и оплачивают полную стоимость.",
  belongings: "Студия не несёт ответственности за личные вещи гостей.",
  smoking: "На территории студии нельзя курить.",
  breakage: "Если посуда разбилась, оплачивается стоимость предмета.",
  cancellation: "При отмене за 10 дней предусмотрен полный возврат. При отмене за 5 дней студия предлагает перенести дату.",
  rescheduling: "Если отменить мероприятие после переноса, возврат не предусмотрен.",
};

export const informationPages = {
  contact: { path: "/contact/", title: "Контакты", description: "Телефон, адрес и часы работы кулинарной студии TIBON. Карта проезда в село Первомайский." },
  rules: { path: "/pravila/", title: "Правила студии", description: "Условия бронирования, переноса и посещения кулинарной студии TIBON." },
};
