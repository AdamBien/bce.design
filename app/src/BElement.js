import { render } from "./libs/lit-html.js";
import store from "./store.js";

export default class BElement extends HTMLElement { 

    constructor() { 
        super();
        this.state = {};
    }

    log(methodName) { 
        return `${this.constructor.name}.${methodName}`
    }

    connectedCallback() { 
        console.group(this.log('connectedCallback'))
        this.unsubscribe = store.subscribe(_ => this.triggerViewUpdate());
        console.log('subscribed for redux changes');
        this.triggerViewUpdate();
        console.groupEnd(this.log('connectedCallback'));
    }

    disconnectedCallback() { 
        console.group(this.log('disconnectedCallback'))
        this.unsubscribe();
        console.log('unsubscribe called');
        console.groupEnd(this.log('disconnectedCallback'))
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
        console.groupEnd(this.log('triggerViewUpdate'));
    }

    getRenderTarget() { 
        return this;
    }

    extractState(reduxState) { 
        return reduxState;
    }

    view() { }

}
