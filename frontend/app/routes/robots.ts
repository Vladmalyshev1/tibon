import { loadPublicPage } from "../lib/pageMeta";

export function loader() {
  const { origin } = loadPublicPage();
  const body = origin
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", origin)}\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
