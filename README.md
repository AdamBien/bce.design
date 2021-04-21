# bce.design

minimal tooling, essential dependencies, high productivity, no migrations, web component starter for non-trivial web applications

<img src="https://repository-images.githubusercontent.com/355100926/4731b900-979e-11eb-9014-3b30688cc691" alt="Boundary Control Entity quickstarter -> with web components" height="400"/>

# run

To launch the application:

1. Install [browsersync](https://www.browsersync.io)
2. `git clone https://github.com/AdamBien/bce.design`
3. `cd app`
4. Perform: `browser-sync src -f src -b "google chrome" --no-notify`

[![BCE overview](https://i.ytimg.com/vi/LYzGgCW0OxY/mqdefault.jpg)](https://www.youtube.com/embed/LYzGgCW0OxY?rel=0)

# IDE

1. [Visual Studio Code](https://code.visualstudio.com)
2. Setup: [JS imports](https://www.adam-bien.com/roller/abien/entry/fixing_es_6_import_autocompletion)
3. lit-html [plugin](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) for syntax highlighting inside html templates
4. redux devtools chrome [extension](https://github.com/zalmoxisus/redux-devtools-extension)

# update dependencies

Checkout [libs](https://github.com/AdamBien/bce.design/tree/main/libs)

# external ingredients

1. [lit-html](https://lit-html.polymer-project.org)
2. [redux toolkit](https://redux-toolkit.js.org)
3. [vaadin router](https://vaadin.com/router) (suggestion / optional)
4. [rollup](https://rollupjs.org/) (for updates / optional)

# what is BCE?

Boundary Control Entity (BCE) pattern is used to organize elements according to their responsibilities:  [https://en.wikipedia.org/wiki/Entity-control-boundary](https://en.wikipedia.org/wiki/Entity-control-boundary).

Why it is needed? BCE was published in 1992 and since then described in various books and articles. Also: the boundary, control, entity icons are available in all modelling, drawing and designing tools. 

The best of all: with BCE we don't have to discuss the naming anymore and therefore completely ignore the [Parkinson's law of triviality](https://en.wikipedia.org/wiki/Law_of_triviality) :-).

## unidirectional data flow

[![unidirectional data flow](https://i.ytimg.com/vi/zjtaLLs2eSM/mqdefault.jpg)](https://www.youtube.com/embed/zjtaLLs2eSM?rel=0)

## vaadin router

[![vaadin router intro](https://i.ytimg.com/vi/Fxi9YdM0qFw/mqdefault.jpg)](https://www.youtube.com/watch?v=Fxi9YdM0qFw)


# resources

https://github.com/adambien/mockend is useful as a mock backend with throttling functionality. 

Mockend can slow down responses, what simplifies the testing of asynchronous view updates. Fetch-requests in the `control` layer can be delayed for test purposes.