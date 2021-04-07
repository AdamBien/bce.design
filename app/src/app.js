import { Router } from "./libs/vaadin-router.js";
import './add/boundary/Add.js';
import './list/boundary/List.js';
import store from "./store.js";
import { save } from "./localstorage/control/StorageControl.js";

store.subscribe(_ => { 
    const state = store.getState();
    save(state);
})
const outlet = document.querySelector('.view');
const router = new Router(outlet);
router.setRoutes([
  {path: '/',     component: 'b-list'},
  {path: '/add',  component: 'b-add'}
]);
console.log("router initialized");