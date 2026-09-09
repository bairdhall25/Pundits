import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('.agent-artifacts/growth-qa', { recursive: true });
const browser = await chromium.launch({ headless: true });
const paths = ['/picks/clemson-at-lsu-2026/saban/', '/picks/49ers-vs-rams-2026/brandt/', '/picks/patriots-at-seahawks-2026/', '/pundits/saban/', '/teams/lsu/', '/nfl/', '/ncaaf/2026/week-1/', '/methodology/'];
const results = [];
for (const width of [320, 390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  // Do not send QA traffic to production analytics or third parties.
  await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:8765') ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of paths) {
    errors.length = 0;
    const response = await page.goto(`http://127.0.0.1:8765${path}`, { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => {
      const text = document.querySelector('main')?.innerText ?? '';
      const json = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent));
      const article = json.flat().find(x => x['@type'] === 'NewsArticle');
      const faq = json.flat().find(x => x['@type'] === 'FAQPage');
      return { title: document.title, h1: document.querySelector('h1')?.innerText,
        main: Boolean(text), overflow: document.documentElement.scrollWidth > innerWidth + 1,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        reported: text.toLowerCase().includes('reported selection'), operationalRationale: text.includes('helmet props'),
        articleParagraphsVisible: article ? article.articleBody.split(/(?<=\.) /).every(s => text.replace(/\s+/g,' ').includes(s.replace(/\s+/g,' '))) : null,
        faqVisible: faq ? faq.mainEntity.every(q => text.replace(/\s+/g,' ').includes(q.acceptedAnswer.text.replace(/\s+/g,' '))) : null };
    });
    results.push({ path, width, status: response.status(), ...result, errors: [...errors] });
    if (path.includes('/saban/') || path === '/nfl/') await page.screenshot({ path: `.agent-artifacts/growth-qa/${path.replaceAll('/','_')}-${width}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
writeFileSync('.agent-artifacts/growth-qa/browser-results.json', JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
