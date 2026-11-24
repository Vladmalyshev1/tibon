import type { MetaDescriptor } from "react-router";

export function pageMeta({ title, description, noIndex = false }: {
  title: string;
  description: string;
  noIndex?: boolean;
}): MetaDescriptor[] {
  return [
    { title: `${title} — TIBON` },
    { name: "description", content: description },
    ...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
  ];
}

export function placeholderMeta(title: string): MetaDescriptor[] {
  return pageMeta({ title, description: `Структурная заготовка страницы «${title}» сайта TIBON.`, noIndex: true });
}

export function loadPublicPage() {
  const configured = process.env.PUBLIC_SITE_ORIGIN;
  const url = configured ? URL.parse(configured) : null;
  return { origin: url && ["http:", "https:"].includes(url.protocol) ? url.origin : null };
}

const socialPreviews: Record<string, { file: string; alt: string }> = {
  "/": { file: "home", alt: "Ренат Исмагилов, основатель кулинарной студии TIBON" },
  "/dlya-vzroslyh/": { file: "adults", alt: "Стейк и закуски на тёмном столе" },
  "/dlya-vzroslyh/korporativ/": { file: "corporate", alt: "Иллюстрация кулинарного мастер-класса для команды" },
  "/dlya-vzroslyh/den-rozhdeniya/": { file: "birthday", alt: "Блюдо с овощами и миска томатов на столе" },
  "/dlya-vzroslyh/romanticheskiy-uzhin/": { file: "romantic", alt: "Тарелка с зеленью и яйцом на тёмном столе" },
  "/dlya-detey/": { file: "kids", alt: "Иллюстрация детского мастер-класса по приготовлению пиццы" },
  "/arenda/": { file: "rental", alt: "Иллюстрация кухонного пространства с островом и барными стульями" },
  "/menu/": { file: "menu", alt: "Обложка меню кулинарной студии TIBON" },
  "/dop-uslugi/": { file: "extras", alt: "Участники мероприятия ивент-компании «Друзья» в студии TIBON" },
  "/contact/": { file: "contact", alt: "Фартук с логотипом кулинарной студии TIBON" },
};

export function socialPreviewMeta(path: string, origin: string): MetaDescriptor[] {
  const preview = socialPreviews[path];
  if (!preview) return [];
  return [
    { property: "og:image", content: new URL(`/images/og/${preview.file}.jpg`, origin).href },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: preview.alt },
  ];
}

export function serviceMeta(page: { title: string; description: string; path: string; seo?: { title?: string; description?: string } }) {
  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? page.description;
  return ({ data }: { data?: { origin: string | null } }): MetaDescriptor[] => {
    const url = data?.origin ? new URL(page.path, data.origin).href : null;
    return [
      ...pageMeta({ title, description }),
      { property: "og:title", content: `${title} — TIBON` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      ...(url ? [
        { tagName: "link" as const, rel: "canonical", href: url },
        { property: "og:url", content: url },
        ...socialPreviewMeta(page.path, url),
      ] : []),
    ];
  };
}
