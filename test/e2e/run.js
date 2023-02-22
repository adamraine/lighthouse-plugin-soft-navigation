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

const softNavCategory = result.lhr.categories['lighthouse-plugin-soft-navigation'];
assert.deepStrictEqual(softNavCategory, {
  id: 'lighthouse-plugin-soft-navigation',
  title: 'Soft Navigation',
  description: undefined,
  manualDescription: undefined,
  supportedModes: ['timespan'],
  score: 1,
  auditRefs: [
    {
      id: 'soft-nav-fcp',
      weight: 1,
      group: 'lighthouse-plugin-soft-navigation-metrics'
    },
    {
      id: 'soft-nav-lcp',
      weight: 1,
      group: 'lighthouse-plugin-soft-navigation-metrics'
    }
  ],
});

const softNavLcpAudit = result.lhr.audits['soft-nav-lcp'];
assert.ok(softNavLcpAudit);
assert.strictEqual(softNavLcpAudit.score, 1);
assert.ok(softNavLcpAudit.numericValue);
assert.ok(softNavLcpAudit.numericValue < 1500);

if (process.argv.includes('--view')) {
  // @ts-expect-error
  fs.writeFileSync('timespan.report.html', result.report);
  open('timespan.report.html');
}

await browser.close();
