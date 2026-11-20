import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useState } from "react";
import { AppLayout } from "../app/layouts/AppLayout";
import { Header } from "../app/components/navigation/Header";
import { Accordion } from "../app/components/ui/Accordion";
import { Badge } from "../app/components/ui/Badge";
import { Button } from "../app/components/ui/Button";
import { Tabs } from "../app/components/ui/Tabs";
import { Modal } from "../app/components/ui/Modal";

function ModalFixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Открыть</button>
      <Modal open={open} title="Диалог" onClose={() => setOpen(false)}>Текст диалога</Modal>
    </>
  );
}

describe("application chrome", () => {
  it("renders the header, page content, and footer", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppLayout><main>Page body</main></AppLayout>
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: "TIBON — главная" })).toHaveLength(2);
    expect(screen.getByRole("main")).toHaveTextContent("Page body");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Правила студии" })).toHaveAttribute("href", "/pravila/");
    expect(screen.queryByRole("navigation", { name: "Социальные сети" })).not.toBeInTheDocument();
  });

  it("opens and closes the accessible mobile menu", async () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Открыть меню" }));

    const dialog = await screen.findByRole("dialog", { name: "Мобильная навигация" });
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("link", { name: "Для взрослых" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Закрыть меню" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Открыть меню" })).toHaveFocus();
  });
});

describe("UI primitives", () => {
  it("exposes a native expandable accordion", () => {
    render(<Accordion title="Частый вопрос">Ответ</Accordion>);
    expect(screen.getByText("Частый вопрос").closest("details")).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Частый вопрос"));
    expect(screen.getByText("Частый вопрос").closest("details")).toHaveAttribute("open");
  });

  it("switches tabs with click and arrow keys", () => {
    render(<Tabs label="Выбор меню" items={[
      { id: "adult", label: "Взрослое", content: <p>Взрослое меню</p> },
      { id: "kids", label: "Детское", content: <p>Детское меню</p> },
    ]} />);

    const adultTab = screen.getByRole("tab", { name: "Взрослое" });
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Взрослое меню");
    fireEvent.keyDown(adultTab, { key: "ArrowRight" });
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Детское меню");
  });

  it("opens and closes the accessible modal", async () => {
    render(<ModalFixture />);
    fireEvent.click(screen.getByRole("button", { name: "Открыть" }));
    expect(await screen.findByRole("dialog", { name: "Диалог" })).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Закрыть окно" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Диалог" })).not.toBeInTheDocument());
  });

  it("renders design-token variants and loading/disabled buttons accessibly", () => {
    render(<><Badge tone="olive">В работе</Badge><Button loading>Отправить</Button></>);
    expect(screen.getByText("В работе")).toHaveClass("badge-olive");
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Отправить" })).toHaveAttribute("aria-busy", "true");
  });
});
