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

export function serviceMeta(page: { title: string; description: string; path: string }) {
  return ({ data }: { data?: { origin: string | null } }): MetaDescriptor[] => {
    const url = data?.origin ? new URL(page.path, data.origin).href : null;
    return [
      ...pageMeta(page),
      { property: "og:title", content: `${page.title} — TIBON` },
      { property: "og:description", content: page.description },
      { property: "og:type", content: "website" },
      ...(url ? [
        { tagName: "link" as const, rel: "canonical", href: url },
        { property: "og:url", content: url },
      ] : []),
    ];
  };
}
