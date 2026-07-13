/**
 * reduction: a minimal redux.
 *
 * Minimalistic, standards-based implementation of the Redux Toolkit API
 * surface used by this application: configureStore, createAction and
 * createReducer. Immutability comes from the structuredClone() web standard
 * instead of Immer: each case handler receives a clone of the current state
 * and may mutate it freely, or return a replacement state.
 *
 * The active implementation is selected in the importmap (index.html):
 * "@reduxjs/toolkit" resolves either to this file or to
 * /libs/redux-toolkit.modern.js — the application code is identical for both.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone}
 */

/**
 * @param {Object.<string, Function>} reducers - map of slice name to slice reducer
 * @returns {Function} a root reducer delegating each state slice to its reducer
 */
const combineReducers = (reducers) => (state = {}, action) =>
    Object.fromEntries(Object.entries(reducers)
        .map(([slice, reducer]) => [slice, reducer(state[slice], action)]));

/**
 * @param {{reducer: (Function|Object.<string, Function>), preloadedState?: Object}} config
 * @returns {{getState: Function, dispatch: Function, subscribe: Function}} the store
 */
export const configureStore = ({ reducer, preloadedState }) => {
    const rootReducer = typeof reducer === 'function' ? reducer : combineReducers(reducer);
    let state = rootReducer(preloadedState, { type: '@@INIT' });
    const listeners = new Set();
    return {
        getState: () => state,
        dispatch(action) {
            state = rootReducer(state, action);
            listeners.forEach(listener => listener());
            return action;
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
};

/**
 * @param {string} type - the action type
 * @returns {Function} an action creator carrying the type as property
 */
export const createAction = (type) => {
    const actionCreator = (payload) => ({ type, payload });
    actionCreator.type = type;
    actionCreator.toString = () => type;
    return actionCreator;
};

/**
 * @param {Object} initialState
 * @param {Function} builderCallback - receives a builder with addCase(actionCreator, handler)
 * @returns {Function} the reducer; handlers mutate a structuredClone of the state
 */
export const createReducer = (initialState, builderCallback) => {
    const cases = {};
    const builder = {
        addCase(actionCreator, handler) {
            cases[actionCreator.type ?? actionCreator] = handler;
            return builder;
        }
    };
    builderCallback(builder);
    return (state = initialState, action) => {
        const handler = cases[action.type];
        if (!handler) return state;
        const draft = structuredClone(state);
        return handler(draft, action) ?? draft;
    };
};
