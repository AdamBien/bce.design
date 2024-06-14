// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const MCR = require('monocart-coverage-reports');


test.describe.configure({ mode: 'serial' });

let page;

test.beforeAll(async () => {
  const browser = await chromium.launch();
  page = await browser.newPage();
  await Promise.all([
    page.coverage.startJSCoverage({
      resetOnNavigation: false
    }),
    page.coverage.startCSSCoverage({
      resetOnNavigation: false
    })
  ]);
});


test('has title', async () => {
  await page.goto('localhost:3000');

  await expect(page).toHaveTitle("[BCE template]");
});

test('add bookmark', async () => {
  await page.goto('localhost:3000');

  await page.getByRole('link', { name: 'add bookmark' }).click();


  await expect(page.getByRole('heading', { name: 'bookmarks' })).toBeVisible();

  var labelText = "airhacks news";
  const labelTxt = page.getByLabel('label');
  await labelTxt.pressSequentially(labelText, {delay: 100});

  const linkTxt = page.getByLabel('link');
  await linkTxt.pressSequentially('https://airhacks.news',{delay: 100});
  await page.getByRole('button', { name: 'new bookmark' }).click();

  await expect(page.getByRole('link', { name: labelText })).toBeVisible();
});

test.afterAll(async () => {
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);
  const coverageData = [... jsCoverage, ... cssCoverage];

  const coverageReport = MCR({
    name: 'My Coverage Report',
    outputDir: './coverage-report',
    reports: ['v8', 'console-details']
  });
  await coverageReport.add(coverageData);
  await coverageReport.generate();

  await page.close();
});
