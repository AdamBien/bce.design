# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, Gemini CLI, ...) when working with code in this repository.

## Project Overview

This is a web component-based single-page application following the Boundary Control Entity (BCE) architectural pattern. The application uses minimal tooling and essential dependencies for building non-trivial web applications.

## Development Commands

### Running the Application

Serve `app/src` with any static web server that falls back to `index.html` for unknown paths (client-side routing), e.g.:

```bash
# Using serve
cd app
npx serve -s src

# Using browsersync
cd app
browser-sync src -f src -b "google chrome" --no-notify

# Using zws (zero-dependency Java web server, ships with the web-static skill on airails.dev)
cd app/src
zws.sh   # serves on http://localhost:3000; no index.html fallback — enter the app at /, deep links to /add 404
```

Note: `npx vite` does not currently work — Vite resolves the bare `lit-html` / `@reduxjs/toolkit` imports itself instead of honoring the import map in `index.html`.

### Testing

```bash
# Run Playwright e2e tests (expect the app on http://localhost:3000)
cd tests
npm test  # or npx playwright test

# Run tests with code coverage
cd codecoverage
npm test  # or npx playwright test
```

### Dependency Management

Runtime dependencies (lit-html, Redux Toolkit) are bundled as ESM into `app/src/libs/` and mapped via the import map in `index.html`:

```bash
cd libs
npm install     # Install dependencies
npx rollup -c   # Rebuild bundles into app/src/libs/
```

## Architecture and Coding Conventions

The detailed rules (BCE layering, component structure, state management, CSS, testing style)
are maintained as the **web-components** skill, published at [airails.dev](https://airails.dev):

- Ruleset: https://raw.githubusercontent.com/AdamBien/airails/main/web/web-components/SKILL.md
- Installation (per-agent packages): https://github.com/AdamBien/airails

Agents without the skill installed should fetch and follow the ruleset above before making
non-trivial changes.
