import BElement from "../../BElement.js";
import { html } from "../../libs/lit-html.js";
import { deleteBookmark } from "../control/CRUDControl.js";

class List extends BElement {
    
    extractState({ bookmarks: { list } }) {
        return list;
    }

    view() {
        return html`
        <div class="content">
            <ol>
                ${this.state.map(bookmark =>
                    html`
                        <li><span>${bookmark.label} [<a href="${bookmark.link}" target="_blank">${bookmark.link}</a>]</span> <button @click="${_ => deleteBookmark(bookmark.id)}" class="button is-small is-danger is-light">delete</button></li>
                    `)}
            </ol>
        </div>
        `;
    }
}
customElements.define('b-list',List);