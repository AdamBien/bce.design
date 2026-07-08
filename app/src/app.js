/**
 * Application entry point that initializes routing and state persistence.
 * Client-side routing is implemented with web standards: the Navigation API
 * intercepts same-origin navigations and URLPattern matches routes.
 * To deactivate localStorage persistence, comment out or remove the store.subscribe() block.
 */
import './bookmarks/boundary/Bookmarks.js';
import './bookmarks/boundary/List.js';
import store from "./store.js";
import { save } from "./localstorage/control/StorageControl.js";

/**
 * To deactivate localStorage persistence, comment out or remove the store.subscribe() block below.
 */
store.subscribe(_ => { 
    const state = store.getState();
    save(state);
})
const routes = [
    { pattern: new URLPattern({ pathname: '/' }), component: 'b-list' },
    { pattern: new URLPattern({ pathname: '/add' }), component: 'b-bookmarks' }
];
const outlet = document.querySelector('.view');

const render = url => {
    const route = routes.find(({ pattern }) => pattern.test(url));
    if (!route) return false;
    outlet.replaceChildren(document.createElement(route.component));
    return true;
};

navigation.addEventListener('navigate', event => {
    if (!event.canIntercept || event.hashChange || event.downloadRequest) return;
    const url = new URL(event.destination.url);
    if (!routes.some(({ pattern }) => pattern.test(url))) return;
    event.intercept({ handler: () => render(url) });
});

render(new URL(location.href));
console.log("router initialized");