import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("leaderboard tabs support keyboard navigation", async ({ page }) => {
  await page.goto("/leaderboard/");

  const resultsTab = page.getByRole("tab", { name: "2026 results" });
  const openTab = page.getByRole("tab", { name: "Open picks" });
  await expect(resultsTab).toHaveAttribute("aria-selected", "true");

  await resultsTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(openTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(openTab).toHaveAttribute("aria-selected", "true");

  for (const tab of [resultsTab, openTab]) {
    const height = await tab.evaluate((element) => element.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByRole("button", { name: /^Show all \d+ pundits$/ })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).include(".leaderboard-tabs").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("book filters use a mobile drawer and desktop inline controls", async ({ page }, testInfo) => {
  await page.goto("/book/");

  if (testInfo.project.name.startsWith("mobile")) {
    await expect(page.locator(".book-filters")).toHaveCSS("position", "sticky");
    const trigger = page.getByRole("button", { name: /^Filter & sort/ });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Filter & sort" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Sport")).toBeVisible();
    const close = dialog.getByRole("button", { name: "Close filters" });
    await expect(close).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Show \d+ takes?/ })).toBeVisible();

    const accessibility = await new AxeBuilder({ page }).include("[role=dialog]").analyze();
    expect(accessibility.violations).toEqual([]);
    await close.click();
    await expect(dialog).toBeHidden();
  } else {
    await expect(page.locator(".book-filter-desktop")).toBeVisible();
    await expect(page.locator(".book-filter-mobile")).toBeHidden();
    await expect(page.locator(".book-filters")).toHaveCSS("position", "static");
  }
});

test("mobile home explains the product before the marquee", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));
  await page.goto("/");

  const copyTop = await page.locator(".hero-copy").evaluate((element) =>
    element.getBoundingClientRect().top
  );
  const cardTop = await page.locator(".hero-card").evaluate((element) =>
    element.getBoundingClientRect().top
  );
  expect(copyTop).toBeLessThan(cardTop);
});

test("mobile home shortens the marquee and stacks the slate action", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));
  await page.goto("/");

  const disclosure = page.locator(".hero-card .mobile-face-overflow");
  const overflowFaces = disclosure.locator(".mobile-face-overflow-list");
  await expect(disclosure).toBeVisible();
  expect(await disclosure.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
    false
  );
  await expect(overflowFaces).toBeHidden();
  const accessibility = await new AxeBuilder({ page })
    .include(".mobile-face-overflow > summary")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await disclosure.locator("summary").click();
  await expect(overflowFaces).toBeVisible();

  await expect(page.locator("#ncaaf .row-head")).toHaveCSS("flex-direction", "column");
  const slateActionHeight = await page
    .locator("#ncaaf .row-head .see")
    .evaluate((element) => element.getBoundingClientRect().height);
  expect(slateActionHeight).toBeGreaterThanOrEqual(44);
});

test("mobile slate and archive links meet the minimum touch target", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));

  await page.goto("/ncaaf/");
  const slateTargets = page.locator(
    ".compact-event-title a, .compact-event-links a, .event-title-link, .see-why"
  );
  const slateHeights = await slateTargets.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().height)
  );
  expect(slateHeights.length).toBeGreaterThan(0);
  expect(slateHeights.every((height) => height >= 44)).toBe(true);

  await page.goto("/ncaaf/2026/week-0/");
  const resultHeights = await page
    .locator(".week-result-link")
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height)
    );
  expect(resultHeights.length).toBeGreaterThan(0);
  expect(resultHeights.every((height) => height >= 44)).toBe(true);
});

test("how it works uses an accessible disclosure", async ({ page }) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "How it works" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/public comments from named experts/)).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).include(".how").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("market details disclose frozen-price context", async ({ page }) => {
  await page.goto("/picks/clemson-at-lsu-2026/");

  const trigger = page.getByRole("button", { name: "Market details" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/Frozen at 24¢ \/ 78¢/)).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).include(".market-details").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("mobile receipt actions meet the minimum touch target", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));
  await page.goto("/picks/clemson-at-lsu-2026/");

  const heights = await page
    .locator(".freeze-src, .src-actions a, .market-details-trigger")
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
  expect(heights.length).toBeGreaterThan(0);
  expect(heights.every((height) => height >= 44)).toBe(true);
});

test("pilot routes do not overflow their viewport", async ({ page }) => {
  for (const path of ["/", "/leaderboard/", "/book/", "/picks/clemson-at-lsu-2026/"]) {
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflows, path + " should fit the viewport").toBe(false);
  }
});

test("global navigation distinguishes active sections from the exact current page", async ({
  page,
}) => {
  await page.goto("/ncaaf/");

  const picks = page.getByRole("link", { name: "Picks — browse by game" });
  await expect(picks).toHaveClass(/on/);
  await expect(picks).not.toHaveAttribute("aria-current", "page");

  const more = page.getByRole("button", { name: "More site navigation" });
  await more.click();
  await expect(page.getByRole("menuitem", { name: "College Football" })).toHaveAttribute(
    "aria-current",
    "page"
  );

  await page.goto("/stories/");
  await expect(page.getByRole("link", { name: "Takes — quote feed" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("More navigation supports keyboard use and returns focus", async ({ page }) => {
  await page.goto("/");

  const more = page.getByRole("button", { name: "More site navigation" });
  await more.focus();
  await page.keyboard.press("Enter");

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "College Football" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();

  await more.click();
  const accessibility = await new AxeBuilder({ page })
    .include("header")
    .include("[role=menu]")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("header and footer expose the complete site navigation", async ({ page }, testInfo) => {
  await page.goto("/");

  const footer = page.locator("footer");
  for (const label of [
    "Picks",
    "College Football",
    "NFL",
    "Takes",
    "Compact ledger",
    "Pundits",
    "Submit a source",
    "About Pundits",
    "Methodology",
    "Contact",
    "Privacy",
    "Terms",
  ]) {
    await expect(footer.getByRole("link", { name: label, exact: true })).toBeVisible();
  }

  if (testInfo.project.name.startsWith("mobile")) {
    const headerHeights = await page
      .locator(".site-nav > a, .site-nav-more")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
    expect(headerHeights.every((height) => height >= 44)).toBe(true);

    const footerHeights = await footer
      .locator(".site-footer-nav a")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
    expect(footerHeights.every((height) => height >= 44)).toBe(true);
  }

  const accessibility = await new AxeBuilder({ page }).include("footer").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("open global navigation does not overflow the viewport", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "More site navigation" }).click();

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflows).toBe(false);
});
