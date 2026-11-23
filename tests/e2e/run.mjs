import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const origin = "http://127.0.0.1:4173";
const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  stdio: "ignore",
  shell: process.platform === "win32",
});

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
const failures = [];

try {
  await waitForServer();
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  desktop.on("pageerror", (error) => failures.push("desktop page error: " + error.message));
  const response = await desktop.goto(origin, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, "homepage should respond with HTTP 200");
  assert.match(await desktop.title(), /Workflo/i, "homepage should have product-specific title");
  assert.equal(await desktop.locator("#solutions").count(), 1, "solutions section should exist");
  assert.equal(await desktop.locator("#early-access").count(), 1, "early-access form should exist");
  assert.equal(await desktop.locator("#contact").count(), 1, "contact form should exist");

  const sceneKeys = await desktop.locator("[data-photo]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-photo"))
  );
  for (const key of ["exterior", "portal", "hall", "path", "sealed"]) {
    assert.ok(sceneKeys.includes(key), "missing cinematic scene: " + key);
  }

  for (const asset of ["pod.webp", "portal.webp", "hall.webp", "path.webp", "hero-chamber.webp"]) {
    const assetResponse = await desktop.request.get(origin + "/media/" + asset);
    assert.equal(assetResponse.status(), 200, "missing image asset: " + asset);
  }

  const gradientState = await desktop.evaluate(() => {
    const targets = [
      document.body,
      document.querySelector(".cinematic-stage .scene-backdrop"),
      document.querySelector(".scene-photo-scrim"),
      document.querySelector(".solution-editorial-art"),
    ];
    return targets.map((node) => node ? getComputedStyle(node).backgroundImage : "missing");
  });
  assert.ok(gradientState.every((value) => value === "none" || value === "missing"), "no-gradient visual rule should be present");

  const scrollStates = [];
  for (const progress of [0.04, 0.28, 0.47, 0.64, 0.86]) {
    await desktop.evaluate((value) => {
      const story = document.querySelector("#story");
      const range = Math.max(1, story.offsetHeight - window.innerHeight);
      window.scrollTo(0, story.offsetTop + range * value);
    }, progress);
    await desktop.waitForTimeout(300);
    const state = await desktop.locator(".cinematic-stage").evaluate((stage) => {
      const keys = ["exterior", "portal", "hall", "path", "sealed"];
      return Object.fromEntries(keys.map((key) => [key, Number.parseFloat(stage.style.getPropertyValue("--photo-" + key)) || 0]));
    });
    const active = Object.entries(state).filter(([, opacity]) => opacity > 0.7).map(([key]) => key);
    assert.equal(active.length, 1, "scroll position should resolve to one dominant scene at " + progress);
    scrollStates.push(active[0]);
  }
  assert.deepEqual(scrollStates, ["exterior", "portal", "hall", "path", "sealed"], "scroll choreography should reveal each scene in sequence");

  await desktop.locator("#early-access").scrollIntoViewIfNeeded();
  assert.equal(await desktop.locator("#early-access form input[type=email]").count(), 1, "early-access email field should render");
  await desktop.locator("#contact").scrollIntoViewIfNeeded();
  assert.equal(await desktop.locator("#contact form textarea").count(), 1, "contact message field should render");
  await desktop.screenshot({ path: "artifacts/workflo-desktop.png", fullPage: true });

  const consentPanel = desktop.getByRole("dialog", { name: /choose what this site may remember/i });
  if (await consentPanel.count()) {
    await desktop.getByRole("button", { name: "Reject optional" }).click();
  }
  await desktop.getByRole("button", { name: "Privacy settings" }).click();
  assert.equal(await consentPanel.count(), 1, "footer privacy settings should reopen the preferences panel");
  await desktop.getByRole("button", { name: "Reject optional" }).click();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (error) => failures.push("mobile page error: " + error.message));
  await mobile.goto(origin, { waitUntil: "networkidle" });
  const mobileConsent = mobile.getByRole("dialog", { name: /choose what this site may remember/i });
  if (await mobileConsent.count()) await mobile.getByRole("button", { name: "Reject optional" }).click();
  await mobile.evaluate(() => window.scrollTo(0, 100));
  await mobile.waitForTimeout(100);
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.locator(".mobile-nav-toggle").click();
  assert.equal(await mobile.getByRole("link", { name: /request early access/i }).count(), 1, "mobile drawer should include early access");
  await mobile.getByRole("link", { name: /request early access/i }).click();
  const mobileMetrics = await mobile.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  assert.ok(mobileMetrics.document <= mobileMetrics.viewport + 1, "mobile layout has horizontal overflow");
  await mobile.screenshot({ path: "artifacts/workflo-mobile.png", fullPage: true });

  const reduced = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  reduced.on("pageerror", (error) => failures.push("reduced-motion page error: " + error.message));
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(origin, { waitUntil: "networkidle" });
  const reducedMotionState = await reduced.evaluate(() => ({
    motion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    nearLayer: getComputedStyle(document.querySelector(".scene-photo-near") ?? document.body).display,
    heroVisible: !!document.querySelector("#main-content h1"),
  }));
  assert.equal(reducedMotionState.motion, true);
  assert.equal(reducedMotionState.nearLayer, "none", "decorative depth layer should be disabled for reduced motion");
  assert.equal(reducedMotionState.heroVisible, true, "content must remain available with reduced motion");
  await reduced.screenshot({ path: "artifacts/workflo-reduced-motion.png", fullPage: false });

  assert.deepEqual(failures, [], "browser must not emit page errors");
  console.log("Workflo browser checks passed: desktop, mobile, five scenes, images, forms, consent, no gradients and reduced motion.");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
