import BElement from "../../BElement.js";
import { html } from "lit-html";
import { editBookmark } from "../control/CRUDControl.js";
import './Add.js';
import './Preview.js';

class Bookmarks extends BElement{

    /**
     * The router passes the :bookmarkId route parameter as an attribute.
     * Loading (or resetting) the temporal cache happens before the initial
     * render triggered by BElement's connectedCallback.
     */
    connectedCallback() {
        editBookmark(this.getAttribute('bookmarkid'));
        super.connectedCallback();
    }

    view() {
        return html`
           <b-preview></b-preview>
           <b-add></b-add>
        `;
    }

}

customElements.define('b-bookmarks',Bookmarks);
