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

    connectedCallback() {
        console.group(this.log('connectedCallback'))
        this.unsubscribe = store.subscribe(_ => this.triggerViewUpdate());
        console.log('subscribed for redux changes');
        this.triggerViewUpdate();
        console.groupEnd();
    }

    disconnectedCallback() {
        console.group(this.log('disconnectedCallback'))
        this.unsubscribe();
        console.log('unsubscribe called');
        console.groupEnd();
    }

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

    getRenderTarget() {
        return this;
    }
    /**
     * 
     * @param {Object} reduxState - the entire state of the redux store 
     * @returns - a slice of the redux state that is relevant for this component
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
