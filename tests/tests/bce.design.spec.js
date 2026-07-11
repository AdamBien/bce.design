// @ts-check
const { test, expect } = require('@playwright/test');


test('has title', async ({ page }) => {
  await page.goto('localhost:3000');

  await expect(page).toHaveTitle("[BCE template]");
});

test('add bookmark', async ({ page }) => {
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

test('edit bookmark', async ({ page }) => {
  await page.goto('localhost:3000');

  await page.getByRole('link', { name: 'add bookmark' }).click();

  var labelText = "airhacks fm";
  await page.getByLabel('label').pressSequentially(labelText, {delay: 100});
  await page.getByLabel('link').pressSequentially('https://airhacks.fm', {delay: 100});
  await page.getByRole('button', { name: 'new bookmark' }).click();

  await page.getByRole('link', { name: 'list' }).click();
  await page.getByRole('link', { name: 'edit' }).click();

  const labelTxt = page.getByLabel('label');
  await expect(labelTxt).toHaveValue(labelText);

  var editedLabel = "airhacks live";
  await labelTxt.press('ControlOrMeta+a');
  await labelTxt.pressSequentially(editedLabel, {delay: 100});
  await page.getByRole('button', { name: 'save bookmark' }).click();

  await page.getByRole('link', { name: 'list' }).click();
  await expect(page.getByText(editedLabel)).toBeVisible();
});
