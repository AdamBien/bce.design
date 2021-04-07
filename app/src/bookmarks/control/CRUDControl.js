import { createAction } from "../../libs/redux-toolkit.esm.js";
import store from "../../store.js";

export const bookmarkUpdatedAction = createAction("bookmarkUpdatedAction");
export const bookmarkUpdated = (name, value) => {
    store.dispatch(bookmarkUpdatedAction({name,value}));
}

export const newBookmarkAction = createAction("newBookmarkAction");
export const newBookmark = _ => {
    const id = Date.now();
    store.dispatch(newBookmarkAction(id));
}

export const deleteBookmarkAction = createAction("deleteBookmarkAction");
export const deleteBookmark = (id) => {
    store.dispatch(deleteBookmarkAction(id));
}