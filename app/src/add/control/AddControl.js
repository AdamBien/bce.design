import { createAction } from "../../libs/redux-toolkit.esm.js";
import store from "../../store.js";

export const bookmarkUpdatedAction = createAction("bookmarkUpdatedAction");
export const bookmarkUpdated = (name, value) => {
    store.dispatch(bookmarkUpdatedAction({name,value}));
}
