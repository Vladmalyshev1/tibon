import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("dlya-vzroslyh", "./routes/adults.tsx"),
  route("dlya-vzroslyh/korporativ", "./routes/corporate.tsx"),
  route("dlya-vzroslyh/den-rozhdeniya", "./routes/birthday.tsx"),
  route("dlya-vzroslyh/romanticheskiy-uzhin", "./routes/romantic-dinner.tsx"),
  route("dlya-detey", "./routes/children.tsx"),
  route("arenda", "./routes/rental.tsx"),
  route("menu", "./routes/menu.tsx"),
  route("dop-uslugi", "./routes/services.tsx"),
  route("o-studii", "./routes/studio.tsx"),
  route("contact", "./routes/contact.tsx"),
  route("kontakty", "./routes/contact.tsx", { id: "contacts-alias" }),
  route("zayavka", "./routes/request.tsx"),
  route("politika-konfidencialnosti", "./routes/privacy.tsx"),
  route("robots.txt", "./routes/robots.ts"),
  route("sitemap.xml", "./routes/sitemap.ts"),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
