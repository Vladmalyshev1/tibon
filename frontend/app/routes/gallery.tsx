import { Link } from "react-router";
import type { Route } from "./+types/gallery";
import { informationPages, requestAction } from "../data/business";
import { homeImages } from "../data/home";
import { loadPublicPage, serviceMeta } from "../lib/pageMeta";
import { PageCTA } from "../components/pages/PageCTA";
import { PageGallery } from "../components/pages/PageGallery";
import { PageHero } from "../components/pages/PageHero";
import type { Photo } from "../components/ui/PhotoTile";

const groups = [
  { id: "cooking", label: "Приготовление", photos: [homeImages.table, { ...homeImages.baking, focalPoint: "center 78%" }, homeImages.hero, homeImages.ingredients] },
  { id: "serving", label: "Блюда и сервировка", photos: [homeImages.corporate, homeImages.birthday, homeImages.dinner, homeImages.pasta] },
  { id: "kitchen", label: "Кухня", photos: [homeImages.studio] },
];

export function loader({ request }: Route.LoaderArgs) {
  const category = new URL(request.url).searchParams.get("category");
  return { ...loadPublicPage(), category: groups.find(group => group.id === category)?.id ?? "all" };
}

export const meta = serviceMeta(informationPages.gallery);

function withPreviews(photos: readonly Photo[]) {
  return photos.map((photo, index) => {
    const preview = photo.src.replace("/images/home/", "/images/gallery/");
    const maySpanColumns = index === 0 || index >= photos.length - 2;
    return {
      ...photo,
      srcSet: `${preview} 480w, ${photo.src} ${photo.width}w`,
      sizes: maySpanColumns
        ? "(min-width: 80rem) 640px, (min-width: 64rem) 50vw, 100vw"
        : "(min-width: 80rem) 320px, (min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw",
    };
  });
}

export default function Gallery({ loaderData: { category } }: Route.ComponentProps) {
  const group = groups.find(group => group.id === category);
  return (
    <main id="main-content" className="information-page" tabIndex={-1}>
      <PageHero
        className="information-hero gallery-hero"
        title="Галерея"
        description="Иллюстративная подборка о приготовлении, сервировке и кухонном пространстве."
        breadcrumbs={[{ label: "Главная", to: "/" }, { label: "Галерея" }]}
        details={
          <nav className="gallery-filters" aria-label="Категории фотографий">
            <Link to="/galereya/" aria-current={category === "all" ? "page" : undefined}>Все кадры</Link>
            {groups.map(({ id, label }) => (
              <Link key={id} to={`/galereya/?category=${id}`} aria-current={category === id ? "page" : undefined} preventScrollReset>{label}</Link>
            ))}
          </nav>
        }
      />
      <PageGallery title={group?.label ?? "Приготовление и сервировка"} images={withPreviews(group?.photos ?? groups.flatMap(({ photos }) => photos))} layout="mosaic" />
      <PageCTA title="Готовьте вместе с шефом" action={requestAction} layout="inline" />
    </main>
  );
}
