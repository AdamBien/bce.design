import { Router } from "./libs/vaadin-router.js";
import './add/boundary/Add.js';

console.log("router initialization");


const outlet = document.querySelector('.view');
const router = new Router(outlet);
router.setRoutes([
  {path: '/',     component: 'b-list'},
  {path: '/add',  component: 'b-add'}
]);