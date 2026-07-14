/**
 * reduction: a minimal redux.
 *
 * Minimalistic, standards-based implementation of the Redux Toolkit API
 * surface used by this application: {@link configureStore},
 * {@link createAction} and {@link createReducer}. Immutability comes from
 * the structuredClone() web standard instead of Immer: each case handler
 * receives a deep clone of the current state and may mutate it freely, or
 * return a replacement state.
 *
 * The active implementation is selected in the importmap (index.html):
 * "@reduxjs/toolkit" resolves either to this file or to
 * /libs/redux-toolkit.modern.js — the application code is identical for both.
 *
 * @see {@link https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone|WHATWG HTML: structuredClone()}
 * @see {@link https://redux-toolkit.js.org/|Redux Toolkit (the emulated API)}
 */

/**
 * Composes a map of slice reducers into a single root reducer, mirroring
 * Redux's combineReducers. On every action, each slice reducer is invoked
 * with its own state slice and the action; the results are reassembled into
 * a new state object keyed by slice name. Slices whose reducer returns the
 * same reference stay untouched — there is no dirty checking, the object is
 * rebuilt on each dispatch.
 *
 * @param {Object.<string, Function>} reducers - map of slice name to slice reducer
 * @returns {Function} a root reducer `(state = {}, action) => nextState`
 *   delegating each state slice to its reducer
 * @see {@link https://redux.js.org/api/combinereducers|Redux: combineReducers}
 */
const combineReducers = (reducers) => (state = {}, action) =>
    Object.fromEntries(Object.entries(reducers)
        .map(([slice, reducer]) => [slice, reducer(state[slice], action)]));

/**
 * Creates the single application store, mirroring Redux Toolkit's
 * configureStore (without middleware and devtools support).
 *
 * The `reducer` option is either a ready-made root reducer function or a
 * map of slice reducers, which is combined via {@link combineReducers}.
 * The initial state is computed by dispatching a Redux-style `@@INIT`
 * action, so every slice reducer falls back to its declared default state
 * unless `preloadedState` provides one.
 *
 * The returned store exposes the classic Redux trio:
 * - `getState()` returns the current state tree.
 * - `dispatch(action)` runs the root reducer, notifies all subscribers,
 *   and returns the action.
 * - `subscribe(listener)` registers a change listener and returns an
 *   unsubscribe function. Listeners are held in a Set, so double
 *   subscription of the same function is a no-op.
 *
 * Diagnostics: when the Redux DevTools browser extension is installed, the
 * store connects to it and reports the initial state and every dispatched
 * action with the resulting state — inspectable in the extension's Redux
 * panel (action log, payloads, state tree, diffs). Without the extension
 * this is a no-op; time travel is not supported.
 *
 * @param {{reducer: (Function|Object.<string, Function>), preloadedState?: Object}} config
 * @returns {{getState: Function, dispatch: Function, subscribe: Function}} the store
 * @see {@link https://redux-toolkit.js.org/api/configureStore|Redux Toolkit: configureStore}
 * @see {@link https://redux.js.org/api/store|Redux: Store methods}
 * @see {@link https://github.com/reduxjs/redux-devtools|Redux DevTools extension}
 */
export const configureStore = ({ reducer, preloadedState }) => {
    const rootReducer = typeof reducer === 'function' ? reducer : combineReducers(reducer);
    let state = rootReducer(preloadedState, { type: '@@INIT' });
    const devTools = globalThis.__REDUX_DEVTOOLS_EXTENSION__?.connect({ name: 'reduction' });
    devTools?.init(state);
    const listeners = new Set();
    return {
        getState: () => state,
        dispatch(action) {
            state = rootReducer(state, action);
            devTools?.send(action, state);
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
 * Creates an action creator for the given type, mirroring Redux Toolkit's
 * createAction. Calling the returned function produces a Flux Standard
 * Action: `{ type, payload }`.
 *
 * The creator additionally carries the type as a static `type` property and
 * overrides `toString()` to return it — this is what allows passing the
 * creator itself (instead of a type string) to
 * {@link createReducer}'s `builder.addCase`.
 *
 * @param {string} type - the action type
 * @returns {Function} an action creator `(payload) => ({type, payload})`
 *   carrying the type as property
 * @see {@link https://redux-toolkit.js.org/api/createAction|Redux Toolkit: createAction}
 * @see {@link https://github.com/redux-utilities/flux-standard-action|Flux Standard Action}
 */
export const createAction = (type) => {
    const actionCreator = (payload) => ({ type, payload });
    actionCreator.type = type;
    actionCreator.toString = () => type;
    return actionCreator;
};

/**
 * Creates a reducer from case handlers, mirroring Redux Toolkit's
 * createReducer with the builder callback notation. `builder.addCase`
 * accepts an action creator from {@link createAction} (its `type` property
 * is used as key) or a plain type string, and is chainable.
 *
 * The resulting reducer looks up the handler for `action.type`:
 * - No handler registered: the current state is returned unchanged.
 * - Handler registered: it receives a deep copy of the state produced by
 *   the structuredClone() web standard — the "draft" it may mutate freely
 *   without affecting the previous state (Redux Toolkit uses Immer for the
 *   same effect). The handler's return value becomes the next state; if it
 *   returns nothing (undefined/null), the mutated draft is used.
 *
 * Note: structuredClone only supports serializable values — state must be
 * plain data (no functions, DOM nodes or class instances), which Redux
 * requires anyway.
 *
 * @param {Object} initialState - state used until a preloaded or reduced state exists
 * @param {Function} builderCallback - receives a builder with addCase(actionCreator, handler)
 * @returns {Function} the reducer `(state = initialState, action) => nextState`
 * @see {@link https://redux-toolkit.js.org/api/createReducer|Redux Toolkit: createReducer}
 * @see {@link https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone|WHATWG HTML: structuredClone()}
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
