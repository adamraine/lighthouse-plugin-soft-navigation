import fs from 'fs';
import open from 'open';
import puppeteer from 'puppeteer';
import {startTimespan} from 'lighthouse';
import config from '../../config.js';
import assert from 'assert';

const browser = await puppeteer.launch({
  headless: false,
  args: ['--enable-experimental-web-platform-features'],
});
const page = await browser.newPage();

await page.goto('https://next-movies-zeta.vercel.app/?category=Popular&page=1');
await page.waitForTimeout(2000);

const timespan = await startTimespan(page, {
  config,
  flags: {output: 'html'}
});

await page.click('.hamburger-button');
await page.waitForSelector('a[href="/?category=Popular&page=1"]');
await page.click('a[href="/?category=Top+Rated&page=1"]');
await page.waitForTimeout(2000);

const result = await timespan.endTimespan();
if (!result) throw new Error('No result')

const spaCategory = result.lhr.categories['lighthouse-plugin-spa'];
assert.deepStrictEqual(spaCategory, {
  id: 'lighthouse-plugin-spa',
  title: 'SPA',
  description: undefined,
  manualDescription: undefined,
  supportedModes: ['timespan'],
  score: 1,
  auditRefs: [
    {
      id: 'spa-nav-fcp',
      weight: 1,
      group: 'lighthouse-plugin-spa-metrics'
    },
    {
      id: 'spa-nav-lcp',
      weight: 1,
      group: 'lighthouse-plugin-spa-metrics'
    }
  ],
});

const spaLcpAudit = result.lhr.audits['spa-nav-lcp'];
assert.ok(spaLcpAudit);
assert.strictEqual(spaLcpAudit.score, 1);
assert.ok(spaLcpAudit.numericValue);
assert.ok(spaLcpAudit.numericValue < 1500);

if (process.argv.includes('--view')) {
  // @ts-expect-error
  fs.writeFileSync('timespan.report.html', result.report);
  open('timespan.report.html');
}

await browser.close();
