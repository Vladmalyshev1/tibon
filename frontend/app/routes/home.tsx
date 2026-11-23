import { AboutStudioSection } from "../components/home/AboutStudioSection";
import { DirectionsSection } from "../components/home/DirectionsSection";
import { ExperienceSection } from "../components/home/ExperienceSection";
import { FinalCtaSection } from "../components/home/FinalCtaSection";
import { HeroSection } from "../components/home/HeroSection";
import { CallbackForm } from "../components/pages/CallbackForm";
import { studioContact } from "../data/business";
import { founderImage, homeHeading } from "../data/home";
import type { Route } from "./+types/home";

const [opensAt, closesAt] = studioContact.hours.match(/\d{2}:\d{2}/g) ?? [];

export function loader() {
  const configuredUrl = process.env.PUBLIC_SITE_ORIGIN;
  const url = configuredUrl ? URL.parse(configuredUrl) : null;
  const origin = url && ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  return { origin };
}

export function meta({ data }: Route.MetaArgs) {
  const title = `${homeHeading} — TIBON`;
  const description = "Кулинарные мастер-классы для взрослых и детей, частные праздники и корпоративы в студии Рената Исмагилова.";
  const canonical = data?.origin ? new URL("/", data.origin).href : null;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "ru_RU" },
    { name: "page-type", content: "place" },
    { name: "site-kind", content: "other" },
    { name: "page-kind", content: "place" },
    ...(canonical ? [
      { tagName: "link" as const, rel: "canonical", href: canonical },
      { property: "og:url", content: canonical },
      { property: "og:image", content: new URL(founderImage.src, canonical).href },
      { property: "og:image:alt", content: founderImage.alt },
    ] : []),
  ];
}

export default function Home() {
  return (
    <main id="main-content" className="cinematic-home" tabIndex={-1}>
      <HeroSection />
      <section className="home-callback" aria-labelledby="home-callback-title">
        <div className="reference-wrap">
          <p className="cinematic-kicker">Обратная связь</p>
          <h2 id="home-callback-title" className="type-h2">Заказать обратный звонок</h2>
          <p className="home-callback-hours">Позвоним в рабочее время с <strong>{opensAt}</strong> до <strong>{closesAt}</strong></p>
          <CallbackForm />
        </div>
      </section>
      <AboutStudioSection />
      <DirectionsSection />
      <ExperienceSection />
      <FinalCtaSection />
    </main>
  );
}
