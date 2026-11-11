// node build.js && node render.js  -> mockup.png (2000x2000) + print-back.png (3000x3600, transparent)
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const shots = [
    { html: 'mockup.html', png: 'mockup.png', w: 2000, h: 2000, omit: false },
    { html: 'print-back.html', png: 'print-back.png', w: 3000, h: 3600, omit: true },
  ];
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(__dirname, s.html));
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(__dirname, s.png), omitBackground: s.omit, clip: { x: 0, y: 0, width: s.w, height: s.h } });
    await ctx.close();
  }
  await browser.close();
  console.log('rendered');
})();
