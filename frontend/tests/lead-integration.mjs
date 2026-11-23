import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const base = new URL(process.env.TIBON_E2E_URL ?? "http://127.0.0.1:5173");
assert(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Use a local API and test database");
const endpoint = new URL("/api/v1/leads", base).href;
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(new URL("/zayavka/", base).href);
  const submit = page.getByRole("button", { name: "Отправить заявку" });
  const status = page.getByRole("status").filter({ hasText: "Заявка отправлена" });
  const comment = page.getByLabel("Комментарий");
  let posts = 0;
  page.on("request", request => {
    if (request.url() === endpoint && request.method() === "POST") posts += 1;
  });

  await page.getByLabel("Имя *", { exact: true }).fill("TIBON M6.3 synthetic");
  await page.getByLabel("Телефон *").fill("+70000000603");
  await page.getByLabel("Формат мероприятия *").selectOption("birthday");
  await comment.fill("M6.3 browser QA");
  await submit.click();
  await expect(page.getByText("Поставьте отметку о согласии.")).toBeVisible();
  assert.equal(posts, 0);
  await page.getByRole("checkbox").check();

  await page.route(endpoint, async route => {
    const response = await route.fetch({
      postData: { ...route.request().postDataJSON(), consent: false },
    });
    await route.fulfill({ response });
  }, { times: 1 });
  const invalid = page.waitForResponse(response => response.url() === endpoint);
  await submit.click();
  assert.equal((await invalid).status(), 422);
  await expect(page.getByText("Поставьте отметку о согласии.")).toBeVisible();
  await expect(comment).toHaveValue("M6.3 browser QA");

  const allowSend = Promise.withResolvers();
  const committed = Promise.withResolvers();
  const loseResponse = Promise.withResolvers();
  await page.route(endpoint, async route => {
    try {
      await allowSend.promise;
      const response = await route.fetch();
      committed.resolve({
        status: response.status(),
        body: await response.json(),
        key: route.request().headers()["idempotency-key"],
      });
      await loseResponse.promise;
      await route.abort("connectionreset");
    } catch (error) {
      committed.reject(error);
      await route.abort();
    }
  }, { times: 1 });
  await submit.click();
  await expect(page.getByRole("button", { name: "Отправляем…" })).toBeDisabled();
  await expect(status).toHaveCount(0);
  allowSend.resolve();
  const first = await committed.promise;
  assert.equal(first.status, 201);
  await expect(status).toHaveCount(0);
  loseResponse.resolve();
  await expect(page.getByRole("alert")).toContainText("Не удалось связаться");
  await expect(comment).toHaveValue("M6.3 browser QA");

  const retry = page.waitForResponse(response => response.url() === endpoint);
  await submit.click();
  const replay = await retry;
  assert.equal(replay.status(), 200);
  assert.equal(replay.request().headers()["idempotency-key"], first.key);
  assert.deepEqual(await replay.json(), first.body);
  await expect(status).toBeVisible();
  await expect(status).toBeFocused();
  assert.equal(posts, 3);

  await page.goto(new URL("/menu/?type=kids", base).href);
  const adultMenu = page.getByRole("button", { name: "Скачать взрослое меню" });
  const kidsMenu = page.getByRole("button", { name: "Скачать детское меню" });
  await expect(adultMenu).toBeDisabled();
  await expect(kidsMenu).toBeDisabled();
  await page.getByLabel("Имя *").fill("TIBON synthetic menu");
  await page.getByLabel("Телефон *").fill("+70000000711");
  await expect(kidsMenu).toBeDisabled();
  await page.getByRole("checkbox").check();
  const menus = {};
  for (const [type, button] of [["adults", adultMenu], ["kids", kidsMenu]]) {
    await expect(button).toBeEnabled();
    const saved = page.waitForResponse(response => response.url() === endpoint && response.request().method() === "POST");
    const downloaded = page.waitForEvent("download");
    await button.click();
    const response = await saved;
    assert.equal(response.status(), 201);
    assert.equal(response.request().postDataJSON().source, `menu_${type}`);
    const { id } = await response.json();
    const download = await downloaded;
    assert.equal(download.suggestedFilename(), `tibon-menu-${type}.pdf`);
    const bytes = await readFile(await download.path());
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
    menus[type] = { id, sha256: createHash("sha256").update(bytes).digest("hex") };
  }
  assert.notEqual(menus.adults.sha256, menus.kids.sha256);
  assert.equal(posts, 5);
  console.log(JSON.stringify({ leadId: first.body.id, status: [422, 201, 200], menus }));

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  });
  const callbackPage = await mobile.newPage();
  await callbackPage.goto(base.href);
  const callback = callbackPage.locator(".callback-form");
  const callbackName = callback.getByLabel("Имя *", { exact: true });
  const phone = callback.getByLabel("Телефон *");
  const consent = callback.getByRole("checkbox");
  const callMe = callback.getByRole("button", { name: "Перезвоните мне" });
  const callbackStatus = callbackPage.getByRole("status").filter({ hasText: "Заявка принята" });
  const requests = [];
  callbackPage.on("request", request => {
    if (request.url() === endpoint && request.method() === "POST") requests.push(request);
  });
  await expect(callMe).toBeEnabled();
  assert.deepEqual(await callback.locator("input, select, textarea").evaluateAll(
    fields => fields.map(field => field.name),
  ), ["name", "phone", "consent"]);
  await expect(consent).not.toBeChecked();
  await callbackName.fill("TIBON synthetic callback");
  await phone.press("End");
  await phone.pressSequentially("0123456789");
  await expect(phone).toHaveValue("+7 (012) 345-67-89");
  await phone.pressSequentially("0");
  await expect(phone).toHaveValue("+7 (012) 345-67-89");
  await phone.evaluate(input => {
    const start = input.value.indexOf("-");
    input.setSelectionRange(start, start);
  });
  await phone.press("Delete");
  await expect(phone).toHaveValue("+7 (012) 345-78-9");
  await phone.pressSequentially("6");
  await expect(phone).toHaveValue("+7 (012) 345-67-89");
  await phone.evaluate(input => {
    const start = input.value.indexOf(")") + 2;
    input.setSelectionRange(start, start);
  });
  await phone.press("Backspace");
  await expect(phone).toHaveValue("+7 (013) 456-78-9");
  await callMe.click();
  await expect(phone).toBeFocused();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  await phone.evaluate(input => {
    const start = input.value.indexOf("(") + 3;
    input.setSelectionRange(start, start);
  });
  await phone.pressSequentially("2");
  await expect(phone).toHaveValue("+7 (012) 345-67-89");

  for (const [pasted, expected] of [
    ["+7 (000) 000-07-02", "+7 (000) 000-07-02"],
    ["8 000 000 07 03", "+7 (000) 000-07-03"],
  ]) {
    await phone.evaluate((input, text) => {
      const { DataTransfer, ClipboardEvent } = input.ownerDocument.defaultView;
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", text);
      input.dispatchEvent(new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }));
    }, pasted);
    await expect(phone).toHaveValue(expected);
  }
  await callMe.click();
  await expect(consent).toBeFocused();
  assert.equal(requests.length, 0);
  await consent.check();

  await callbackPage.route(endpoint, route => route.fulfill({ status: 503 }), { times: 1 });
  await callMe.click();
  await expect(callback.getByRole("alert")).toContainText("Не удалось отправить заявку");
  await expect(callbackName).toHaveValue("TIBON synthetic callback");
  await expect(phone).toHaveValue("+7 (000) 000-07-03");
  await expect(callbackStatus).toHaveCount(0);

  const releaseCallback = Promise.withResolvers();
  await callbackPage.route(endpoint, async route => {
    await releaseCallback.promise;
    await route.continue();
  }, { times: 1 });
  const callbackSaved = callbackPage.waitForResponse(response =>
    response.url() === endpoint && response.status() === 201,
  );
  await callMe.click();
  await expect(callback.getByRole("button", { name: "Отправляем…" })).toBeDisabled();
  await callback.evaluate(form => form.requestSubmit());
  await expect(callbackStatus).toHaveCount(0);
  releaseCallback.resolve();
  await callbackSaved;
  await expect(callbackStatus).toBeFocused();
  assert.equal(requests.length, 2);
  assert.equal(requests[0].headers()["idempotency-key"], requests[1].headers()["idempotency-key"]);
  assert.deepEqual(requests[1].postDataJSON(), {
    name: "TIBON synthetic callback", phone: "+70000000703", consent: true, format: "callback",
  });
  console.log("Callback: mobile input, paste, deletion, consent, HTTP 503, duplicate protection and real API save pass.");
} finally {
  await browser.close();
}
