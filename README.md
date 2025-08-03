# bce.design

minimal tooling, essential dependencies, high productivity, no migrations, web component starter for non-trivial web applications

Built on web standards and browser APIs - no framework lock-in, just native Web Components, ES modules, and modern JavaScript

## Core Architecture

This project implements **unidirectional data flow** using Redux Toolkit for predictable state management. All state changes flow in one direction: Actions → Reducers → Store → View Components. The application follows the Boundary Control Entity (BCE) pattern for clear separation of concerns.

<img src="https://repository-images.githubusercontent.com/355100926/4731b900-979e-11eb-9014-3b30688cc691" alt="Boundary Control Entity quickstarter -> with web components" height="400"/>

# run

## Launch with browsersync:

1. Install [browsersync](https://www.browsersync.io)
2. `git clone https://github.com/AdamBien/bce.design`
3. `cd app`
4. Perform: `browser-sync src -f src -b "google chrome" --no-notify`


## Launch with vite:

1. Install [vite](https://vitejs.dev)
2. `git clone https://github.com/AdamBien/bce.design`
3. Perform: `npx vite`

## Launch with zws (zero dependencies web server):

If you have installed recent Java or later, you can serve the assets with [zws](https://github.com/adamBien/zws) from `app/src`
with:
`cd app/src`
`zws.sh`

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

Update `package.json` in [libs](https://github.com/AdamBien/bce.design/tree/main/libs)

# external ingredients

1. [lit-html](https://lit.dev/docs/libraries/standalone-templates/)
2. [redux toolkit](https://redux-toolkit.js.org)
3. [vaadin router](https://vaadin.com/router) (suggestion / optional)
4. [rollup](https://rollupjs.org/) (for updates / optional)

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

## vaadin router

[![vaadin router intro](https://i.ytimg.com/vi/Fxi9YdM0qFw/mqdefault.jpg)](https://www.youtube.com/watch?v=Fxi9YdM0qFw)

## static hosting on Amazon S3

[![static web hosting on Amazon S3 intro](https://i.ytimg.com/vi/EtvyaUJjg_E/mqdefault.jpg)](https://www.youtube.com/watch?v=EtvyaUJjg_E)


# resources

https://github.com/adambien/mockend is useful as a mock backend with throttling functionality. 

Mockend can slow down responses, what simplifies the testing of asynchronous view updates. Fetch-requests in the `control` layer can be delayed for test purposes.

Article: [Web Components, Boundary Control Entity (BCE) and Unidirectional Data Flow with redux](https://adambien.blog/roller/abien/entry/web_components_boundary_control_entity)