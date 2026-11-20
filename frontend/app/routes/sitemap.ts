import { informationPages, servicePages } from "../data/business";
import { loadPublicPage } from "../lib/pageMeta";

export function loader() {
  const { origin } = loadPublicPage();
  if (!origin) return new Response("Sitemap unavailable", { status: 404 });

  const paths = ["/", ...Object.values(servicePages).map(({ path }) => path), ...Object.values(informationPages).map(({ path }) => path)];
  const urls = paths.map(path => `  <url><loc>${new URL(path, origin)}</loc></url>`).join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
