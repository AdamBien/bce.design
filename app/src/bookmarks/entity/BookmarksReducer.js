import { createReducer } from "@reduxjs/toolkit"
import { bookmarkUpdatedAction, deleteBookmarkAction, editBookmarkAction, saveBookmarkAction } from "../control/CRUDControl.js";

const initialState = {
    list: [],
    bookmark:{}
}

const removeBookmarkWithId = (list, id) => {
    return list.filter(bookmark => bookmark.id !== id);
}

/**
 * Redux reducer managing bookmark state transitions.
 *
 * Maintains a list of bookmarks and a temporal cache for bookmark creation
 * and editing. Updates flow through the cached bookmark object before being
 * committed to the list upon save: a cached bookmark with an id replaces its
 * list entry, one without is appended as a new bookmark. Editing copies the
 * list entry with the given id into the cache; an unknown id resets the cache.
 */
export const bookmarks = createReducer(initialState, (builder) => {
    builder.addCase(bookmarkUpdatedAction, (state, { payload: { name, value } }) => {
        state.bookmark[name] = value;
    }).addCase(editBookmarkAction, (state, { payload }) => {
        const existing = state.list.find(({ id }) => id === payload);
        state.bookmark = existing ? { ...existing } : {};
    }).addCase(saveBookmarkAction, (state, { payload }) => {
        if (state.bookmark.id) {
            state.list = state.list.map(bookmark =>
                bookmark.id === state.bookmark.id ? state.bookmark : bookmark);
        } else {
            state.bookmark["id"] = payload;
            state.list = state.list.concat(state.bookmark);
        }
    }).addCase(deleteBookmarkAction, (state, { payload }) => {
        state.list = removeBookmarkWithId(state.list,payload);
    });
})