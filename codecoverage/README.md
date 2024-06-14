# global code coverage

This project runs e2e tests with the goal of calculating total code coverage, which requires a special Playwright configuration to run all tests in a single browser instance.

the project structure was created with:

`npm init playwright@latest`

## setup 

`npm install`

## run test

1. Start bce.design frontend first from folder `bce.design/app` with e.g. `browser-sync src --files src -b "google chrome" --single --no-notify`
2. Run the tests in browser:  `npx playwright test` or with test UI: `npx playwright test --ui`
3. The coverage reports are stored in: `./coverage-report/`. Open `index.html` in browser.
4. The test reports are stored in `test-results` folder. Open test reports: `npx playwright show-report`
