import BElement from "../../BElement.js";
import { html } from "lit-html";
import './Add.js';
import './Preview.js';

class Bookmarks extends BElement{
    
    view() {
        return html`
           <b-preview></b-preview>
           <b-add></b-add>
        `;
    }

}

customElements.define('b-bookmarks',Bookmarks);