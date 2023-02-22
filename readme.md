# Lighthouse Soft Navigation Plugin

This is a plugin for [Lighthouse](https://github.com/GoogleChrome/lighthouse) that measures metrics such as FCP and LCP in a soft navigation.

![image](https://user-images.githubusercontent.com/6752989/220523511-9ec52d43-d0da-4765-96f7-0ed8a8edfa07.png)

## Soft Navigations

A soft navigation is a same-document navigation triggered by user interaction that updates the page URL using something like the history API and mutates the DOM. You can read more about the definition of a soft navigation over in [WICG/softnavigations](https://github.com/WICG/soft-navigations).

## Requirements

> **Warning**
> These features are necessary for this plugin to work but they are experimental and therefore subject to change without warning. I will try to keep the plugin and requirements up to date as things change.

- Use the latest [Chrome Canary](https://www.google.com/chrome/canary/).
- Launch Chrome with `--enable-experimental-web-platform-features` to enable soft navigation measurement.
- Add `additionalTraceCategories: 'scheduler'` to the Lighthouse config settings to collect the soft navigation trace events.

## Installation

Install with npm or yarn. Make sure Lighthouse and Puppeteer are installed as well.

```sh
npm install lighthouse puppeteer lighthouse-plugin-soft-navigation
```

```sh
yarn add lighthouse puppeteer lighthouse-plugin-soft-navigation
```

## Usage

Include this plugin in your Lighthouse config so Lighthouse [timespan](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md#timespan) mode can audit interactions that trigger a soft navigation.

```js
import fs from 'fs';
import puppeteer from 'puppeteer';
import {startFlow} from 'lighthouse';

const browser = await puppeteer.launch({
  headless: false,
  args: ['--enable-experimental-web-platform-features'],
  // Make sure you are using the latest Chrome Canary.
  executablePath: '/path/to/chrome'
});
const page = await browser.newPage();

const config = {
  extends: 'lighthouse:default',
  plugins: ['lighthouse-plugin-soft-navigation'],
  
  settings: {
    additionalTraceCategories: 'scheduler',
  },
}

const flow = await startFlow(page, {config});

// This will trigger a hard navigation.
// This step will be like any normal navigation in the report.
await flow.navigate('https://example.com');

// Clicking `a.link` will trigger a soft navigation.
// This step will include soft navigation metrics from the plugin in the report.
await flow.startTimespan();
await page.click('a.link');
await flow.endTimespan();

const report = await flow.generateReport();
fs.saveFileSync('report.html', report);
```
