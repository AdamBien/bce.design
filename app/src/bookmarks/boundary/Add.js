import BElement from "../../BElement.js";
import { html } from "lit-html";
import { bookmarkUpdated, saveBookmark } from "../control/CRUDControl.js";
class Add extends BElement{

    extractState({ bookmarks: { bookmark } }) {
        return bookmark;
    }

    view() {
        return html`
        <form>
            <label>Label:
                <input required name="label" placeholder="label" .value="${this.state.label ?? ''}" @keyup=${e=>this.onUserInput(e)} >
            </label>
            <label>Link:
                <input required name="link" placeholder="link" .value="${this.state.link ?? ''}" @keyup=${e=>this.onUserInput(e)} >
            </label>
            <button @click="${e => this.saveBookmark(e)}">${this.state.id ? "save bookmark" : "new bookmark"}</button>
        </form>
        `;
    }
    onUserInput({ target: { name,value } }) {
        bookmarkUpdated(name,value);
    }

    saveBookmark(event) {
        const { target: { form } } = event;
        event.preventDefault();
        form.reportValidity();
        if(form.checkValidity())
            saveBookmark();
    }
}

customElements.define('b-add',Add);
