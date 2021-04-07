import BElement from "../../Belement.js";
import { html } from "../../libs/lit-html.js";

class List extends BElement {
    
    extractState({ bookmarks: { list } }) {
        return list;
    }

    view() {
        
        return html`
        <ol>
            ${this.state.map(bookmark =>
                html`
                <li>${bookmark.label} / ${bookmark.link}</li>
            `)}
        </ol>
        `;
    }
}

customElements.define('b-list',List);