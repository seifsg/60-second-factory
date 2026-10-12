// waitlist.spec.ts · the money form, tested the way a guest uses it: finger taps and a tablet keyboard 💸
import { expect, test, type Page } from '@playwright/test';

const unique = (): string => `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`;

// last slide → tap the yellow-and-white door → the form is up
async function openJoin(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('.slide.on')).toBeVisible();
  await page.keyboard.press('End');
  await page.locator('.slide.on [data-room=join]').tap();
  await expect(page.locator('#jEmail')).toBeVisible();
}

// a finger tap must focus the field (that is what raises the tablet keyboard), then the keyboard types
async function tapType(page: Page, sel: string, text: string): Promise<void> {
  await page.locator(sel).tap();
  await expect(page.locator(sel)).toBeFocused();
  await page.keyboard.type(text);
}

async function expectPunched(page: Page): Promise<void> {
  await expect(page.locator('#bStamp')).toBeVisible();
  await expect(page.locator('#jDone')).toBeVisible();
}

test('every field takes a tap and typing, the badge fills in live', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', 'ada.lovelace@example.com');
  await expect(page.locator('#bName')).toHaveText('ada lovelace');
  await expect(page.locator('#badge')).toHaveClass(/valid/);
  for (const [sel, text] of [['#jName', 'Ada Lovelace'], ['#jPhone', '+216 20 123 456'], ['#jCo', 'Engine Co']]) {
    await tapType(page, sel, text);
    await expect(page.locator(sel)).toHaveValue(text);
  }
  await expect(page.locator('#bName')).toHaveText('Ada Lovelace');
  await expect(page.locator('#bCo')).toHaveText('Engine Co');
});

test('tapping around the room never rebuilds the form under the finger', async ({ page }) => {
  await openJoin(page);
  const before = await page.locator('#jEmail').elementHandle();
  await page.locator('.jform h3').tap();
  await page.locator('#badge').tap();
  await page.locator('#jEmail').tap();
  expect(await page.evaluate(el => el === document.getElementById('jEmail'), before)).toBe(true);
  await expect(page.locator('#jEmail')).toBeFocused();
});

test('an email alone is enough: badge punched, numbered and sent', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', unique());
  await page.locator('#jGo').tap();
  await expectPunched(page);
  await expect(page.locator('#jNet')).toContainText('Sent');
  await expect(page.locator('#bNo')).toHaveText(/№ \d{4}/);
  await expect(page.locator('#jWelcome')).toContainText('Welcome to the line');
});

test('Enter walks the fields like a paper form and the last one submits', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', unique());
  for (const next of ['#jName', '#jPhone', '#jCo']) {
    await page.keyboard.press('Enter');
    await expect(page.locator(next)).toBeFocused();
  }
  await page.keyboard.type('Walk Co');
  await page.keyboard.press('Enter');
  await expectPunched(page);
});

test('a bad email gets a friendly error and keeps the keyboard on it', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', 'ada@');
  await page.locator('#jGo').tap();
  await expect(page.locator('#jEmailErr')).not.toBeEmpty();
  await expect(page.locator('#jEmail')).toBeFocused();
  await expect(page.locator('#bStamp')).toBeHidden();
});

test('one tap fixes a typo and one tap adds a domain, without dropping the keyboard', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', 'ada@gmial.com');
  await expect(page.locator('#jFix')).toContainText('ada@gmail.com');
  await page.locator('#jFix').tap();
  await expect(page.locator('#jEmail')).toHaveValue('ada@gmail.com');
  await expect(page.locator('#jEmail')).toBeFocused();
  await page.locator('#jEmail').fill('grace');
  await page.locator('.dom[data-domain="outlook.com"]').tap();
  await expect(page.locator('#jEmail')).toHaveValue('grace@outlook.com');
  await expect(page.locator('#jEmail')).toBeFocused();
});

test('the phone is optional, but junk is caught before sending', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', unique());
  await tapType(page, '#jPhone', 'call me');
  await page.locator('#jGo').tap();
  await expect(page.locator('#jPhoneErr')).not.toBeEmpty();
  await expect(page.locator('#jPhone')).toBeFocused();
  await page.locator('#jPhone').fill('+216 20 123 456');
  await page.locator('#jGo').tap();
  await expectPunched(page);
});

test('typing never flips slides, switches language or opens the map', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jName', 'ml f lm ');
  await expect(page.locator('#jForm')).toBeVisible();
  await expect(page.locator('#jName')).toHaveValue('ml f lm ');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.slide.on')).toHaveAttribute('data-id', 'out');
});

test('offline: saved on the device, sent by itself once back online', async ({ page, context }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', unique());
  await context.setOffline(true);
  await page.locator('#jGo').tap();
  await expectPunched(page);
  await expect(page.locator('#jNet')).toContainText('back online');
  await context.setOffline(false);
  await expect(page.locator('#jNet')).toContainText('Sent', { timeout: 30_000 });
  await expect(page.locator('#bNo')).toHaveText(/№ \d{4}/);
});

test.describe('persistence', () => {
  test.use({ serviceWorkers: 'block' }); // the offline worker has its own test; Linux WebKit crashes on reload with it
  test('sign-ups survive a reload and show up in the presenter list', async ({ page, context }) => {
    const email = unique();
    await openJoin(page);
    await tapType(page, '#jEmail', email);
    await page.locator('#jGo').tap();
    await expect(page.locator('#jNet')).toContainText('Sent');
    const again = await context.newPage(); // a brand-new page load on the same device storage
    await again.goto('/#presenter');
    await again.locator('#mapBtn').tap();
    await expect(again.locator('#room table.leads')).toContainText(email);
    expect(await again.evaluate(() => localStorage.getItem('sf60.leads.v1') ?? '')).toContain(email);
  });
});

test('next guest wipes the form and starts the pitch over', async ({ page }) => {
  await openJoin(page);
  await tapType(page, '#jEmail', unique());
  await tapType(page, '#jName', 'Previous Guest');
  await page.locator('#jGo').tap();
  await expectPunched(page);
  await page.locator('#jDone [data-reset]').tap();
  await expect(page.locator('#room')).toBeHidden();
  await expect(page.locator('.slide.on')).toHaveAttribute('data-id', 'clock');
  await page.keyboard.press('End');
  await page.locator('.slide.on [data-room=join]').tap();
  await expect(page.locator('#jEmail')).toHaveValue('');
  await expect(page.locator('#bName')).not.toContainText('Previous');
  await expect(page.locator('#bStamp')).toBeHidden();
});

test('the French form works the same', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lang').tap();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.keyboard.press('End');
  await page.locator('.slide.on [data-room=join]').tap();
  await expect(page.locator('label[for=jEmail]')).toContainText('E-mail');
  await tapType(page, '#jEmail', unique());
  await page.locator('#jGo').tap();
  await expect(page.locator('#jNet')).toContainText('Envoyé');
});

test('the cool stuff room loads every image and stays put when tapped', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('End');
  await page.locator('.slide.on [data-room=show]').tap();
  const imgs = page.locator('#room img');
  await expect(imgs).toHaveCount(8);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await page.locator('#room').evaluate(el => { el.scrollTop = 400; });
  const view = page.viewportSize()!;
  await page.touchscreen.tap(view.width / 2, view.height / 2); // a tap where the finger is, no auto-scroll
  await page.waitForTimeout(300);
  expect(await page.locator('#room').evaluate(el => el.scrollTop)).toBeGreaterThan(300);
});

test('after one visit the deck opens with no network', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'service worker offline check runs on the Chrome engine');
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.slide.on')).toBeVisible();
  await expect(page.locator('.slide.on h2')).toContainText('60');
});
