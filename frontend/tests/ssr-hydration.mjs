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
  assert.match(homeHtml, /<title>Кулинарная студия Рената Исмагилова — TIBON<\/title>/);
  assert.match(homeHtml, /TIBON — главная/);
  assert.match(homeHtml, /Навигация в подвале/);
  assert.match(homeHtml, /type="module"/);
  assert.match(homeHtml, /<h1[^>]*id="home-title"[^>]*>.*кулинарная студия,.*<em>.*гастрономическое.*путешествие.*<\/em><\/h1>/);
  assert.match(homeHtml, /rel="canonical" href="https:\/\/tibon\.example\/"/);
  assert.match(homeHtml, /property="og:image" content="https:\/\/tibon\.example\/images\/studio\/renat\.jpg"/);
  assert.match(homeHtml, /class="lead-form callback-form"/);
  assert.match(homeHtml, /<input[^>]*id="callback-phone"[^>]*value="\+7"/);
  assert.match(homeHtml, /Перезвоните мне/);
  assert.doesNotMatch(homeHtml, /name="format"|id="gallery|href="[^"]*#gallery/);

  const servicePages = {
    "/dlya-vzroslyh/": /от 3\s300\s₽ за человека/,
    "/dlya-vzroslyh/korporativ/": /от 3\s300\s₽ за человека/,
    "/dlya-vzroslyh/den-rozhdeniya/": /от 3\s300\s₽ за человека/,
    "/dlya-vzroslyh/romanticheskiy-uzhin/": /от 18\s000\s₽/,
    "/dlya-detey/": /от 2\s200\s₽ за ребёнка/,
    "/arenda/": /<dd><strong>3\s000\s₽<\/strong> <span>в час<\/span><\/dd>.*<dd><strong>6\s000\s₽<\/strong> <span>в час<\/span><\/dd>/,
    "/menu/": /Скачать взрослое меню/,
    "/dop-uslugi/": /от 10\s000\s₽ в час/,
  };
  const publicPaths = [
    ...Object.keys(servicePages),
    "/o-studii/",
    "/contact/",
    "/kontakty/",
    "/zayavka/",
    "/politika-konfidencialnosti/",
  ];
  const informationPages = {
    "/contact/": ["/contact/", /Карта проезда/],
    "/kontakty/": ["/contact/", /Карта проезда/],
  };
  for (const path of publicPaths) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    assert.equal(response.status, 200, `${path} should return HTTP 200`);
    assert.match(html, /<title>.+ — TIBON<\/title>/, `${path} should return route metadata`);
    assert.match(html, /name="description" content="[^"]+"/, `${path} should have a description`);
    if (servicePages[path]) {
      assert.match(html, servicePages[path], `${path} should render its content in SSR`);
      assert.ok(html.includes(`rel="canonical" href="https://tibon.example${path}"`));
      assert.doesNotMatch(html, /name="robots" content="noindex/);
      assert.doesNotMatch(html, /Структурная заготовка/);
      if (path === "/menu/") {
        assert.match(html, /id="menu-download"/);
        assert.match(html, /<fieldset class="lead-fields" disabled=""/);
        assert.match(html, /<button[^>]*type="submit"[^>]*>Скачать взрослое меню/);
      } else {
        assert.match(html, /href="\/zayavka\/"[^>]*>Оставить заявку/, `${path} should render its page CTA`);
      }
    } else if (informationPages[path]) {
      const [canonical, content] = informationPages[path];
      assert.match(html, content);
      assert.ok(html.includes(`rel="canonical" href="https://tibon.example${canonical}"`));
      assert.doesNotMatch(html, /name="robots" content="noindex/);
    } else if (path === "/zayavka/") {
      assert.match(html, /name="robots" content="noindex, follow"/);
      assert.match(html, /<fieldset[^>]*disabled/);
      assert.match(html, /Отправить заявку/);
      assert.match(html, /<fieldset class="lead-fields" disabled=""/);
    } else if (path === "/politika-konfidencialnosti/") {
      assert.match(html, /name="robots" content="noindex, nofollow"/);
      assert.match(html, /Проект для согласования/);
      assert.match(html, /11\. Изменение политики/);
    } else if (path === "/o-studii/") {
      assert.match(html, /name="robots" content="noindex, nofollow"/);
      assert.doesNotMatch(html, /rel="canonical"/);
    }
    assert.match(html, /href="tel:\+73412576990">57-69-90<\/a>/);
    assert.match(html, /TIBON — главная/, `${path} should SSR the header`);
    assert.match(html, /Навигация в подвале/, `${path} should SSR the footer`);
    assert.match(html, /ОГРНИП: (?:<!-- -->)?325180000086978/);
    assert.doesNotMatch(html, /href="\/galereya/);
    if (["/dlya-vzroslyh/", "/zayavka/", "/politika-konfidencialnosti/", "/menu/"].includes(path)) {
      assert.doesNotMatch(html, /aria-label="Навигационная цепочка"/);
    } else {
      assert.match(html, /aria-label="Навигационная цепочка"/, `${path} should SSR breadcrumbs`);
      assert.match(html, /<span aria-current="page">/, `${path} should mark the last crumb`);
    }
    if (path.startsWith("/dlya-vzroslyh/") && path !== "/dlya-vzroslyh/") {
      assert.match(html, /<a href="\/dlya-vzroslyh\/"[^>]*>Для взрослых<\/a>/, `${path} should link to its parent`);
    }
  }
  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  assert.equal(robotsResponse.status, 200);
  assert.match(await robotsResponse.text(), /Sitemap: https:\/\/tibon\.example\/sitemap\.xml/);
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemapXml = await sitemapResponse.text();
  assert.doesNotMatch(sitemapXml, /\/(galereya|kontakty|zayavka|o-studii|politika-konfidencialnosti|pravila)\//);
  const kidsMenuResponse = await fetch(`${baseUrl}/menu/?type=kids`);
  const kidsMenuHtml = await kidsMenuResponse.text();
  assert.equal(kidsMenuResponse.status, 200);
  assert.match(kidsMenuHtml, /<button[^>]*class="[^"]*menu-primary-download[^"]*"[^>]*>Скачать детское меню/);
  assert.doesNotMatch(kidsMenuHtml, /menu-options|Стейки, закуски и напитки/);
  assert.match(kidsMenuHtml, /rel="canonical" href="https:\/\/tibon\.example\/menu\/"/);

  for (const path of ["/unknown-m3-route/", "/pravila/", "/galereya/", "/galereya/?category=cooking"]) {
    const missingResponse = await fetch(new URL(path, baseUrl));
    assert.equal(missingResponse.status, 404, path);
    assert.match(await missingResponse.text(), /Страница не найдена/);
  }
  console.log("SSR: home and public route return HTML; unknown route returns 404.");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const hasNoHorizontalOverflow = () => page.evaluate(() =>
      [document.documentElement, document.body].every(element => element.scrollWidth <= element.clientWidth));
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const homeTitle = page.getByRole("heading", { name: /^Ти-Бон.*гастрономическое путешествие,$/, level: 1 });
    await homeTitle.waitFor();
    assert.equal(await page.locator("h1").count(), 1);
    await page.locator(".hero-actions").getByRole("link", { name: "Выбрать программу" }).click();
    await page.waitForURL("**/#directions");
    const directions = page.getByRole("region", { name: "Выберите свой формат" });
    for (const name of ["Для взрослых", "Для детей", "Дни рождения", "Корпоративы", "Аренда студии", "Романтический ужин"]) {
      assert.equal(await directions.getByRole("link", { name: new RegExp(name) }).count(), 1);
    }
    assert.equal(await page.getByRole("link", { name: "Организовать праздник" }).getAttribute("href"), "/zayavka/");
    page.on("console", (message) => {
      if (message.type() === "error") pageErrors.push(message.text());
    });
    const links = await page.locator('main a[href], header a[href], footer a[href]').evaluateAll(
      (anchors) => Array.from(new Set(anchors.map((anchor) => anchor.getAttribute("href")))),
    );
    for (const href of links) {
      if (href.startsWith("#")) {
        assert.equal(await page.locator(href).count(), 1);
      } else if (href.startsWith("tel:")) {
        assert.equal(href, "tel:+73412576990");
      } else {
        assert.equal((await fetch(new URL(href, baseUrl))).status, 200, href);
      }
    }
    for (const width of [320, 390, 480, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const picture of await page.locator("main img").all()) {
        await picture.scrollIntoViewIfNeeded();
        await picture.evaluate((element) => element.decode());
        assert(await picture.getAttribute("alt"));
      }
      assert.equal(await hasNoHorizontalOverflow(), true, `Overflow at ${width}px`);
    }
    assert.equal(await page.locator("#gallery, #gallery-photos, a[href*='#gallery']").count(), 0);
    assert.equal(await page.getByRole("button", { name: /^Открыть фото:/ }).count(), 0);
    await page.locator(".final-cta").getByRole("link", { name: "Забронировать" }).click();
    await page.getByRole("button", { name: "Отправить заявку" }).waitFor();
    await page.getByRole("link", { name: "Вернуться на главную" }).click();
    await homeTitle.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await hasNoHorizontalOverflow(), true);

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
    const navigationLabels = ["Для взрослых", "Для детей", "Аренда студии", "Меню", "Доп. услуги", "Контакты"];
    const labels = nav => nav.getByRole("link").evaluateAll(links => links.map(link => link.firstChild.textContent.trim()));
    assert.deepEqual(await labels(menu.getByRole("navigation")), navigationLabels);
    await page.keyboard.press("Escape");
    await menu.waitFor({ state: "hidden" });
    assert.equal(await page.locator("#mobile-menu-trigger").evaluate(button => button === document.activeElement), true);
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await menu.getByRole("link", { name: "Для взрослых" }).click();
    await page.getByRole("heading", { level: 1, name: "Кулинарные мастер-классы для взрослых" }).waitFor();
    await menu.waitFor({ state: "hidden" });
    assert.equal(new URL(page.url()).pathname, "/dlya-vzroslyh/");

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktopNav = page.getByRole("navigation", { name: "Основная навигация", exact: true });
    assert.deepEqual(await labels(desktopNav), navigationLabels);
    assert.equal(await desktopNav.locator("details").count(), 0);
    const adultLink = desktopNav.getByRole("link", { name: "Для взрослых" });
    assert.equal(await adultLink.getAttribute("aria-current"), "page");
    await adultLink.focus();
    await page.keyboard.press("Tab");
    assert.equal(await desktopNav.getByRole("link", { name: "Для детей" }).evaluate(link => link === document.activeElement), true);
    const adultFormats = page.getByRole("navigation", { name: "Форматы для взрослых" });
    for (const id of ["birthday", "corporate", "romantic"]) {
      await adultFormats.locator(`a[href="#${id}"]`).click();
      await page.waitForURL(`**/#${id}`);
      assert.equal(await page.locator(`section#${id} a[href="/zayavka/"]`).count(), 1);
    }
    assert.equal(await hasNoHorizontalOverflow(), true);

    await page.goto(`${baseUrl}/dlya-vzroslyh/den-rozhdeniya/`, { waitUntil: "networkidle" });
    assert.equal(await adultLink.getAttribute("aria-current"), "location");
    const breadcrumbs = page.getByRole("navigation", { name: "Навигационная цепочка" });
    assert.equal(await breadcrumbs.locator('[aria-current="page"]').innerText(), "День рождения");
    await breadcrumbs.getByRole("link", { name: "Для взрослых" }).click();
    await page.getByRole("heading", { level: 1, name: "Кулинарные мастер-классы для взрослых" }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/dlya-vzroslyh/");

    for (const path of ["/arenda", "/arenda/"]) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
      assert.equal(await page.locator('.desktop-navigation a[aria-current="page"]').getAttribute("href"), "/arenda/");
    }

    await page.goto(`${baseUrl}/menu/`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("button", { name: "Скачать взрослое меню" }).isDisabled(), true);
    assert.equal(await page.getByRole("button", { name: "Скачать детское меню" }).isDisabled(), true);
    assert.equal(await page.locator('a[href*=".pdf"], #menu-options, .menu-extras').count(), 0);
    await page.goto(`${baseUrl}/menu/?type=kids#menu-download`);
    assert.match(await page.locator(".menu-primary-download").innerText(), /Скачать детское меню/);
    await page.getByRole("link", { name: "Политика обработки персональных данных" }).first().click();
    await page.getByRole("heading", { level: 1, name: "Политика обработки персональных данных" }).waitFor();
    assert.equal(await page.locator(".privacy-document h2").count(), 11);

    assert.deepEqual(pageErrors, []);
    console.log("Chromium: 8 widths, images, links, request CTA, gallery removal, fonts, mobile navigation, breadcrumbs and console pass.");
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
