import { Router } from "./libs/vaadin-router.js";
import './add/boundary/Add.js';
import './list/boundary/List.js';

const outlet = document.querySelector('.view');
const router = new Router(outlet);
router.setRoutes([
  {path: '/',     component: 'b-list'},
  {path: '/add',  component: 'b-add'}
]);
console.log("router initialized");