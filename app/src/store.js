import { configureStore } from "./libs/redux-toolkit.esm.js";
import { load } from "./localstorage/control/StorageControl.js";
import { bookmarks } from "./bookmarks/entity/BookmarksReducer.js"

const reducer = {
    bookmarks
}
const preloadedState = load();
const config = preloadedState ? { reducer, preloadedState } : {reducer};
const store = configureStore(config);
export default store;