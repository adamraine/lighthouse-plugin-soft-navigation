# Lighthouse Soft Navigation Plugin

This is a plugin for [Lighthouse](https://github.com/GoogleChrome/lighthouse) that measures metrics such as FCP and LCP in a soft navigation.

A soft navigation is a same-document navigation triggered by user interaction that updates the page URL using something like the history API and mutates the DOM. You can read more about the definition of a soft navigation over in [WICG/softnavigations](https://github.com/WICG/soft-navigations).

![image](https://user-images.githubusercontent.com/6752989/220516999-554165f5-f246-4640-b5f6-78da173a17e1.png)

## Installation

Install with npm or yarn. Make sure Lighthouse and Puppeteer are installed as well.

```sh
npm install lighthouse puppeteer lighthouse-plugin-soft-navigation
```

```sh
yarn add lighthouse puppeteer lighthouse-plugin-soft-navigation
```

## Usage

This plugin can be enabled for Lighthouse timespan mode which can be started in a [user flow](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md).

### Requirements

- Make sure you are using the latest [Chrome Canary](https://www.google.com/chrome/canary/).
- `--enable-experimental-web-platform-features` enables soft navigation measurement in Chrome.
- `additionalTraceCategories: 'scheduler'` tells Lighthouse to pick up the soft navigation trace events.

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

// This timespan includes a soft navigation.
// This step will include soft navigation metrics from the plugin in the report.
await flow.startTimespan();
await page.click('a.link');
await flow.endTimespan();

const report = await flow.generateReport();
fs.saveFileSync('report.html', report);
```
