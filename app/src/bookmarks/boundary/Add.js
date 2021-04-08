import BElement from "../../BElement.js";
import { html } from "../../libs/lit-html.js";
import { bookmarkUpdated, newBookmark } from "../control/CRUDControl.js";
class Add extends BElement{
    
    view() {
        return html`
        <form>
            <label class="label">Label:
                <input ?disabled=${status} class="input is-primary" required name="label" placeholder="label" @keyup=${e=>this.onUserInput(e)} >
            </label>
            <label class="label">Link:
                <input ?disabled=${status} class="input is-primary" required name="link" placeholder="link" @keyup=${e=>this.onUserInput(e)} >
            </label>
            <button class="button is-primary" @click="${e => this.newBookmark(e)}">new bookmark</button>
        </form>
        `;
    }
    onUserInput({ target: { name,value } }) { 
        bookmarkUpdated(name,value);
    }

    newBookmark(event) {
        const { target: { form } } = event;
        event.preventDefault();
        form.reportValidity();
        if(form.checkValidity())
            newBookmark();
    }
}

customElements.define('b-add',Add);