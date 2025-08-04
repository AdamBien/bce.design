import { render } from "./libs/lit-html.js";
import store from "./store.js";

/**
 * This class is the base for all custom elements in this application,
 * and provides the following functionality:
 * <ol>
 * <li>Subscribes to the redux store</li>
 * <li>Triggers a view update on state changes</li>
 * <li>Provides an abstract / template implementation for the view method</li>
 * <li>unsubscribes from the redux store on disconnect</li>
 * <li>provides a hook to extract state from the redux store</li>
 * </ol>
 * @extends HTMLElement
 */
export default class BElement extends HTMLElement {

    constructor() {
        super();
        this.state = {};
    }

    /**
     * logs method names
     * @param {string} name 
     * @returns {string} the fully qualified method name
     */
    log(name) {
        return `${this.constructor.name}.${name}`
    }

    /**
     * Called when the element is connected to the document's DOM.
     * Sets up Redux store subscription and triggers initial view update.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks|MDN: Custom element lifecycle callbacks}
     */
    connectedCallback() {
        console.group(this.log('connectedCallback'))
        this.unsubscribe = store.subscribe(_ => this.triggerViewUpdate());
        console.log('subscribed for redux changes');
        this.triggerViewUpdate();
        console.groupEnd();
    }

    /**
     * Called when the element is disconnected from the document's DOM.
     * Cleans up by unsubscribing from Redux store updates.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks|MDN: Custom element lifecycle callbacks}
     */
    disconnectedCallback() {
        console.group(this.log('disconnectedCallback'))
        this.unsubscribe();
        console.log('unsubscribe called');
        console.groupEnd();
    }

    /**
     * Performs the view update cycle for the component.
     * Extracts relevant state from Redux store, generates view template,
     * and renders it to the DOM using lit-html.
     * Called automatically on store updates and initial connection.
     */
    triggerViewUpdate() {
        console.group(this.log('triggerViewUpdate'))
        console.log('Before extraction:', store.getState());
        this.state = this.extractState(store.getState());
        console.log('After extraction:', this.state);
        const template = this.view();
        console.log('View fetched');
        render(template, this.getRenderTarget());
        console.log('View rendered');
        console.groupEnd();
    }

    /**
     * 
     * @returns {HTMLElement} - the element to render the view into
     */
    getRenderTarget() {
        return this;
    }
    /**
     * Extracts and transforms the component-specific state from the global Redux store.
     * Subclasses can optionally override this method to select only the state slice they need,
     * enabling efficient re-renders and component isolation.
     * By default, returns the entire Redux state.
     * @param {Object} reduxState - the entire state of the redux store 
     * @returns {Object} - a slice of the redux state that is relevant for this component
     */
    extractState(reduxState) {
        return reduxState;
    }

    /**
     * @abstract
     * @returns {any} - the template to render
     */
    view() {  }

}
