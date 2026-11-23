import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const origin = "http://127.0.0.1:4173";
const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  stdio: "ignore",
  shell: process.platform === "win32",
});
const failures = [];

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await delay(500);
  }
  throw new Error("Vite did not become ready at " + origin);
}

const browser = await chromium.launch({ headless: true });

try {
  await waitForServer();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktop.on("pageerror", (error) => failures.push("desktop page error: " + error.message));

  const response = await desktop.goto(origin, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, "homepage should respond with HTTP 200");
  assert.match(await desktop.title(), /Workflo/i, "homepage should have a product-specific title");
  assert.equal(await desktop.locator("main > section").count(), 5, "homepage should contain five intentional sections");

  for (const section of ["process", "evidence", "security", "access"]) {
    assert.equal(await desktop.locator("#" + section).count(), 1, "missing section: #" + section);
  }

  assert.equal(await desktop.locator("#access form").count(), 1, "one early-access form should exist");
  assert.equal(await desktop.locator("#access form input[type=email]").count(), 1, "early-access email field should render");
  assert.equal(await desktop.locator("#access form textarea").count(), 1, "use-case field should render");
  assert.equal(await desktop.locator("#contact").count(), 0, "duplicate contact section should not return");
  assert.equal(await desktop.locator("#solutions").count(), 0, "superseded solutions section should not return");

  const expectedAssets = [
    "pod.webp",
    "portal.webp",
    "hero-chamber.webp",
    "path.webp",
    "hall.webp",
  ];
  const assetResults = await Promise.all(expectedAssets.map(async (asset) => {
    const assetResponse = await desktop.request.get(origin + "/media/" + asset);
    return { asset, status: assetResponse.status() };
  }));
  for (const result of assetResults) {
    assert.equal(result.status, 200, "missing image asset: " + result.asset);
  }

  await desktop.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = "eager"; });
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
  });

  const imageState = await desktop.evaluate(() => [...document.images].map((image) => ({
    source: image.getAttribute("src"),
    loaded: image.complete && image.naturalWidth > 0,
  })));
  assert.equal(imageState.length, 5, "five purposeful photographs should be present");
  assert.ok(imageState.every((image) => image.loaded), "all five photographs should load");

  const firstVisitConsent = desktop.getByRole("dialog", { name: /privacy preferences/i });
  assert.equal(await firstVisitConsent.count(), 1, "privacy preferences should be shown on first visit");
  await desktop.getByRole("button", { name: "Reject optional" }).click();
  await desktop.reload({ waitUntil: "networkidle" });
  assert.equal(await desktop.getByRole("dialog", { name: /privacy preferences/i }).count(), 0, "saved consent should persist after reload");

  const headlineStyle = await desktop.locator("h1").evaluate((node) => ({
    text: node.textContent.trim(),
    family: getComputedStyle(node).fontFamily,
    size: getComputedStyle(node).fontSize,
  }));
  assert.equal(headlineStyle.text, "Verify every change before it ships.");
  assert.match(headlineStyle.family, /Host Grotesk/i, "the selected display typeface should be applied");

  const noGradientState = await desktop.evaluate(() => {
    const targets = [
      document.body,
      document.querySelector(".hero-photo"),
      document.querySelector(".process-photo"),
      document.querySelector(".evidence-photo"),
      document.querySelector(".security-photo"),
    ];
    return targets.map((node) => node ? getComputedStyle(node).backgroundImage : "missing");
  });
  assert.ok(noGradientState.every((value) => value === "none" || value === "missing"), "backgrounds should not use gradient fills");

  await desktop.locator("#evidence").scrollIntoViewIfNeeded();
  await desktop.waitForFunction(() => document.querySelector("#evidence")?.classList.contains("is-revealed"));
  await desktop.waitForFunction(() => {
    const card = document.querySelector(".receipt-card");
    return card && Number.parseFloat(getComputedStyle(card).opacity) > 0.99;
  }, { timeout: 2500 });
  const receiptOpacity = await desktop.locator(".receipt-card").evaluate((node) => getComputedStyle(node).opacity);
  assert.equal(receiptOpacity, "1", "evidence receipt should finish its reveal when its section enters view");
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await desktop.screenshot({ path: "artifacts/workflo-desktop-hero.png" });
  await desktop.locator("#evidence").scrollIntoViewIfNeeded();
  await desktop.screenshot({ path: "artifacts/workflo-desktop-evidence.png" });
  await desktop.locator("#access").scrollIntoViewIfNeeded();
  await desktop.screenshot({ path: "artifacts/workflo-desktop-access.png" });

  await desktop.getByRole("button", { name: "Privacy settings" }).click();
  assert.equal(await desktop.getByRole("dialog", { name: /privacy preferences/i }).count(), 1, "footer privacy control should reopen the preferences panel");
  await desktop.getByRole("button", { name: "Reject optional" }).click();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (error) => failures.push("mobile page error: " + error.message));
  await mobile.goto(origin, { waitUntil: "networkidle" });
  const mobileConsent = mobile.getByRole("dialog", { name: /privacy preferences/i });
  if (await mobileConsent.count()) await mobile.getByRole("button", { name: "Reject optional" }).click();

  const menuButton = mobile.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  const mobileNavigation = mobile.getByRole("navigation", { name: "Mobile navigation" });
  assert.equal(await mobileNavigation.isVisible(), true, "mobile navigation should open");
  await mobileNavigation.getByRole("link", { name: "Evidence" }).click();
  assert.equal(await mobileNavigation.count(), 0, "mobile navigation should close after selection");
  assert.equal(new URL(mobile.url()).hash, "#evidence", "mobile navigation should reach the selected section");

  const mobileMetrics = await mobile.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  assert.ok(mobileMetrics.document <= mobileMetrics.viewport + 1, "mobile layout has horizontal overflow");
  await mobile.screenshot({ path: "artifacts/workflo-mobile.png", fullPage: true });

  const reduced = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  reduced.on("pageerror", (error) => failures.push("reduced-motion page error: " + error.message));
  await reduced.goto(origin, { waitUntil: "networkidle" });
  const reducedConsent = reduced.getByRole("dialog", { name: /privacy preferences/i });
  if (await reducedConsent.count()) await reduced.getByRole("button", { name: "Reject optional" }).click();

  const reducedMotionState = await reduced.evaluate(() => ({
    enabled: matchMedia("(prefers-reduced-motion: reduce)").matches,
    copyOpacity: getComputedStyle(document.querySelector(".hero-copy")).opacity,
    visualOpacity: getComputedStyle(document.querySelector(".hero-visual")).opacity,
    copyAnimation: getComputedStyle(document.querySelector(".hero-copy")).animationName,
    visualAnimation: getComputedStyle(document.querySelector(".hero-visual")).animationName,
    receiptOpacity: getComputedStyle(document.querySelector(".receipt-card")).opacity,
  }));
  assert.equal(reducedMotionState.enabled, true);
  assert.equal(reducedMotionState.copyOpacity, "1", "hero copy should remain visible with reduced motion");
  assert.equal(reducedMotionState.visualOpacity, "1", "hero photograph should remain visible with reduced motion");
  assert.equal(reducedMotionState.copyAnimation, "none", "hero copy animation should be disabled");
  assert.equal(reducedMotionState.visualAnimation, "none", "hero photograph animation should be disabled");
  assert.equal(reducedMotionState.receiptOpacity, "1", "evidence receipt should remain visible with reduced motion");
  await reduced.screenshot({ path: "artifacts/workflo-reduced-motion.png" });

  assert.deepEqual(failures, [], "browser must not emit page errors");
  console.log("Workflo browser checks passed: five sections, five images, typography, no gradients, early access, consent, mobile navigation and reduced motion.");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
