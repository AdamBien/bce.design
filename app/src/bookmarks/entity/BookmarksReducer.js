import { createReducer } from "../../libs/redux-toolkit.modern.js"
import { bookmarkUpdatedAction, deleteBookmarkAction, newBookmarkAction } from "../control/CRUDControl.js";

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
 * Maintains a list of bookmarks and a temporal cache for bookmark creation.
 * Updates flow through the cached bookmark object before being committed
 * to the list upon save. Supports incremental field updates, creation,
 * and deletion operations.
 */
export const bookmarks = createReducer(initialState, (builder) => {
    builder.addCase(bookmarkUpdatedAction, (state, { payload: { name, value } }) => {
        state.bookmark[name] = value;
    }).addCase(newBookmarkAction, (state, { payload }) => {
        state.bookmark["id"] = payload;
        state.list = state.list.concat(state.bookmark);
    }).addCase(deleteBookmarkAction, (state, { payload }) => {
        state.list = removeBookmarkWithId(state.list,payload);
    });
})