/**
 * Minimal, standards-based client-side router.
 * URLPattern matches routes and the Navigation API intercepts same-origin
 * navigations (link clicks, back / forward) with built-in focus and scroll handling.
 * Non-matching URLs fall through to regular browser navigation.
 */
export const initRouter = (outlet, routeConfig) => {
    const routes = routeConfig.map(({ path, component }) => ({
        pattern: new URLPattern({ pathname: path }),
        component
    }));

    const render = url => {
        const route = routes.find(({ pattern }) => pattern.test(url));
        if (!route) return false;
        outlet.replaceChildren(document.createElement(route.component));
        return true;
    };

    navigation.addEventListener('navigate', event => {
        if (!event.canIntercept || event.hashChange || event.downloadRequest) return;
        const url = new URL(event.destination.url);
        if (!routes.some(({ pattern }) => pattern.test(url))) return;
        event.intercept({ handler: () => render(url) });
    });

    render(new URL(location.href));
}
