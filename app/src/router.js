/**
 * Minimal, standards-based client-side router.
 * URLPattern matches routes and the Navigation API intercepts same-origin
 * navigations (link clicks, back / forward) with built-in focus and scroll handling.
 * Non-matching URLs fall through to regular browser navigation.
 * Reloads also fire an interceptable navigate event — intercepting would turn
 * them into same-document re-renders with stale modules and in-memory state,
 * so they are skipped and reach the browser as full document reloads.
 */
export const initRouter = (outlet, routeConfig) => {
    const routes = routeConfig.map(({ path, component }) => ({
        pattern: new URLPattern({ pathname: path }),
        component
    }));

    const render = url => {
        const route = routes.find(({ pattern }) => pattern.test(url));
        if (!route) return false;
        var routeComponent = document.createElement(route.component);
        outlet.replaceChildren(routeComponent);
        return true;
    };

    navigation.addEventListener('navigate', event => {
        if (!event.canIntercept || event.hashChange || event.downloadRequest) return;
        if (event.navigationType === 'reload') return;
        const url = new URL(event.destination.url);
        if (!routes.some(({ pattern }) => pattern.test(url))) return;
        event.intercept({ handler: () => render(url) });
    });

    render(new URL(location.href));
}
