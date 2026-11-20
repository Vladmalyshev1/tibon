import type { MetaDescriptor } from "react-router";

export function placeholderMeta(title: string): MetaDescriptor[] {
  return [
    { title: `${title} — TIBON` },
    { name: "description", content: `Структурная заготовка страницы «${title}» сайта TIBON.` },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
