import { AboutStudioSection } from "../components/home/AboutStudioSection";
import { AdditionalServicesSection } from "../components/home/AdditionalServicesSection";
import { DirectionsSection } from "../components/home/DirectionsSection";
import { EventsSection } from "../components/home/EventsSection";
import { ExperienceSection } from "../components/home/ExperienceSection";
import { FinalCtaSection } from "../components/home/FinalCtaSection";
import { GallerySection } from "../components/home/GallerySection";
import { HeroSection } from "../components/home/HeroSection";
import { PopularOffersSection } from "../components/home/PopularOffersSection";
import { homeImages } from "../data/home";
import type { Route } from "./+types/home";

export function loader() {
  const configuredUrl = process.env.PUBLIC_SITE_ORIGIN;
  const url = configuredUrl ? URL.parse(configuredUrl) : null;
  const origin = url && ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  return { origin };
}

export function meta({ data }: Route.MetaArgs) {
  const title = "TIBON — кулинарная студия";
  const description = "Кулинарная студия TIBON: совместное приготовление, события для взрослых и детей и гастрономические впечатления.";
  const canonical = data?.origin ? new URL("/", data.origin).href : null;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "ru_RU" },
    ...(canonical ? [
      { tagName: "link" as const, rel: "canonical", href: canonical },
      { property: "og:url", content: canonical },
      { property: "og:image", content: new URL(homeImages.hero.src, canonical).href },
      { property: "og:image:alt", content: homeImages.hero.alt },
    ] : []),
  ];
}

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <HeroSection />
      <DirectionsSection />
      <EventsSection />
      <AboutStudioSection />
      <ExperienceSection />
      <PopularOffersSection />
      <GallerySection />
      <AdditionalServicesSection />
      <FinalCtaSection />
    </main>
  );
}
