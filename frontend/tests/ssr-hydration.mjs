import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";
import { JSDOM } from "jsdom";

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
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), PUBLIC_SITE_ORIGIN: "https://tibon.example" },
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
  assert.match(homeHtml, /<title>Кулинарная студия в Ижевске — TIBON<\/title>/);
  assert.match(homeHtml, /TIBON — главная/);
  assert.match(homeHtml, /Навигация в подвале/);
  assert.match(homeHtml, /type="module"/);
  assert.match(homeHtml, /<h1[^>]*id="home-title"[^>]*>.*кулинарная студия,.*<em>.*гастрономическое.*путешествие.*<\/em><\/h1>/);
  assert.match(homeHtml, /rel="canonical" href="https:\/\/tibon\.example\/"/);
  assert.match(homeHtml, /property="og:image" content="https:\/\/tibon\.example\/images\/og\/home\.jpg"/);
  assert.match(homeHtml, /rel="icon" href="\/favicon\.png" type="image\/png" sizes="64x64"/);
  assert.match(homeHtml, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
  for (const path of ["/favicon.png", "/favicon.ico", "/apple-touch-icon.png"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /^image\//, path);
  }
  assert.match(homeHtml, /class="lead-form callback-form"/);
  assert.match(homeHtml, /<input[^>]*id="callback-phone"[^>]*value="\+7"/);
  assert.match(homeHtml, /Перезвоните мне/);
  assert.doesNotMatch(homeHtml, /name="format"|id="gallery|href="[^"]*#gallery/);

  const serviceFormats = {
    "/dlya-vzroslyh/": "adults",
    "/dlya-vzroslyh/korporativ/": "corporate",
    "/dlya-vzroslyh/den-rozhdeniya/": "birthday",
    "/dlya-vzroslyh/romanticheskiy-uzhin/": "romantic",
    "/dlya-detey/": "kids",
    "/arenda/": "rental",
    "/dop-uslugi/": "extras",
  };
  const headings = {
    "/dlya-vzroslyh/": "Кулинарные мастер-классы для взрослых",
    "/dlya-vzroslyh/korporativ/": "Кулинарный корпоратив",
    "/dlya-vzroslyh/den-rozhdeniya/": "День рождения за общим столом",
    "/dlya-vzroslyh/romanticheskiy-uzhin/": "Романтический ужин для двоих",
    "/dlya-detey/": "Детские кулинарные мастер-классы",
    "/arenda/": "Аренда кулинарной студии",
    "/dop-uslugi/": "Дополнительные услуги для праздника",
    "/contact/": "Как добраться",
    "/menu/": "Ознакомьтесь с нашим меню",
  };
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
    "/zayavka/",
    "/politika-konfidencialnosti/",
  ];
  const homeDocument = JSDOM.fragment(homeHtml);
  assert.ok(homeDocument.querySelector('#about-studio a[href="/contact/"]'));
  const titles = new Set([homeDocument.querySelector("title")?.textContent]);
  const descriptions = new Set([homeDocument.querySelector('meta[name="description"]')?.content]);
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
        assert.match(html, new RegExp(`href="/zayavka/\\?format=${serviceFormats[path]}"[^>]*>Оставить заявку`), path);
      }
    } else if (path === "/contact/") {
      assert.match(html, /Карта проезда/);
      assert.ok(html.includes('rel="canonical" href="https://tibon.example/contact/"'));
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
      assert.doesNotMatch(html, /Структурная заготовка/);
    }
    const document = JSDOM.fragment(html);
    if (headings[path]) {
      assert.equal(document.querySelectorAll("h1").length, 1, path);
      assert.equal(document.querySelector("h1").textContent.trim().replace(/\s+/g, " "), headings[path], path);
      const title = document.querySelector("title").textContent;
      const description = document.querySelector('meta[name="description"]').content;
      assert(!titles.has(title), path);
      assert(!descriptions.has(description), path);
      titles.add(title);
      descriptions.add(description);
      if (path === "/contact/" || ["adults", "corporate", "romantic", "kids", "rental"].includes(serviceFormats[path])) {
        assert.match(title, /в Ижевске/, path);
      }
    }
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (path === "/contact/") {
      assert.equal(structuredData.length, 1);
      assert.deepEqual(JSON.parse(structuredData[0].textContent), {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://tibon.example/#localbusiness",
        url: "https://tibon.example/",
        name: "TIBON",
        description: "Кулинарная студия. Ежедневно 10:00–23:00, по записи.",
        telephone: "+73412576990",
        address: {
          "@type": "PostalAddress", addressRegion: "Удмуртская Республика", addressLocality: "село Первомайский",
          streetAddress: "ул. Архитектора Сергея Макарова, 2/4, офис 3", addressCountry: "RU",
        },
      });
    } else {
      assert.equal(structuredData.length, 0, path);
    }
    if (path === "/dlya-vzroslyh/") {
      for (const target of Object.keys(serviceFormats).filter(path => path.startsWith("/dlya-vzroslyh/") && path !== "/dlya-vzroslyh/")) {
        assert.ok(document.querySelector(`main .adult-events a[href="${target}"]`), target);
      }
    }
    if (["/menu/", "/dop-uslugi/"].includes(path)) {
      for (const target of ["/dlya-vzroslyh/", "/dlya-detey/"]) {
        assert.ok(document.querySelector(`main a[href="${target}"]`), `${path} → ${target}`);
      }
    }
    const phone = document.querySelector('header a[href="tel:+73412576990"]');
    assert.equal(phone?.textContent.trim(), "57-69-90", `${path} should SSR a callable phone link`);
    if (servicePages[path] || path === "/contact/") {
      const preview = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
      assert.match(preview ?? "", /^https:\/\/tibon\.example\/images\/og\/[a-z]+\.jpg$/, path);
      assert.ok(document.querySelector('meta[property="og:image:alt"]')?.getAttribute("content"), path);
      const response = await fetch(new URL(new URL(preview).pathname, baseUrl));
      assert.equal(response.status, 200, preview);
      assert.match(response.headers.get("content-type"), /^image\/jpeg\b/, preview);
    }
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
  for (const format of [...Object.values(serviceFormats), "menu", ""]) {
    const response = await fetch(`${baseUrl}/zayavka/?format=${format}`);
    assert.equal(response.status, 200, format);
    const document = JSDOM.fragment(await response.text());
    assert.equal(document.querySelector("#lead-format").value, format === "menu" ? "" : format, format);
    assert.equal(document.querySelector('link[rel="canonical"]').href, "https://tibon.example/zayavka/");
  }
  const query = "?type=kids&utm_source=qa&value=a%2Bb&value=two";
  for (const [duplicate, canonical] of [
    ["/contact", "/contact/"], ["/Contact/", "/contact/"], ["/kontakty", "/contact/"], ["/kontakty/", "/contact/"],
    ["/arenda", "/arenda/"], ["/arenda//", "/arenda/"], ["/MENU", "/menu/"],
    ["/Dlya-vzroslyh/Korporativ//", "/dlya-vzroslyh/korporativ/"],
  ]) {
    const response = await fetch(`${baseUrl}${duplicate}${query}`, { redirect: "manual" });
    assert.equal(response.status, 308, duplicate);
    assert.equal(response.headers.get("location"), `${canonical}${query}`, duplicate);
    const target = await fetch(new URL(response.headers.get("location"), baseUrl), { redirect: "manual" });
    assert.equal(target.status, 200, canonical);
    assert.ok((await target.text()).includes(`rel="canonical" href="https://tibon.example${canonical}"`), canonical);
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
    assert.equal(await page.getByRole("combobox", { name: /Формат мероприятия/ }).inputValue(), "");
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
      assert.equal(await page.locator(`section#${id} a[href="/zayavka/?format=${id}"]`).count(), 1);
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

    for (const width of [320, 390, 768, 1440]) {
      const visit = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
      try {
        await visit.goto(`${baseUrl}/menu/`);
        const banner = visit.getByRole("complementary", { name: "Мы используем cookie" });
        const accept = banner.getByRole("button", { name: "Принять" });
        const reject = banner.getByRole("button", { name: "Отклонить" });
        await banner.waitFor();
        for (const choice of [accept, reject]) {
          const box = await choice.boundingBox();
          assert(box?.width >= 44 && box.height >= 44, `Consent target at ${width}px`);
        }
        const form = visit.locator("#menu-download");
        await form.getByLabel(/Имя/).fill("Анна");
        await form.getByLabel(/Телефон/).fill("+7 (912) 345-67-89");
        const checkbox = form.getByRole("checkbox");
        await checkbox.check();
        await checkbox.press("Tab");
        const policy = form.getByRole("link", { name: "Политика обработки персональных данных" });
        assert.equal(await policy.evaluate(link => link === document.activeElement), true, `Policy focus at ${width}px`);
        assert.equal(await policy.evaluate(link => {
          const { x, y, width, height } = link.getBoundingClientRect();
          return link.contains(document.elementFromPoint(x + width / 2, y + height / 2));
        }), true, `Policy is unobscured at ${width}px`);
        assert.equal(await form.getByRole("button", { name: "Скачать взрослое меню" }).isEnabled(), true);

        await reject.press("Enter");
        await banner.waitFor({ state: "hidden" });
        assert.equal(await visit.locator("main").evaluate(main => main === document.activeElement), true);
        await visit.reload();
        const settings = visit.getByRole("button", { name: "Настройки cookie" });
        assert.equal(await settings.getAttribute("aria-expanded"), "false");
        await settings.press("Enter");
        const heading = banner.getByRole("heading");
        assert.equal(await heading.evaluate(element => element === document.activeElement), true);
        await heading.press("Escape");
        await banner.waitFor({ state: "hidden" });
        assert.equal(await settings.evaluate(button => button === document.activeElement), true);
        await settings.press("Enter");
        await accept.press("Enter");
        await banner.waitFor({ state: "hidden" });
        assert.equal(await settings.evaluate(button => button === document.activeElement), true);

        await visit.route("https://yandex.ru/map-widget/**", route => route.fulfill({ body: "Map fixture" }));
        await visit.goto(`${baseUrl}/contact/`);
        await visit.locator("iframe.reference-map").waitFor();
        assert.equal(await banner.count(), 0);
        await settings.press("Enter");
        await reject.press("Enter");
        await visit.locator(".reference-map-placeholder").waitFor();
        assert.equal(await visit.getByRole("link", { name: /Открыть в Яндекс Картах/ }).count(), 1);
      } finally {
        await visit.close();
      }
    }
    console.log("Chromium: first-visit form and focus, consent persistence, settings and map gating at 320/390/768/1440px pass.");

    const conversion = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    try {
      const selected = conversion.getByRole("combobox", { name: /Формат мероприятия/ });
      for (const [path, format] of Object.entries(serviceFormats)) {
        await conversion.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
        await conversion.locator(`main .hero a[href="/zayavka/?format=${format}"]`).click();
        await conversion.waitForURL(`**/zayavka/?format=${format}`);
        assert.equal(await selected.inputValue(), format, path);
      }
      const submissions = [];
      const recordId = "c26b7e32-1687-49a9-8c8d-1c2322215959";
      await conversion.route("**/api/v1/leads", async route => {
        submissions.push({ body: route.request().postDataJSON(), key: route.request().headers()["idempotency-key"] });
        const isUnavailable = submissions.length === 2;
        await route.fulfill({ status: isUnavailable ? 503 : 201, json: isUnavailable ? {} : { id: recordId } });
      });
      await selected.selectOption("rental");
      await conversion.getByLabel(/Имя/).fill("Анна");
      await conversion.getByLabel(/Телефон/).fill("+7 (912) 345-67-89");
      await conversion.getByRole("checkbox").check();
      await conversion.getByRole("button", { name: "Отправить заявку" }).click();
      await conversion.getByText(/Заявка отправлена/).waitFor();
      assert.equal(submissions[0]?.body.format, "rental");

      await conversion.goto(`${baseUrl}/menu/`, { waitUntil: "networkidle" });
      await conversion.getByRole("link", { name: "детского праздника", exact: true }).click();
      await conversion.waitForURL("**/dlya-detey/");
      await conversion.getByRole("link", { name: "Детское меню", exact: true }).click();
      await conversion.waitForURL("**/menu/?type=kids#menu-download");
      const form = conversion.locator("#menu-download");
      const phone = form.getByLabel(/Телефон/);
      const checkbox = form.getByRole("checkbox");
      const downloadButton = form.getByRole("button", { name: "Скачать детское меню" });
      await form.getByLabel(/Имя/).fill("Анна");
      await phone.fill("+7 (912) 345-67-8");
      await phone.press("Tab");
      await form.getByText("Введите 10 цифр после +7.").waitFor();
      assert.equal(await phone.getAttribute("aria-invalid"), "true");
      assert.equal(await downloadButton.isDisabled(), true);
      await phone.fill("+7 (912) 345-67-89");
      await form.getByText("Чтобы скачать меню, отметьте согласие на обработку данных.").waitFor();
      assert.equal(await downloadButton.isDisabled(), true);
      assert.equal(submissions.length, 1);
      await checkbox.check();
      await downloadButton.click();
      await form.getByRole("alert").filter({ hasText: "Сервис скачивания временно недоступен" }).waitFor();
      assert.equal(await phone.inputValue(), "+7 (912) 345-67-89");
      assert.equal(await checkbox.isChecked(), true);
      await conversion.route(`**/api/v1/leads/${recordId}/menu`, route => route.fulfill({
        status: 200, contentType: "application/pdf", body: "%PDF-1.4\n%%EOF\n",
      }));
      const downloadPromise = conversion.waitForEvent("download");
      await downloadButton.click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), "tibon-menu-kids.pdf");
      assert.equal(submissions[2]?.body.source, "menu_kids");
      assert.equal(submissions[1]?.key, submissions[2]?.key);
    } finally {
      await conversion.close();
    }
    console.log("Chromium: seven service CTAs, editable preselection, linked navigation, menu validation and mocked download retry pass.");
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
