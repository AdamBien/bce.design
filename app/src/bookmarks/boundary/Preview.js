import BElement from "../../Belement.js";
import { html } from "../../libs/lit-html.js";

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