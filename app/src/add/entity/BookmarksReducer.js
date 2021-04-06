import { createReducer } from "../../libs/redux-toolkit.esm.js"
import { bookmarkUpdatedAction } from "../control/AddControl.js";

const initialState = {
    list: [],
    bookmark:{}
}

export const bookmarks = createReducer(initialState, (builder) => {
    builder.addCase(bookmarkUpdatedAction, (state, { payload: { name, value } }) => {
        state.bookmark[name] = value;
    });
})