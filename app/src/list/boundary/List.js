import BElement from "../../Belement.js";
import { html } from "../../libs/lit-html.js";

class List extends BElement {
    
    extractState({ bookmarks: { list } }) {
        return list;
    }

    view() {
        
        return html`
            ${this.state.map(bookmark =>
                html`
                <li>bookmark.label / bookmark.link</li>
            `)};
        `;
    }
}

customElements.define('b-list',List);