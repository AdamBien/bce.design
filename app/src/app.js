/**
 * Application entry point that initializes routing and state persistence.
 * Configures client-side routing and sets up automatic localStorage synchronization
 * for Redux store updates.
 * To deactivate localStorage persistence, comment out or remove the store.subscribe() block.
 */
import { Router } from "./libs/router.js";
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
const outlet = document.querySelector('.view');
const router = new Router(outlet, {});
router.setRoutes([
  {path: '/',     component: 'b-list'},
  {path: '/add',  component: 'b-bookmarks'}
]);
console.log("router initialized");