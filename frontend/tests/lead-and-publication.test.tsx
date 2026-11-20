import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { LeadForm } from "../app/components/pages/LeadForm";
import { leadSchema } from "../app/data/lead";
import { loader as robots } from "../app/routes/robots";
import { loader as sitemap } from "../app/routes/sitemap";

const draft = {
  name: " Анна ", phone: "8 (912) 345-67-89", format: "birthday", date: "2099-05-20",
  comment: " ", consent: true,
};

describe("request draft", () => {
  it("normalizes a valid draft for the API", () => {
    expect(leadSchema.parse(draft)).toEqual({
      name: "Анна", phone: "+79123456789", format: "birthday", date: "2099-05-20", comment: undefined, consent: true,
    });
    expect(leadSchema.parse({ ...draft, phone: "(912) 345-67-89", date: "" }).date).toBeUndefined();
  });

  it.each([
    { phone: "+44 1234567890" }, { date: "2020-01-01" }, { date: "2099-02-30" },
    { format: "unknown" }, { consent: false },
  ])("rejects invalid or incomplete drafts (%o)", invalid => {
    expect(leadSchema.safeParse({ ...draft, ...invalid }).success).toBe(false);
  });

});

describe("lead submission", () => {
  const result = { id: "5d34edf2-4f64-4d16-9a82-0701bc872355" };
  afterEach(() => vi.unstubAllGlobals());

  async function fillForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole("textbox", { name: /Имя/ }), "Анна");
    await user.type(screen.getByRole("textbox", { name: /Телефон/ }), "+7 912 345-67-89");
    await user.selectOptions(screen.getByRole("combobox", { name: /Формат/ }), "birthday");
    await user.click(screen.getByRole("checkbox", { name: /Согласен/ }));
  }

  it("focuses the first invalid field and does not call the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<MemoryRouter><LeadForm /></MemoryRouter>);
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    const name = screen.getByRole("textbox", { name: /Имя/ });
    await user.click(submit);
    await waitFor(() => expect(name).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent("Проверьте отмеченные поля");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks double submission and confirms only after a valid success response", async () => {
    let resolve!: (response: Response) => void;
    const promise = new Promise<Response>(done => { resolve = done; });
    const fetchMock = vi.fn().mockReturnValue(promise);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<MemoryRouter><LeadForm /></MemoryRouter>);
    await fillForm(user);
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    const form = submit.closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(await screen.findByRole("button", { name: "Отправляем…" })).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/leads", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": expect.any(String) },
      body: JSON.stringify({ name: "Анна", phone: "+79123456789", format: "birthday", consent: true }),
    }));
    resolve(Response.json(result, { status: 201 }));
    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent("Заявка отправлена");
    expect(success).toHaveFocus();
  });

  it.each([
    [new Error("Network down"), "Не удалось связаться с сервером"],
    [Response.json({ detail: "Service unavailable" }, { status: 503 }), "Не удалось отправить заявку"],
    [Response.json({}, { status: 201 }), "Не удалось отправить заявку"],
    [Response.json({}, { status: 429 }), "Слишком много попыток"],
  ])("keeps input and reuses the key on retry after %s", async (failure, message) => {
    const fetchMock = vi.fn();
    if (failure instanceof Error) fetchMock.mockRejectedValueOnce(failure);
    else fetchMock.mockResolvedValueOnce(failure);
    fetchMock.mockResolvedValueOnce(Response.json(result, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<MemoryRouter><LeadForm /></MemoryRouter>);
    await fillForm(user);
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    await user.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("textbox", { name: /Телефон/ })).toHaveValue("+7 912 345-67-89");
    expect(screen.getByRole("checkbox", { name: /Согласен/ })).toBeChecked();
    await user.click(submit);
    expect(await screen.findByRole("status")).toHaveTextContent("Заявка отправлена");
    const keys = fetchMock.mock.calls.map(([, options]) => options.headers["Idempotency-Key"]);
    expect(keys).toEqual([expect.any(String), keys[0]]);
  });

  it("maps a validation error to the field without exposing the raw response", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({
      errors: { phone: "invalid" }, detail: "private detail",
    }, { status: 422 })).mockResolvedValueOnce(Response.json(result, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<MemoryRouter><LeadForm /></MemoryRouter>);
    await fillForm(user);
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    await user.click(submit);
    const phone = screen.getByRole("textbox", { name: /Телефон/ });
    expect(await screen.findByText("Проверьте номер телефона.")).toBeInTheDocument();
    expect(phone).toHaveFocus();
    expect(screen.queryByText("private detail")).not.toBeInTheDocument();
    await user.clear(phone);
    await user.type(phone, "+7 000 000-00-00");
    await user.click(submit);
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"])
      .not.toEqual(fetchMock.mock.calls[1][1].headers["Idempotency-Key"]);
  });
});

describe("publication endpoints", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("keeps drafts closed to crawlers while no public origin is configured", async () => {
    vi.stubEnv("PUBLIC_SITE_ORIGIN", "");
    expect(await robots().text()).toContain("Disallow: /");
    expect(sitemap().status).toBe(404);
  });

  it("lists only complete canonical pages from the configured origin", async () => {
    vi.stubEnv("PUBLIC_SITE_ORIGIN", "https://tibon.example");
    expect(await robots().text()).toContain("Sitemap: https://tibon.example/sitemap.xml");
    const response = sitemap();
    expect(response.headers.get("content-type")).toBe("application/xml; charset=utf-8");
    const xml = await response.text();
    expect(xml.match(/<loc>/g)).toHaveLength(12);
    expect(xml).toContain("<loc>https://tibon.example/contact/</loc>");
    expect(xml).not.toMatch(/\/(kontakty|zayavka|o-studii|politika-konfidencialnosti)\//);
  });
});
