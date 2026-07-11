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

export const editBookmarkAction = createAction("editBookmarkAction");

/**
 * Loads the bookmark with the given id from the list into the temporal
 * cache for editing. Route parameters arrive as attribute strings — the id
 * is converted back to the numeric form used in the list. A missing id
 * resets the cache, yielding an empty form.
 * @param {string|null} id bookmark id from the route parameter
 */
export const editBookmark = (id) => {
    store.dispatch(editBookmarkAction(Number(id)));
}

export const saveBookmarkAction = createAction("saveBookmarkAction");
export const saveBookmark = _ => {
    const id = Date.now();
    store.dispatch(saveBookmarkAction(id));
}

export const deleteBookmarkAction = createAction("deleteBookmarkAction");
export const deleteBookmark = (id) => {
    store.dispatch(deleteBookmarkAction(id));
}