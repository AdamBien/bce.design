import BElement from "../../Belement.js";
import { html } from "../../libs/lit-html.js";

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
                        <li><span>${bookmark.label} [<a href="${bookmark.link}" target="_blank">${bookmark.link}</a>]</span> <button class="button is-small is-danger is-light">delete</button></li>
                    `)}
            </ol>
        </div>
        `;
    }
}
customElements.define('b-list',List);