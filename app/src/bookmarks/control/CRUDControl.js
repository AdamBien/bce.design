import { createAction } from "@reduxjs/toolkit";
import store from "../../store.js";

export const bookmarkUpdatedAction = createAction("bookmarkUpdatedAction");

/**
 * Links entered without a scheme (e.g. "airhacks.fm") would resolve
 * relative to the app origin — prepend https:// to keep them absolute.
 * @param {string} link user-entered bookmark link
 * @returns {string} absolute URL
 */
const normalizeLink = link => URL.canParse(link) ? link : `https://${link}`;

export const bookmarkUpdated = (name, value) => {
    if (name === "link") value = normalizeLink(value);
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