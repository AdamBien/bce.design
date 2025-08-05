/**
 * Redux store configuration with automatic localStorage persistence.
 * The entire application state is persisted to localStorage on every update,
 * enabling state recovery across browser sessions.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
 */
import { configureStore } from "./libs/redux-toolkit.modern.js";
import { load } from "./localstorage/control/StorageControl.js";
import { bookmarks } from "./bookmarks/entity/BookmarksReducer.js"

const reducer = {
    bookmarks
}
const preloadedState = load();
const config = preloadedState ? { reducer, preloadedState } : {reducer};
const store = configureStore(config);
export default store;