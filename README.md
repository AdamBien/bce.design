# bce.design

Quickstarter and sample application for building non-trivial web applications with minimal tooling, essential dependencies, high productivity, and no migrations.

Built on web standards and browser APIs - no framework lock-in, just native [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), and modern JavaScript

Visit [https://bce.design](https://bce.design) for more information.

## Core Architecture

This project implements **unidirectional data flow** using Redux Toolkit for predictable state management. All state changes flow in one direction: Actions → Reducers → Store → View Components. The application follows the Boundary Control Entity (BCE) pattern for clear separation of concerns.

<img src="https://repository-images.githubusercontent.com/355100926/4731b900-979e-11eb-9014-3b30688cc691" alt="Boundary Control Entity quickstarter -> with web components" height="400"/>

# run

Serve `app/src` with any static web server that falls back to `index.html` for unknown paths (required for client-side routing).

## Launch with browsersync

1. Install [browsersync](https://www.browsersync.io)
2. `git clone https://github.com/AdamBien/bce.design`
3. `cd app`
4. Run: `browser-sync src -f src -b "google chrome" --no-notify`

## Launch with serve

```bash
cd app
npx serve -s src
```

## Launch with zws (zero dependencies web server)

With a recent Java installation, serve the assets with [zws](https://github.com/adamBien/zws):

```bash
cd app/src
zws.sh
```

Note: zws has no `index.html` fallback — enter the app at `/`; deep links like `/add` return 404.

## Launch with Quarkus

Serve the application as static resources using Quarkus:

1. Copy the `app/src` contents to `src/main/resources/META-INF/resources/`:
```bash
cp -r app/src/* [APP_DIR]/src/main/resources/META-INF/resources/
```

2. Run in development mode:
```bash
cd [APP_DIR]
mvn quarkus:dev
```

3. Access the application at `http://localhost:8080`

4. Build for production and run:
```bash
mvn package
java -jar target/quarkus-app/quarkus-run.jar
```

Quarkus automatically serves static files from `META-INF/resources/` and provides production-ready features like compression, caching headers, and efficient resource serving.

[![BCE overview](https://i.ytimg.com/vi/LYzGgCW0OxY/mqdefault.jpg)](https://www.youtube.com/embed/LYzGgCW0OxY?rel=0)



## e2e tests

The e2e tests are available from:

[tests](./tests/)

## code coverage

The e2e tests with configured global code coverage is available from: [codecoverage](./codecoverage/)

# IDE

1. [Visual Studio Code](https://code.visualstudio.com)
2. Setup: [JS imports](https://www.adam-bien.com/roller/abien/entry/fixing_es_6_import_autocompletion)
3. lit-html [plugin](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) for syntax highlighting inside html templates
4. redux devtools chrome [extension](https://github.com/zalmoxisus/redux-devtools-extension)

# update dependencies

Runtime dependencies (lit-html, Redux Toolkit) are bundled as ES modules into `app/src/libs/` and mapped via the import map in `index.html`. To update, edit `package.json` in [libs](https://github.com/AdamBien/bce.design/tree/main/libs), then:

```bash
cd libs
npm install
npx rollup -c
```

# external ingredients

1. [lit-html](https://lit.dev/docs/libraries/standalone-templates/)
2. [redux toolkit](https://redux-toolkit.js.org)
3. [rollup](https://rollupjs.org/) (for updates / optional)

Client-side routing is implemented with web standards: the [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) and [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) — no router dependency required.

# what is BCE?

Boundary Control Entity (BCE) pattern organizes code by responsibility:

- **Boundary**: UI components (Web Components) - user interaction layer
- **Control**: Business logic and orchestration - application behavior  
- **Entity**: State management and data models - domain objects

In this project:
- `bookmarks/boundary/` - UI components like List.js, Add.js
- `bookmarks/control/` - Logic like CRUDControl.js
- `bookmarks/entity/` - State like BookmarksReducer.js

BCE eliminates naming debates and provides instant code organization, helping avoid [Parkinson's law of triviality](https://en.wikipedia.org/wiki/Law_of_triviality). [Learn more about BCE](https://en.wikipedia.org/wiki/Entity-control-boundary)

## unidirectional data flow

[![unidirectional data flow](https://i.ytimg.com/vi/zjtaLLs2eSM/mqdefault.jpg)](https://www.youtube.com/embed/zjtaLLs2eSM?rel=0)

## static hosting on Amazon S3

[![static web hosting on Amazon S3 intro](https://i.ytimg.com/vi/EtvyaUJjg_E/mqdefault.jpg)](https://www.youtube.com/watch?v=EtvyaUJjg_E)


# resources

## Web Standards and Browser APIs Used

- [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) - Custom Elements, Shadow DOM, HTML Templates
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements) - Define new HTML elements
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) - Native JavaScript module system
- [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) - Map bare module specifiers to URLs
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) - Responsive layouts based on container size
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Browser storage for state persistence
- [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) - Data serialization for storage
- [querySelector/querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) - DOM element selection
- [ES6 Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) - JavaScript class syntax
- [Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) - String templates with embedded expressions
- [Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) - Concise function syntax
- [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) - Extract values from objects/arrays
- [Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) - Expand arrays/objects
- [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) - Intercepts same-origin navigations for client-side routing
- [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) - Route matching without a router dependency

## Testing & Development Tools

[mockend](https://github.com/adambien/mockend) serves as a mock backend with throttling functionality.

Mockend can slow down responses, which simplifies the testing of asynchronous view updates. Fetch requests in the `control` layer can be delayed for test purposes.

Article: [Web Components, Boundary Control Entity (BCE) and Unidirectional Data Flow with redux](https://adambien.blog/roller/abien/entry/web_components_boundary_control_entity)

# AI coding agents

Guidance for AI coding agents (Claude Code, Codex, Gemini CLI, ...) is maintained in [AGENTS.md](./AGENTS.md).