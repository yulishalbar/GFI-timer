import { expect, test } from "@playwright/test";

interface ManifestIcon {
  purpose?: string;
  sizes?: string;
  src?: string;
  type?: string;
}

interface WebAppManifest {
  display?: string;
  icons?: ManifestIcon[];
  name?: string;
  start_url?: string;
}

test("publishes an installable manifest with standard and maskable icons", async ({ page }) => {
  await page.goto("./");

  const manifest = await page.evaluate(async () => {
    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      throw new Error("Manifest link was not found");
    }
    const response = await fetch(manifestLink.href);
    return (await response.json()) as WebAppManifest;
  });

  expect(manifest.name).toBe("GFI Timer");
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("./");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "icons/icon-192.png", sizes: "192x192", type: "image/png" }),
      expect.objectContaining({ src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }),
      expect.objectContaining({
        src: "icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      })
    ])
  );

  const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(appleTouchIcon).toHaveAttribute("sizes", "180x180");
  await expect(appleTouchIcon).toHaveAttribute("href", /\/GFI-timer\/icons\/apple-touch-icon\.png$/);
});

test("reloads the cached app and its exercise guides while offline", async ({ context, page }) => {
  await page.goto("./");
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are unavailable");
    }
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await expect(page.getByText("Offline ready", { exact: true })).toBeVisible();

  try {
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeVisible();

    const july31Card = page.getByRole("article").filter({ hasText: "Mat Pilates — July 31" });
    await july31Card.getByRole("button", { name: "View class" }).click();
    await page.getByRole("button", { name: "Expand all pose details" }).click();
    // Guides are solved from pose data in the app bundle rather than fetched,
    // so offline is now a question of the bundle being cached, not the images.
    const guide = page.getByLabel("Motion guide for Knee pulls alternating legs");
    await expect(guide).toBeVisible();
    await expect
      .poll(() => guide.evaluate((element) => element.querySelectorAll("path").length))
      .toBeGreaterThan(0);
  } finally {
    await context.setOffline(false);
  }
});
