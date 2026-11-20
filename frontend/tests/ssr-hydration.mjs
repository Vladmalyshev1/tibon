import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";

const probe = createServer();
await new Promise((resolve, reject) => {
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", resolve);
});
const address = probe.address();
assert(address && typeof address !== "string");
const port = address.port;
await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));

const server = spawn(process.execPath, [
  "node_modules/@react-router/serve/bin.js",
  "build/server/index.js",
], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), PUBLIC_SITE_ORIGIN: "https://tibon.example" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

try {
  const readyAt = Date.now() + 10_000;
  while (!serverOutput.includes(String(port)) && Date.now() < readyAt) {
    if (server.exitCode !== null) throw new Error(`SSR server exited early: ${serverOutput}`);
    await delay(100);
  }
  assert(serverOutput.includes(String(port)), `SSR server did not start: ${serverOutput}`);

  const baseUrl = `http://127.0.0.1:${port}`;
  const homeResponse = await fetch(`${baseUrl}/`);
  const homeHtml = await homeResponse.text();
  assert.equal(homeResponse.status, 200);
  assert.match(homeHtml, /<title>TIBON — кулинарная студия<\/title>/);
  assert.match(homeHtml, /TIBON — главная/);
  assert.match(homeHtml, /Навигация в подвале/);
  assert.match(homeHtml, /type="module"/);
  assert.match(homeHtml, /<h1[^>]*>Готовить вместе — это событие<\/h1>/);
  assert.match(homeHtml, /rel="canonical" href="https:\/\/tibon\.example\/"/);
  assert.match(homeHtml, /property="og:image" content="https:\/\/tibon\.example\/images\/home\/preparation\.webp"/);

  const publicPaths = [
    "/dlya-vzroslyh/",
    "/dlya-vzroslyh/korporativ/",
    "/dlya-vzroslyh/den-rozhdeniya/",
    "/dlya-vzroslyh/romanticheskiy-uzhin/",
    "/dlya-detey/",
    "/arenda/",
    "/menu/",
    "/dop-uslugi/",
    "/galereya/",
    "/o-studii/",
    "/contact/",
    "/kontakty/",
    "/pravila/",
    "/zayavka/",
    "/politika-konfidencialnosti/",
  ];
  for (const path of publicPaths) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    assert.equal(response.status, 200, `${path} should return HTTP 200`);
    assert.match(html, /<title>.+ — TIBON<\/title>/, `${path} should return route metadata`);
    assert.match(html, /name="robots" content="noindex, nofollow"/, `${path} is scaffold content`);
    assert.match(html, /TIBON — главная/, `${path} should SSR the header`);
    assert.match(html, /Навигация в подвале/, `${path} should SSR the footer`);
  }

  const missingResponse = await fetch(`${baseUrl}/unknown-m3-route/`);
  const missingHtml = await missingResponse.text();
  assert.equal(missingResponse.status, 404);
  assert.match(missingHtml, /Страница не найдена/);
  console.log("SSR: home and public route return HTML; unknown route returns 404.");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Готовить вместе — это событие" }).waitFor();
    assert.equal(await page.locator("main > section").count(), 9);
    assert.equal(await page.locator("h1").count(), 1);
    await page.locator(".hero-actions").getByRole("link", { name: "Смотреть направления" }).click();
    await page.waitForURL("**/#directions");
    page.on("console", (message) => {
      if (message.type() === "error") pageErrors.push(message.text());
    });
    const links = await page.locator('main a[href], header a[href], footer a[href]').evaluateAll(
      (anchors) => Array.from(new Set(anchors.map((anchor) => anchor.getAttribute("href")))),
    );
    for (const href of links) {
      if (href.startsWith("#")) {
        assert.equal(await page.locator(href).count(), 1);
      } else {
        assert.equal((await fetch(new URL(href, baseUrl))).status, 200, href);
      }
    }
    for (const width of [360, 390, 480, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const picture of await page.locator("main img").all()) {
        await picture.scrollIntoViewIfNeeded();
        await picture.evaluate((element) => element.decode());
        assert(await picture.getAttribute("alt"));
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), true, `Overflow at ${width}px`);
    }
    const thumbnail = page.getByRole("button", { name: /^Открыть фото:/ }).first();
    await thumbnail.scrollIntoViewIfNeeded();
    await thumbnail.focus();
    await page.keyboard.press("Enter");
    const lightbox = page.getByRole("dialog", { name: "Фотография" });
    await lightbox.waitFor();
    assert.match(await lightbox.locator("figcaption").innerText(), /^1 из 6/);
    await page.keyboard.press("ArrowRight");
    await lightbox.getByText(/^2 из 6/).waitFor();
    await lightbox.getByRole("button", { name: "Предыдущее" }).click();
    await lightbox.getByText(/^1 из 6/).waitFor();
    await page.keyboard.press("Escape");
    await lightbox.waitFor({ state: "hidden" });
    assert.equal(await thumbnail.evaluate((element) => document.activeElement === element), true);
    await page.locator(".final-cta").getByRole("link", { name: "Оставить заявку" }).click();
    await page.getByText(/Онлайн-заявки пока недоступны/).waitFor();
    await page.getByRole("link", { name: "Вернуться на главную" }).click();
    await page.getByRole("heading", { level: 1, name: "Готовить вместе — это событие" }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), true);

    const fontsLoaded = await page.evaluate(async () => {
      const [display, body] = await Promise.all([
        document.fonts.load('400 40px "Playfair Display Variable"', "Кулинарная студия"),
        document.fonts.load('400 16px "Inter Variable"', "Кулинарная студия"),
      ]);
      return { display: display.length > 0, body: body.length > 0 };
    });
    assert.deepEqual(fontsLoaded, { display: true, body: true });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Открыть меню" }).click();
    const menu = page.getByRole("dialog", { name: "Мобильная навигация" });
    await menu.waitFor({ state: "visible" });
    await menu.getByRole("link", { name: "Для взрослых" }).click();
    await page.getByRole("heading", { level: 1, name: "Для взрослых" }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/dlya-vzroslyh/");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('.desktop-navigation a[aria-current="page"]').waitFor();
    assert.equal(await page.locator('.desktop-navigation a[aria-current="page"]').getAttribute("href"), "/dlya-vzroslyh/");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), true);
    assert.deepEqual(pageErrors, []);
    console.log("Chromium: 8 widths, image decoding, links, request CTA, keyboard gallery, fonts, mobile navigation and console pass.");
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
