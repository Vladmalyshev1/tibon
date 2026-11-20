import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, StaticRouter } from "react-router";
import { Breadcrumbs } from "../app/components/navigation/Breadcrumbs";
import { PageGallery } from "../app/components/pages/PageGallery";
import { PageHero } from "../app/components/pages/PageHero";
import { ServiceCard } from "../app/components/pages/ServiceCard";
import { galleryImages } from "../app/data/home";
import { pageMeta, placeholderMeta } from "../app/lib/pageMeta";
import { InternalPage } from "./fixtures/InternalPage";

describe("internal page components", () => {
  it("composes one H1, named H2 sections and H3 items with page actions", () => {
    render(<MemoryRouter><InternalPage /></MemoryRouter>);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const hero = screen.getByRole("region", { name: "Проверка внутренних страниц" });
    expect(within(hero).getByRole("img")).toHaveAttribute("fetchpriority", "high");
    expect(within(hero).getByRole("link", { name: "К примерам" })).toHaveAttribute("href", "/#examples");
    const features = screen.getByRole("region", { name: "Что проверить" });
    expect(features).toHaveAttribute("id", "examples");
    expect(within(features).getAllByRole("heading", { level: 3 })).toHaveLength(4);
    const service = screen.getByRole("article");
    expect(within(service).getByRole("link", { name: "Подробнее: Пример карточки" })).toHaveAttribute("href", "/dop-uslugi/");
    expect(screen.getByText("Иллюстрация кухонного пространства").tagName).toBe("FIGCAPTION");
    expect(screen.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");
  });

  it("renders textual variants with no empty media or invented actions", () => {
    render(<><PageHero title="Правила" /><ServiceCard title="Название услуги" description="Описание" /></>);

    expect(screen.getByRole("heading", { level: 1, name: "Правила" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Название услуги" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("marks only the last crumb as current", () => {
    render(<MemoryRouter><Breadcrumbs items={[
      { label: "Главная", to: "/" },
      { label: "Раздел" },
      { label: "Страница", to: "/ignored" },
    ]} /></MemoryRouter>);

    const nav = screen.getByRole("navigation", { name: "Навигационная цепочка" });
    expect(within(nav).getByRole("link", { name: "Главная" })).toHaveAttribute("href", "/");
    expect(within(nav).queryByRole("link", { name: "Страница" })).not.toBeInTheDocument();
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(within(nav).getByText("Страница")).toHaveAttribute("aria-current", "page");
  });

  it("expands questions using the native disclosure", () => {
    render(<MemoryRouter><InternalPage /></MemoryRouter>);
    const question = screen.getByText("Как переключить фото?");
    expect(question.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(question);
    expect(question.closest("details")).toHaveAttribute("open");
  });

  it("opens, cycles and closes the shared lightbox", () => {
    const images = galleryImages.slice(0, 2);
    render(<PageGallery title="Фото" images={images} />);

    const trigger = screen.getByRole("button", { name: `Открыть фото: ${images[0].alt}` });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Фотография" });
    expect(within(dialog).getByText(/^1 из 2/)).toHaveAttribute("aria-live", "polite");
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByRole("img", { name: images[1].alt })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Следующее" }));
    expect(within(dialog).getByText(/^1 из 2/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Закрыть окно" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("handles empty and single-photo galleries", () => {
    const { rerender } = render(<PageGallery title="Фото" images={[]} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    rerender(<PageGallery title="Фото" images={galleryImages.slice(0, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: /^Открыть фото:/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Следующее" })).not.toBeInTheDocument();
    rerender(<PageGallery title="Фото" images={[]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the composition server-side with stable landmark names", () => {
    const html = renderToString(<StaticRouter location="/"><InternalPage /></StaticRouter>);
    expect(html).toContain('aria-label="Навигационная цепочка"');
    expect(html).toMatch(/<h1[^>]*>Проверка внутренних страниц<\/h1>/);
    expect(html).toContain("Как переключить фото?");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toMatch(/<dialog[^>]*\sopen(?:=|\s|>)/);
  });

  it("builds route metadata from supplied title and description", () => {
    expect(pageMeta({ title: "Страница", description: "Описание" })).toEqual([
      { title: "Страница — TIBON" },
      { name: "description", content: "Описание" },
    ]);
    expect(placeholderMeta("Страница")).toContainEqual({ name: "robots", content: "noindex, nofollow" });
  });
});
