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
} finally {
  await browser.close();
}
