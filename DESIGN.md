---
version: alpha
name: bce.design bookmarks
description: Design system of the bce.design quickstarter — a bookmarks SPA that showcases web standards, replacing proprietary and custom code with platform capabilities.
colors:
  primary: "#00d1b2"
  primary-hover: "#00c4a7"
  on-primary: "#062a25"
  secondary: "#3273dc"
  neutral: "#f5f5f5"
  neutral-hover: "#eeeeee"
  on-neutral: "#000000b3"
  surface: "#ffffff"
  on-surface: "#4a4a4a"
  on-surface-strong: "#363636"
  danger: "#cc0f35"
  danger-surface: "#feecf0"
  accent-border: "#ccf3ec"
typography:
  headline-lg:
    fontFamily: system-ui
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 1.125
  body-md:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.5
  label-md:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: "700"
    lineHeight: 1.5
  label-sm:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 1.5
rounded:
  sm: 2px
  md: 4px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-text:
    backgroundColor: "#ffffff00"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.md}"
  button-text-hover:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface-strong}"
  button-light-sm:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-neutral}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    height: 30px
  button-light-sm-hover:
    backgroundColor: "{colors.neutral-hover}"
    textColor: "{colors.on-neutral}"
  button-danger-light-sm:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    height: 30px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-strong}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 40px
  input-label:
    textColor: "{colors.on-surface-strong}"
    typography: "{typography.label-md}"
  link:
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
  list-row:
    backgroundColor: "#ffffff00"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  list-row-hover:
    backgroundColor: "{colors.neutral}"
---

# bce.design bookmarks — Design System

## Overview

This is the visual identity of the **bce.design quickstarter** — a bookmarks single-page application whose purpose is to **showcase what web standards can do**, replacing proprietary and custom code with platform capabilities. The site's own subtitle states the brand promise: *"magic-less, minimalistic, opinionated, standard-based, quickstarter."* The design follows through: no custom fonts, no imagery, no decoration, no build step. The look and feel is what the web platform provides natively — semantic HTML elements, standard custom elements in a Boundary-Control-Entity layout, CSS Grid with container queries, and the operating system's own font stack — arranged with vast whitespace.

The entire design system lives in one small, token-driven stylesheet: the tokens in this document map one-to-one to `--custom-properties` on `:root`, and no CSS framework or utility classes stand between the tokens and the rendered page. Both color schemes derive from the same tokens via `light-dark()`; state variants derive from base colors via `color-mix()` rather than being hand-picked.

The audience is developers evaluating how far standards reach before any framework is needed. The UI should feel like a proof: instantly familiar, zero visual friction, everything the platform gives you for free and nothing more. Every stylistic decision doubles as a demonstration — if a native HTML element, CSS feature, or browser API can express it, that is the correct choice. New views added to the app should preserve this restraint: one accent color for the main action, quiet grays for everything else, and generous empty space instead of containers and chrome.

## Colors

The palette pairs quiet warm-less grays for content with a single vivid accent reserved for action. The tokens encode the **light scheme**; the dark scheme is derived from the same roles via `light-dark()`, never as a second hand-maintained palette.

- **Primary — "Turquoise" (#00d1b2):** the sole call-to-action color. It fills the submit button and outlines the form inputs, making the one thing you can *do* on each view unmistakable. Text on it is deep teal ink (`on-primary` #062a25) rather than white, keeping the pairing above WCAG AA. The hover shade (#00c4a7) is derived, not hand-picked: `color-mix(in oklab, var(--color-primary), black 8%)`.
- **Secondary — "Link Blue" (#3273dc):** classic hyperlink blue, used for genuine navigational links only — the bookmark URLs in the list and the footer credit. In the dark scheme it lightens toward a sky blue (e.g. `light-dark(#3273dc, #6ea8ff)`) to stay readable on dark surfaces.
- **Text grays:** body copy renders in #4a4a4a (`on-surface`); the page title, form labels, and input text use the darker #363636 (`on-surface-strong`) for hierarchy without weight changes alone. Dark scheme flips these to light grays on a near-black surface.
- **Neutral — "Whitesmoke" (#f5f5f5):** background of low-emphasis controls (the small *edit* button), hovered text buttons, and hovered list rows; darkens to #eeeeee on hover.
- **Danger (#cc0f35 on #feecf0):** the destructive *delete* action uses a "light danger" pairing — crimson text on a pale pink field — loud enough to warn, muted enough not to dominate the list. The same crimson marks invalid form fields via `:user-invalid`.
- **Accent border — "Pale Teal" (#ccf3ec):** a quiet tint of the primary used exclusively for the 2px structural border on the left edge of the main grid — the one piece of decoration, and it carries the brand hue.

The canvas is plain white (#ffffff) in the light scheme; the document declares `color-scheme: light dark`, so form controls, scrollbars, and the dark canvas come from the browser, not from script.

## Typography

Everything renders in the **system font stack** (`system-ui, -apple-system, "Segoe UI", Roboto, … sans-serif`) — a deliberate standards statement: instead of shipping proprietary font assets, the UI inherits each platform's native voice via the standard `system-ui` keyword. Hierarchy comes from size and weight, never from a second family:

- **headline-lg (32px / 600 / 1.125):** the single `h1` page title ("bookmarks"), centered at the top of the grid. May scale fluidly on narrow containers via `clamp(24px, 5cqi, 32px)`; 32px is the canonical size.
- **body-md (16px / 400 / 1.5):** the default for everything — body text, navigation, buttons, inputs, footer.
- **label-md (16px / 700 / 1.5):** form field labels; bold is the only emphasis device used in forms.
- **label-sm (12px / 400 / 1.5):** the small per-row action buttons (*edit*, *delete*) in the bookmark list.

## Layout

The layout is itself a standards showcase: plain **CSS Grid** with **container queries**, no grid framework or utility classes. The body occupies **80% of the viewport width, centered** (10% margin each side), and declares itself an inline-size container. The `main` element is a grid of semantic landmarks (`header`, `nav`, `section`, `footer`) mapped to named grid areas, adapting via **container queries at a 40em breakpoint**:

- **Wide (≥ 40em):** two columns (`1fr 4fr`) — status bar spanning the top, navigation menu in the narrow left column, the active view in the wide right column, footer spanning the bottom. Row proportions are `1fr 6fr 1fr`, so the content view dominates.
- **Narrow (< 40em):** a single column stacking status → menu → view → footer, with nav items flowing inline.

The active view starts at the **top** of its grid area (no large top offset), so content — not emptiness — anchors the eye. Spacing follows an 8px-based rhythm: 16px base unit (button/input horizontal padding, form gaps), 8px below labels and inside list rows, 24–32px between a view's heading and its content. The layout leans on emptiness rather than dividers or cards; the only structural ornament is the 2px pale-teal border on the grid's left edge.

Route changes between the list, add, and edit views animate with the **View Transitions API** — a cross-fade the browser performs natively — never with JavaScript animation libraries.

## Elevation & Depth

The design is **flat**. No cards, no drop shadows, no layering. The only depth cues are functional micro-details:

- Text inputs carry a faint inset shadow (`inset 0 1px 2px rgba(10,10,10,0.05)`) to read as "wells".
- Keyboard focus draws a visible ring via **`:focus-visible`** — a 2px outline in the control's own color with a small offset — so pointer clicks stay clean while tab navigation is unmistakable.

Hierarchy is conveyed by position (grid areas), size (the 6fr view row), and the single accent color — not by elevation.

## Shapes

Rectangles with **minimal rounding**. Standard controls (buttons, inputs, hovered list rows) use a 4px corner radius; the small list-row buttons tighten to 2px. Nothing is circular or pill-shaped. Borders are reserved for meaning: teal outlines on inputs (interactive), the pale-teal structural edge on `main` (decorative), crimson on invalid fields (`:user-invalid`), transparent everywhere else.

## Components

Components are native HTML elements first: real `button`, `input`, `label`, `form`, `ol` elements styled through element selectors and design-token custom properties — never div-based reconstructions, never framework class vocabularies. Built-in behavior (form semantics, `required` validation, focus handling, keyboard access) comes from the platform, not from script.

- **Primary button:** turquoise fill, deep-teal ink text, 40px tall, 4px radius, 16px horizontal padding. One per view — it is the view's single action ("new bookmark" / "save bookmark"). Hover uses the `color-mix()`-derived darker shade.
- **Text button** (navigation): transparent, no underline, body-gray text; hovers to a whitesmoke fill with darker text, marking it clearly as an in-app action rather than a hyperlink. The active route's nav item renders in `on-surface-strong` for orientation.
- **Small light buttons:** 30px tall, 12px text, 2px radius. The neutral variant (whitesmoke / 70% black) is *edit*; the danger variant (pale pink / crimson) is *delete*. They ride at the end of each list row.
- **Input fields:** white field, 40px tall, 4px radius, 1px turquoise border, dark #363636 text with light gray placeholders, subtle inset shadow. Validation is native: a field the user has touched and left invalid shows a crimson border via `:user-invalid` — no JavaScript validation styling. Each input sits under a bold 16px label.
- **List rows:** bookmarks render as plain `ol` rows spanning the full view width, each row a small grid — label and blue link growing left, the edit/delete buttons aligned right — with 8px vertical padding and a whitesmoke hover tint (4px radius) for scannability. No dividers or zebra striping.

## Do's and Don'ts

- Do prefer a web standard over custom code for every new feature: semantic HTML elements before styled `div`s, CSS (grid, container queries, custom properties, `light-dark()`, `color-mix()`) before script, browser APIs (View Transitions, `:user-invalid`) before libraries.
- Do keep every color, size, and radius flowing from the `:root` custom properties that mirror this document's tokens — change the token, not the component.
- Do reserve turquoise (`primary`) for the one main action per view; navigation stays as understated text buttons.
- Do rely on the system font stack via `system-ui` — never add proprietary font assets to this template.
- Do keep views flat and whitespace-driven; add no cards, shadows, or container chrome.
- Do use native form machinery — real `label`/`input`/`button` elements with `required` validation and `:user-invalid` styling — rather than reimplementing it in JavaScript.
- Do support both color schemes through `light-dark()` and `color-scheme: light dark`; never fork a second stylesheet or toggle themes with script.
- Do maintain WCAG AA contrast (4.5:1) on every text/background pairing — the deep-teal-on-turquoise primary button is the reference example.
- Don't add build steps, CSS preprocessors, utility-class frameworks, or any third-party CSS; one plain token-driven stylesheet carries the entire design.
- Don't place colored backgrounds behind static content; the canvas stays plain with the pale-teal left border as the only decoration — tinted fills are reserved for interaction states.
- Don't introduce new radii — 4px for standard controls, 2px for small ones.
- Don't restyle links: real hyperlinks are #3273dc, in-app actions are buttons.
- Don't hand-pick hover or active shades; derive them from the base token with `color-mix()`.
