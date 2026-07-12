import BElement from "../../BElement.js";
import { html } from "lit-html";
import { deleteBookmark } from "../control/CRUDControl.js";

class List extends BElement {
    
    extractState({ bookmarks: { list } }) {
        return list;
    }

    view() {
        return html`
        <ol>
            ${this.state.map(bookmark =>
                html`
                    <li><span>${bookmark.label} [<a href="${bookmark.link}" target="_blank">${bookmark.link}</a>]</span> <a href="/edit/${bookmark.id}">edit</a> <button @click="${_ => deleteBookmark(bookmark.id)}">delete</button></li>
                `)}
        </ol>
        `;
    }
}
customElements.define('b-list',List);