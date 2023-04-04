import fs from 'fs';
import open from 'open';
import puppeteer from 'puppeteer';
import {startTimespan} from 'lighthouse';
import assert from 'assert';

const browser = await puppeteer.launch({
  headless: false,
  executablePath: process.env.CHROME_PATH,
  args: ['--enable-experimental-web-platform-features'],
});
const page = await browser.newPage();

/** @type {import('lighthouse').Config} */
const config = {
  extends: 'lighthouse:default',
  plugins: ['lighthouse-plugin-soft-navigation'],
  
  settings: {
    output: 'html',
  },
}

await page.goto('https://next-movies-zeta.vercel.app/?category=Popular&page=1');
await page.waitForTimeout(2000);

const timespan = await startTimespan(page, {config});

await page.click('.hamburger-button');
await page.waitForSelector('a[href="/?category=Popular&page=1"]');
await page.click('a[href="/?category=Top+Rated&page=1"]');
await page.waitForTimeout(2000);

const result = await timespan.endTimespan();
if (!result) throw new Error('No result')

if (process.argv.includes('--trace')) {
  fs.writeFileSync('timespan.trace.json', JSON.stringify(result.artifacts.Trace, null, 2));
}

if (process.argv.includes('--view')) {
  // @ts-expect-error
  fs.writeFileSync('timespan.report.html', result.report);
  open('timespan.report.html');
}

const softNavCategory = result.lhr.categories['lighthouse-plugin-soft-navigation'];
softNavCategory.score = null;

assert.deepStrictEqual(softNavCategory, {
  id: 'lighthouse-plugin-soft-navigation',
  title: 'Soft Navigation',
  description: undefined,
  manualDescription: undefined,
  supportedModes: ['timespan'],
  score: null,
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

const softNavFcpAudit = result.lhr.audits['soft-nav-fcp'];
assert.ok(softNavFcpAudit);
assert.strictEqual(softNavFcpAudit.score, 1);
assert.ok(softNavFcpAudit.numericValue);
assert.ok(softNavFcpAudit.numericValue < 1500);

const softNavLcpAudit = result.lhr.audits['soft-nav-lcp'];
assert.ok(softNavLcpAudit);
assert.ok(softNavLcpAudit.score && softNavLcpAudit.score > 0.95);
assert.ok(softNavLcpAudit.numericValue);
assert.ok(softNavLcpAudit.numericValue < 2000);

await browser.close();
