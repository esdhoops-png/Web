// Usage: node build.js && node render.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const jobs = [
    { html: 'mockup.html', png: 'mockup.png', w: 2000, h: 2000, omit: false },
    { html: 'print-back.html', png: 'print-back.png', w: 3000, h: 3600, omit: true },
  ];
  for (const j of jobs) {
    const ctx = await browser.newContext({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('requestfailed', r => console.log('FAILED', r.url()));
    await page.goto('file://' + path.join(__dirname, j.html));
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
    console.log(j.html, 'fonts:', [...new Set(fonts)].join(', '));
    await page.screenshot({ path: path.join(__dirname, j.png), omitBackground: j.omit, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    await ctx.close();
  }
  await browser.close();
})();
