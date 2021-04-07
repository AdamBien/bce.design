# dependency management and conversion project

This project manages external dependencies and converts them into plain [ESM modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

Initial installation:

1. `cd libs`
2. `npm install`

To rebuild the dependencies execute:

`rollup -c`

Currently included:

1. [lit-html](https://lit-html.polymer-project.org)
2. [redux toolkit](https://redux-toolkit.js.org/tutorials/quick-start)
3. [vaadin router](https://vaadin.com/router)

The bulma.css was directly downloaded from [bulma.io](https://bulma.io). There are multiple alternatives available:

1. [UIkit](https://getuikit.com)
2. [Spectrum CSS](https://opensource.adobe.com/spectrum-css/get-started.html)
3. [Water.css](https://watercss.kognise.dev)
4. [material design (web)](https://material.io/develop/web)
