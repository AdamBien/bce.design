/**
 * Minimal hand-written types for the vendored lit-html module,
 * covering only the exports this project uses. tsc prefers this
 * sibling declaration file over lit-html.js, so the minified
 * module itself is never type-checked.
 */
export declare function html(strings: TemplateStringsArray, ...values: unknown[]): unknown;
export declare function render(value: unknown, container: Element | DocumentFragment): unknown;
