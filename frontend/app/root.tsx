import "./styles/app.css";
import type { ReactNode } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { AppLayout } from "./layouts/AppLayout";
import { MainContainer } from "./components/layout/MainContainer";
import { Section } from "./components/layout/Section";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function meta() {
  return [
    { title: "TIBON — кулинарная студия" },
    { name: "description", content: "Публичный сайт кулинарной студии TIBON." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function App() {
  return <AppLayout><Outlet /></AppLayout>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const title = isNotFound ? "Страница не найдена" : "Не удалось открыть страницу";

  return (
    <AppLayout>
      <MainContainer className="cinematic-page error-state" tabIndex={-1}>
        <Section className="error-page" aria-labelledby="error-title">
          {isNotFound ? <p className="cinematic-kicker">Ошибка 404</p> : null}
          <h1 id="error-title" className="type-display">{title}</h1>
          <p className="type-lead">
            {isNotFound ? "Проверьте адрес или вернитесь на главную страницу." : "Попробуйте обновить страницу позже."}
          </p>
          <a className="button-primary button-md" href="/">На главную</a>
        </Section>
      </MainContainer>
    </AppLayout>
  );
}
