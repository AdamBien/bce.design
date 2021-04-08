# bce.design

minimal tooling, essential dependencies, high productivity, no migrations, web platform starter

<img src="https://repository-images.githubusercontent.com/355100926/4731b900-979e-11eb-9014-3b30688cc691" alt="Boundary Control Entity quickstarter -> with web components" height="400"/>

# run

To launch the application:

1. Install [browsersync](https://www.browsersync.io)
2. `git clone https://github.com/AdamBien/bce.design`
3. `cd app`
4. Perform: `browser-sync src -f src -b "google chrome" --no-notify`

[![](https://i.ytimg.com/vi/LYzGgCW0OxY/mqdefault.jpg)](https://www.youtube.com/embed/LYzGgCW0OxY?rel=0)

# IDE

1. [Visual Studio Code](https://code.visualstudio.com)
2. Setup: [JS imports](https://www.adam-bien.com/roller/abien/entry/fixing_es_6_import_autocompletion)
3. lit-html [plugin](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) for syntax highlighting inside html templates
4. redux devtools chrome [extension](https://github.com/zalmoxisus/redux-devtools-extension)

# update dependencies

Checkout [libs](https://github.com/AdamBien/bce.design/tree/main/libs)

# what is BCE?

Boundary Control Entity (BCE) pattern is used to organize elements according to their responsibilities:  [https://en.wikipedia.org/wiki/Entity-control-boundary](https://en.wikipedia.org/wiki/Entity-control-boundary).

Why it is needed? BCE was published in 1992 and since then described in various books and articles. Also: the boundary, control, entity icons are available in all modelling, drawing and designing tools. 

The best of all: with BCE we don't have to discuss the naming and completely ignore the [Parkinson's law of triviality](https://en.wikipedia.org/wiki/Law_of_triviality) :-).
