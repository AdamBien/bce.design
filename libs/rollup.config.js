//npm install @rollup/plugin-node-resolve --save-dev
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [{
  input: [
    './node_modules/lit-html/lit-html.js',
    './node_modules/@vaadin/router/dist/router.js',
    './node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs'
  ],
    output: { dir: "../app/src/libs", format: "esm" },
  plugins: [nodeResolve({
    browser: true
  })]
}]