import BElement from "../../Belement.js";
import { html } from "../../libs/lit-html.js";
import { bookmarkUpdated } from "../control/AddControl.js";

class Add extends BElement{
    
    view() {
        return html`
        <form>
            <label class="label">Label:
                <input ?disabled=${status} class="input is-primary" required name="label" placeholder="label" @change=${e=>this.onUserInput(e)} >
            </label>
            <label class="label">Link:
                <input ?disabled=${status} class="input is-primary" required name="link" placeholder="link" @change=${e=>this.onUserInput(e)} >
            </label>
        </form>
        `;
    }
    onUserInput({ target: { name,value } }) { 
        bookmarkUpdated(name,value);

    }
}

customElements.define('b-add',Add);