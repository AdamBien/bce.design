import BElement from "../../BElement.js";
import { html } from "lit-html";

class Preview extends BElement {

    extractState({ bookmarks }) {
        return bookmarks;
    }
    view() {
        const { bookmark: { label,link }  } = this.state;
        return html`
        <div>
            bookmark: <a href="${link}">${label}</a> (${link})
        </div>
        `;
    }
}
customElements.define('b-preview',Preview);