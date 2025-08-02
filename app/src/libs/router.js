/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    var isSafe = function (value) {
        for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
            var char = delimiter_1[_i];
            if (value.indexOf(char) > -1)
                return true;
        }
        return false;
    };
    var safePattern = function (prefix) {
        var prev = result[result.length - 1];
        var prevText = prefix || (prev && typeof prev === "string" ? prev : "");
        if (prev && !prevText) {
            throw new TypeError("Must have text between two parameters, missing text after \"".concat(prev.name, "\""));
        }
        if (!prevText || isSafe(prevText))
            return "[^".concat(escapeString(delimiter), "]+?");
        return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || safePattern(prefix),
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
        }
        return path;
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        return path;
    var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    var index = 0;
    var execResult = groupsRegex.exec(path.source);
    while (execResult) {
        keys.push({
            // Use parenthesized substring match if available, index otherwise
            name: execResult[1] || index++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: "",
        });
        execResult = groupsRegex.exec(path.source);
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
    return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
    var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
    var delimiterRe = "[".concat(escapeString(delimiter), "]");
    var route = start ? "^" : "";
    // Iterate over the tokens and create our regexp string.
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (typeof token === "string") {
            route += escapeString(encode(token));
        }
        else {
            var prefix = escapeString(encode(token.prefix));
            var suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys)
                    keys.push(token);
                if (prefix || suffix) {
                    if (token.modifier === "+" || token.modifier === "*") {
                        var mod = token.modifier === "*" ? "?" : "";
                        route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
                    }
                    else {
                        route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
                    }
                }
                else {
                    if (token.modifier === "+" || token.modifier === "*") {
                        throw new TypeError("Can not repeat \"".concat(token.name, "\" without a prefix and suffix"));
                    }
                    route += "(".concat(token.pattern, ")").concat(token.modifier);
                }
            }
            else {
                route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
            }
        }
    }
    if (end) {
        if (!strict)
            route += "".concat(delimiterRe, "?");
        route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
    }
    else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string"
            ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
            : endToken === undefined;
        if (!strict) {
            route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
        }
        if (!isEndDelimited) {
            route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
        }
    }
    return new RegExp(route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp)
        return regexpToRegexp(path, keys);
    if (Array.isArray(path))
        return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
}

function isObject(o) {
  return typeof o === "object" && !!o;
}
function isFunction(f) {
  return typeof f === "function";
}
function isString(s) {
  return typeof s === "string";
}
function toArray(value = []) {
  return Array.isArray(value) ? value : [value];
}
function log(msg) {
  return `[Vaadin.Router] ${msg}`;
}
class NotFoundError extends Error {
  code;
  context;
  constructor(context) {
    super(log(`Page not found (${context.pathname})`));
    this.context = context;
    this.code = 404;
  }
}
const notFoundResult = Symbol("NotFoundResult");
function getNotFoundError(context) {
  return new NotFoundError(context);
}
function resolvePath(path) {
  return (Array.isArray(path) ? path[0] : path) ?? "";
}
function getRoutePath$1(route) {
  return resolvePath(route?.path);
}
function unwrapChildren(children) {
  return Array.isArray(children) && children.length > 0 ? children : void 0;
}

const cache = /* @__PURE__ */ new Map();
cache.set("|false", {
  keys: [],
  pattern: /(?:)/u
});
function decodeParam(val) {
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}
function matchPath(routePath, path, exact = false, parentKeys = [], parentParams) {
  const cacheKey = `${routePath}|${String(exact)}`;
  const _path = resolvePath(path);
  let regexp = cache.get(cacheKey);
  if (!regexp) {
    const keys = [];
    regexp = {
      keys,
      pattern: pathToRegexp(routePath, keys, {
        end: exact,
        strict: routePath === ""
      })
    };
    cache.set(cacheKey, regexp);
  }
  const m = regexp.pattern.exec(_path);
  if (!m) {
    return null;
  }
  const params = { ...parentParams };
  for (let i = 1; i < m.length; i++) {
    const key = regexp.keys[i - 1];
    const prop = key.name;
    const value = m[i];
    if (value !== void 0 || !Object.hasOwn(params, prop)) {
      if (key.modifier === "+" || key.modifier === "*") {
        params[prop] = value ? value.split(/[/?#]/u).map(decodeParam) : [];
      } else {
        params[prop] = value ? decodeParam(value) : value;
      }
    }
  }
  return {
    keys: [...parentKeys, ...regexp.keys],
    params,
    path: m[0]
  };
}
var matchPath_default = matchPath;

function matchRoute(route, pathname, ignoreLeadingSlash, parentKeys, parentParams) {
  let match;
  let childMatches;
  let childIndex = 0;
  let routepath = getRoutePath$1(route);
  if (routepath.startsWith("/")) {
    if (ignoreLeadingSlash) {
      routepath = routepath.substring(1);
    }
    ignoreLeadingSlash = true;
  }
  return {
    next(routeToSkip) {
      if (route === routeToSkip) {
        return { done: true, value: void 0 };
      }
      route.__children ??= unwrapChildren(route.children);
      const children = route.__children ?? [];
      const exact = !route.__children && !route.children;
      if (!match) {
        match = matchPath_default(routepath, pathname, exact, parentKeys, parentParams);
        if (match) {
          return {
            value: {
              keys: match.keys,
              params: match.params,
              path: match.path,
              route
            }
          };
        }
      }
      if (match && children.length > 0) {
        while (childIndex < children.length) {
          if (!childMatches) {
            const childRoute = children[childIndex];
            childRoute.parent = route;
            let matchedLength = match.path.length;
            if (matchedLength > 0 && pathname.charAt(matchedLength) === "/") {
              matchedLength += 1;
            }
            childMatches = matchRoute(
              childRoute,
              pathname.substring(matchedLength),
              ignoreLeadingSlash,
              match.keys,
              match.params
            );
          }
          const childMatch = childMatches.next(routeToSkip);
          if (!childMatch.done) {
            return {
              done: false,
              value: childMatch.value
            };
          }
          childMatches = null;
          childIndex += 1;
        }
      }
      return { done: true, value: void 0 };
    }
  };
}
var matchRoute_default = matchRoute;

function resolveRoute(context) {
  if (isFunction(context.route.action)) {
    return context.route.action(context);
  }
  return void 0;
}

function isDescendantRoute(route, maybeParent) {
  let _route = route;
  while (_route) {
    _route = _route.parent;
    if (_route === maybeParent) {
      return true;
    }
  }
  return false;
}
function isRouteContext(value) {
  return !!value && typeof value === "object" && "next" in value && "params" in value && "result" in value && "route" in value;
}
class ResolutionError extends Error {
  code;
  context;
  constructor(context, options) {
    let errorMessage = `Path '${context.pathname}' is not properly resolved due to an error.`;
    const routePath = getRoutePath$1(context.route);
    if (routePath) {
      errorMessage += ` Resolution had failed on route: '${routePath}'`;
    }
    super(errorMessage, options);
    this.code = options?.code;
    this.context = context;
  }
  warn() {
    console.warn(this.message);
  }
}
function updateChainForRoute(context, match) {
  const { path, route } = match;
  if (route && !route.__synthetic) {
    const item = { path, route };
    if (route.parent && context.chain) {
      for (let i = context.chain.length - 1; i >= 0; i--) {
        if (context.chain[i].route === route.parent) {
          break;
        }
        context.chain.pop();
      }
    }
    context.chain?.push(item);
  }
}
class Resolver {
  /**
   * The base URL for all routes in the router instance. By default,
   * if the base element exists in the `<head>`, vaadin-router
   * takes the `<base href>` attribute value, resolved against the current
   * `document.URL`.
   */
  baseUrl;
  #context;
  errorHandler;
  resolveRoute;
  #root;
  constructor(routes, { baseUrl = "", context, errorHandler, resolveRoute: resolveRoute$1 = resolveRoute } = {}) {
    if (Object(routes) !== routes) {
      throw new TypeError("Invalid routes");
    }
    this.baseUrl = baseUrl;
    this.errorHandler = errorHandler;
    this.resolveRoute = resolveRoute$1;
    if (Array.isArray(routes)) {
      this.#root = {
        __children: routes,
        __synthetic: true,
        action: () => void 0,
        path: ""
      };
    } else {
      this.#root = { ...routes, parent: void 0 };
    }
    this.#context = {
      ...context,
      hash: "",
      // eslint-disable-next-line @typescript-eslint/require-await
      async next() {
        return notFoundResult;
      },
      params: {},
      pathname: "",
      resolver: this,
      route: this.#root,
      search: "",
      chain: []
    };
  }
  get root() {
    return this.#root;
  }
  get context() {
    return this.#context;
  }
  /**
   * If the baseUrl property is set, transforms the baseUrl and returns the full
   * actual `base` string for using in the `new URL(path, base);` and for
   * prepernding the paths with. The returned base ends with a trailing slash.
   *
   * Otherwise, returns empty string.
   */
  get __effectiveBaseUrl() {
    return this.baseUrl ? new URL(this.baseUrl, document.baseURI || document.URL).href.replace(/[^/]*$/u, "") : "";
  }
  /**
   * Returns the current list of routes (as a shallow copy). Adding / removing
   * routes to / from the returned array does not affect the routing config,
   * but modifying the route objects does.
   *
   * @public
   */
  getRoutes() {
    return [...this.#root.__children ?? []];
  }
  /**
   * Removes all existing routes from the routing config.
   *
   * @public
   */
  removeRoutes() {
    this.#root.__children = [];
  }
  /**
   * Asynchronously resolves the given pathname, i.e. finds all routes matching
   * the pathname and tries resolving them one after another in the order they
   * are listed in the routes config until the first non-null result.
   *
   * Returns a promise that is fulfilled with the return value of an object that consists of the first
   * route handler result that returns something other than `null` or `undefined` and context used to get this result.
   *
   * If no route handlers return a non-null result, or if no route matches the
   * given pathname the returned promise is rejected with a 'page not found'
   * `Error`.
   *
   * @param pathnameOrContext - the pathname to
   *    resolve or a context object with a `pathname` property and other
   *    properties to pass to the route resolver functions.
   */
  async resolve(pathnameOrContext) {
    const self = this;
    const context = {
      ...this.#context,
      ...isString(pathnameOrContext) ? { pathname: pathnameOrContext } : pathnameOrContext,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      next
    };
    const match = matchRoute_default(
      this.#root,
      this.__normalizePathname(context.pathname) ?? context.pathname,
      !!this.baseUrl
    );
    const resolve = this.resolveRoute;
    let matches = null;
    let nextMatches = null;
    let currentContext = context;
    async function next(resume = false, parent = matches?.value?.route, prevResult) {
      const routeToSkip = prevResult === null ? matches?.value?.route : void 0;
      matches = nextMatches ?? match.next(routeToSkip);
      nextMatches = null;
      if (!resume) {
        if (!!matches.done || !isDescendantRoute(matches.value.route, parent)) {
          nextMatches = matches;
          return notFoundResult;
        }
      }
      if (matches.done) {
        throw getNotFoundError(context);
      }
      currentContext = {
        ...context,
        params: matches.value.params,
        route: matches.value.route,
        chain: currentContext.chain?.slice()
      };
      updateChainForRoute(currentContext, matches.value);
      const resolution = await resolve(currentContext);
      if (resolution !== null && resolution !== void 0 && resolution !== notFoundResult) {
        currentContext.result = isRouteContext(resolution) ? resolution.result : resolution;
        self.#context = currentContext;
        return currentContext;
      }
      return await next(resume, parent, resolution);
    }
    try {
      return await next(true, this.#root);
    } catch (error) {
      const _error = error instanceof NotFoundError ? error : new ResolutionError(currentContext, { code: 500, cause: error });
      if (this.errorHandler) {
        currentContext.result = this.errorHandler(_error);
        return currentContext;
      }
      throw error;
    }
  }
  /**
   * Sets the routing config (replacing the existing one).
   *
   * @param routes - a single route or an array of those
   *    (the array is shallow copied)
   */
  setRoutes(routes) {
    this.#root.__children = [...toArray(routes)];
  }
  /**
   * If the baseUrl is set, matches the pathname with the router’s baseUrl,
   * and returns the local pathname with the baseUrl stripped out.
   *
   * If the pathname does not match the baseUrl, returns undefined.
   *
   * If the `baseUrl` is not set, returns the unmodified pathname argument.
   */
  __normalizePathname(pathname) {
    if (!this.baseUrl) {
      return pathname;
    }
    const base = this.__effectiveBaseUrl;
    const url = pathname.startsWith("/") ? new URL(base).origin + pathname : `./${pathname}`;
    const normalizedUrl = new URL(url, base).href;
    if (normalizedUrl.startsWith(base)) {
      return normalizedUrl.slice(base.length);
    }
    return void 0;
  }
  /**
   * Appends one or several routes to the routing config and returns the
   * effective routing config after the operation.
   *
   * @param routes - a single route or an array of those
   *    (the array is shallow copied)
   */
  addRoutes(routes) {
    this.#root.__children = [...this.#root.__children ?? [], ...toArray(routes)];
    return this.getRoutes();
  }
}

function cacheRoutes(routesByName, route, routes, cacheKeyProvider) {
  const name = route.name ?? cacheKeyProvider?.(route);
  if (name) {
    if (routesByName.has(name)) {
      routesByName.get(name)?.push(route);
    } else {
      routesByName.set(name, [route]);
    }
  }
  if (Array.isArray(routes)) {
    for (const childRoute of routes) {
      childRoute.parent = route;
      cacheRoutes(routesByName, childRoute, childRoute.__children ?? childRoute.children, cacheKeyProvider);
    }
  }
}
function getRouteByName(routesByName, routeName) {
  const routes = routesByName.get(routeName);
  if (routes) {
    if (routes.length > 1) {
      throw new Error(`Duplicate route with name "${routeName}". Try seting unique 'name' route properties.`);
    }
    return routes[0];
  }
  return void 0;
}
function generateUrls(resolver, options = {}) {
  if (!(resolver instanceof Resolver)) {
    throw new TypeError("An instance of Resolver is expected");
  }
  const cache = /* @__PURE__ */ new Map();
  const routesByName = /* @__PURE__ */ new Map();
  return (routeName, params) => {
    let route = getRouteByName(routesByName, routeName);
    if (!route) {
      routesByName.clear();
      cacheRoutes(routesByName, resolver.root, resolver.root.__children, options.cacheKeyProvider);
      route = getRouteByName(routesByName, routeName);
      if (!route) {
        throw new Error(`Route "${routeName}" not found`);
      }
    }
    let cached = route.fullPath ? cache.get(route.fullPath) : void 0;
    if (!cached) {
      let fullPath = getRoutePath$1(route);
      let rt = route.parent;
      while (rt) {
        const path = getRoutePath$1(rt);
        if (path) {
          fullPath = `${path.replace(/\/$/u, "")}/${fullPath.replace(/^\//u, "")}`;
        }
        rt = rt.parent;
      }
      const tokens = parse(fullPath);
      const keys = /* @__PURE__ */ Object.create(null);
      for (const item of tokens) {
        if (!isString(item)) {
          keys[item.name] = true;
        }
      }
      cached = { keys, tokens };
      cache.set(fullPath, cached);
      route.fullPath = fullPath;
    }
    const toPath = tokensToFunction(cached.tokens, { encode: encodeURIComponent, ...options });
    let url = toPath(params) || "/";
    if (options.stringifyQueryParams && params) {
      const queryParams = {};
      for (const [key, value] of Object.entries(params)) {
        if (!(key in cached.keys) && value) {
          queryParams[key] = value;
        }
      }
      const query = options.stringifyQueryParams(queryParams);
      if (query) {
        url += query.startsWith("?") ? query : `?${query}`;
      }
    }
    return url;
  };
}
var generateUrls_default = generateUrls;

const DEV_MODE_CODE_REGEXP =
  /\/\*[\*!]\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i;

const FlowClients = window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients;

function isMinified() {
  function test() {
    /** vaadin-dev-mode:start
    return false;
    vaadin-dev-mode:end **/
    return true;
  }
  return uncommentAndRun(test);
}

function isDevelopmentMode() {
  try {
    if (isForcedDevelopmentMode()) {
      return true;
    }

    if (!isLocalhost()) {
      return false;
    }

    if (FlowClients) {
      return !isFlowProductionMode();
    }

    return !isMinified();
  } catch (e) {
    // Some error in this code, assume production so no further actions will be taken
    return false;
  }
}

function isForcedDevelopmentMode() {
  return localStorage.getItem("vaadin.developmentmode.force");
}

function isLocalhost() {
  return (["localhost","127.0.0.1"].indexOf(window.location.hostname) >= 0);
}

function isFlowProductionMode() {
  if (FlowClients) {
    const productionModeApps = Object.keys(FlowClients)
      .map(key => FlowClients[key])
      .filter(client => client.productionMode);
    if (productionModeApps.length > 0) {
      return true;
    }
  }
  return false;
}

function uncommentAndRun(callback, args) {
  if (typeof callback !== 'function') {
    return;
  }

  const match = DEV_MODE_CODE_REGEXP.exec(callback.toString());
  if (match) {
    try {
      // requires CSP: script-src 'unsafe-eval'
      callback = new Function(match[1]);
    } catch (e) {
      // eat the exception
      console.log('vaadin-development-mode-detector: uncommentAndRun() failed', e);
    }
  }

  return callback(args);
}

// A guard against polymer-modulizer removing the window.Vaadin
// initialization above.
window['Vaadin'] = window['Vaadin'] || {};

/**
 * Inspects the source code of the given `callback` function for
 * specially-marked _commented_ code. If such commented code is found in the
 * callback source, uncomments and runs that code instead of the callback
 * itself. Otherwise runs the callback as is.
 *
 * The optional arguments are passed into the callback / uncommented code,
 * the result is returned.
 *
 * See the `isMinified()` function source code in this file for an example.
 *
 */
const runIfDevelopmentMode = function(callback, args) {
  if (window.Vaadin.developmentMode) {
    return uncommentAndRun(callback, args);
  }
};

if (window.Vaadin.developmentMode === undefined) {
  window.Vaadin.developmentMode = isDevelopmentMode();
}

/* This file is autogenerated from src/vaadin-usage-statistics.tpl.html */
/*

This script gathers usage statistics from the application running in development mode.

Statistics gathering is automatically disabled and excluded from production builds.

For details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.

*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/

function maybeGatherAndSendStats() {
  /*! vaadin-dev-mode:start
  (function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var getPolymerVersion = function getPolymerVersion() {
  return window.Polymer && window.Polymer.version;
};

var StatisticsGatherer = function () {
  function StatisticsGatherer(logger) {
    classCallCheck(this, StatisticsGatherer);

    this.now = new Date().getTime();
    this.logger = logger;
  }

  createClass(StatisticsGatherer, [{
    key: 'frameworkVersionDetectors',
    value: function frameworkVersionDetectors() {
      return {
        'Flow': function Flow() {
          if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
            var flowVersions = Object.keys(window.Vaadin.Flow.clients).map(function (key) {
              return window.Vaadin.Flow.clients[key];
            }).filter(function (client) {
              return client.getVersionInfo;
            }).map(function (client) {
              return client.getVersionInfo().flow;
            });
            if (flowVersions.length > 0) {
              return flowVersions[0];
            }
          }
        },
        'Vaadin Framework': function VaadinFramework() {
          if (window.vaadin && window.vaadin.clients) {
            var frameworkVersions = Object.values(window.vaadin.clients).filter(function (client) {
              return client.getVersionInfo;
            }).map(function (client) {
              return client.getVersionInfo().vaadinVersion;
            });
            if (frameworkVersions.length > 0) {
              return frameworkVersions[0];
            }
          }
        },
        'AngularJs': function AngularJs() {
          if (window.angular && window.angular.version && window.angular.version) {
            return window.angular.version.full;
          }
        },
        'Angular': function Angular() {
          if (window.ng) {
            var tags = document.querySelectorAll("[ng-version]");
            if (tags.length > 0) {
              return tags[0].getAttribute("ng-version");
            }
            return "Unknown";
          }
        },
        'Backbone.js': function BackboneJs() {
          if (window.Backbone) {
            return window.Backbone.VERSION;
          }
        },
        'React': function React() {
          var reactSelector = '[data-reactroot], [data-reactid]';
          if (!!document.querySelector(reactSelector)) {
            // React does not publish the version by default
            return "unknown";
          }
        },
        'Ember': function Ember() {
          if (window.Em && window.Em.VERSION) {
            return window.Em.VERSION;
          } else if (window.Ember && window.Ember.VERSION) {
            return window.Ember.VERSION;
          }
        },
        'jQuery': function (_jQuery) {
          function jQuery() {
            return _jQuery.apply(this, arguments);
          }

          jQuery.toString = function () {
            return _jQuery.toString();
          };

          return jQuery;
        }(function () {
          if (typeof jQuery === 'function' && jQuery.prototype.jquery !== undefined) {
            return jQuery.prototype.jquery;
          }
        }),
        'Polymer': function Polymer() {
          var version = getPolymerVersion();
          if (version) {
            return version;
          }
        },
        'LitElement': function LitElement() {
          var version = window.litElementVersions && window.litElementVersions[0];
          if (version) {
            return version;
          }
        },
        'LitHtml': function LitHtml() {
          var version = window.litHtmlVersions && window.litHtmlVersions[0];
          if (version) {
            return version;
          }
        },
        'Vue.js': function VueJs() {
          if (window.Vue) {
            return window.Vue.version;
          }
        }
      };
    }
  }, {
    key: 'getUsedVaadinElements',
    value: function getUsedVaadinElements(elements) {
      var version = getPolymerVersion();
      var elementClasses = void 0;
      // NOTE: In case you edit the code here, YOU MUST UPDATE any statistics reporting code in Flow.
      // Check all locations calling the method getEntries() in
      // https://github.com/vaadin/flow/blob/master/flow-server/src/main/java/com/vaadin/flow/internal/UsageStatistics.java#L106
      // Currently it is only used by BootstrapHandler.
      if (version && version.indexOf('2') === 0) {
        // Polymer 2: components classes are stored in window.Vaadin
        elementClasses = Object.keys(window.Vaadin).map(function (c) {
          return window.Vaadin[c];
        }).filter(function (c) {
          return c.is;
        });
      } else {
        // Polymer 3: components classes are stored in window.Vaadin.registrations
        elementClasses = window.Vaadin.registrations || [];
      }
      elementClasses.forEach(function (klass) {
        var version = klass.version ? klass.version : "0.0.0";
        elements[klass.is] = { version: version };
      });
    }
  }, {
    key: 'getUsedVaadinThemes',
    value: function getUsedVaadinThemes(themes) {
      ['Lumo', 'Material'].forEach(function (themeName) {
        var theme;
        var version = getPolymerVersion();
        if (version && version.indexOf('2') === 0) {
          // Polymer 2: themes are stored in window.Vaadin
          theme = window.Vaadin[themeName];
        } else {
          // Polymer 3: themes are stored in custom element registry
          theme = customElements.get('vaadin-' + themeName.toLowerCase() + '-styles');
        }
        if (theme && theme.version) {
          themes[themeName] = { version: theme.version };
        }
      });
    }
  }, {
    key: 'getFrameworks',
    value: function getFrameworks(frameworks) {
      var detectors = this.frameworkVersionDetectors();
      Object.keys(detectors).forEach(function (framework) {
        var detector = detectors[framework];
        try {
          var version = detector();
          if (version) {
            frameworks[framework] = { version: version };
          }
        } catch (e) {}
      });
    }
  }, {
    key: 'gather',
    value: function gather(storage) {
      var storedStats = storage.read();
      var gatheredStats = {};
      var types = ["elements", "frameworks", "themes"];

      types.forEach(function (type) {
        gatheredStats[type] = {};
        if (!storedStats[type]) {
          storedStats[type] = {};
        }
      });

      var previousStats = JSON.stringify(storedStats);

      this.getUsedVaadinElements(gatheredStats.elements);
      this.getFrameworks(gatheredStats.frameworks);
      this.getUsedVaadinThemes(gatheredStats.themes);

      var now = this.now;
      types.forEach(function (type) {
        var keys = Object.keys(gatheredStats[type]);
        keys.forEach(function (key) {
          if (!storedStats[type][key] || _typeof(storedStats[type][key]) != _typeof({})) {
            storedStats[type][key] = { firstUsed: now };
          }
          // Discards any previously logged version number
          storedStats[type][key].version = gatheredStats[type][key].version;
          storedStats[type][key].lastUsed = now;
        });
      });

      var newStats = JSON.stringify(storedStats);
      storage.write(newStats);
      if (newStats != previousStats && Object.keys(storedStats).length > 0) {
        this.logger.debug("New stats: " + newStats);
      }
    }
  }]);
  return StatisticsGatherer;
}();

var StatisticsStorage = function () {
  function StatisticsStorage(key) {
    classCallCheck(this, StatisticsStorage);

    this.key = key;
  }

  createClass(StatisticsStorage, [{
    key: 'read',
    value: function read() {
      var localStorageStatsString = localStorage.getItem(this.key);
      try {
        return JSON.parse(localStorageStatsString ? localStorageStatsString : '{}');
      } catch (e) {
        return {};
      }
    }
  }, {
    key: 'write',
    value: function write(data) {
      localStorage.setItem(this.key, data);
    }
  }, {
    key: 'clear',
    value: function clear() {
      localStorage.removeItem(this.key);
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      var storedStats = this.read();
      var empty = true;
      Object.keys(storedStats).forEach(function (key) {
        if (Object.keys(storedStats[key]).length > 0) {
          empty = false;
        }
      });

      return empty;
    }
  }]);
  return StatisticsStorage;
}();

var StatisticsSender = function () {
  function StatisticsSender(url, logger) {
    classCallCheck(this, StatisticsSender);

    this.url = url;
    this.logger = logger;
  }

  createClass(StatisticsSender, [{
    key: 'send',
    value: function send(data, errorHandler) {
      var logger = this.logger;

      if (navigator.onLine === false) {
        logger.debug("Offline, can't send");
        errorHandler();
        return;
      }
      logger.debug("Sending data to " + this.url);

      var req = new XMLHttpRequest();
      req.withCredentials = true;
      req.addEventListener("load", function () {
        // Stats sent, nothing more to do
        logger.debug("Response: " + req.responseText);
      });
      req.addEventListener("error", function () {
        logger.debug("Send failed");
        errorHandler();
      });
      req.addEventListener("abort", function () {
        logger.debug("Send aborted");
        errorHandler();
      });
      req.open("POST", this.url);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(data);
    }
  }]);
  return StatisticsSender;
}();

var StatisticsLogger = function () {
  function StatisticsLogger(id) {
    classCallCheck(this, StatisticsLogger);

    this.id = id;
  }

  createClass(StatisticsLogger, [{
    key: '_isDebug',
    value: function _isDebug() {
      return localStorage.getItem("vaadin." + this.id + ".debug");
    }
  }, {
    key: 'debug',
    value: function debug(msg) {
      if (this._isDebug()) {
        console.info(this.id + ": " + msg);
      }
    }
  }]);
  return StatisticsLogger;
}();

var UsageStatistics = function () {
  function UsageStatistics() {
    classCallCheck(this, UsageStatistics);

    this.now = new Date();
    this.timeNow = this.now.getTime();
    this.gatherDelay = 10; // Delay between loading this file and gathering stats
    this.initialDelay = 24 * 60 * 60;

    this.logger = new StatisticsLogger("statistics");
    this.storage = new StatisticsStorage("vaadin.statistics.basket");
    this.gatherer = new StatisticsGatherer(this.logger);
    this.sender = new StatisticsSender("https://tools.vaadin.com/usage-stats/submit", this.logger);
  }

  createClass(UsageStatistics, [{
    key: 'maybeGatherAndSend',
    value: function maybeGatherAndSend() {
      var _this = this;

      if (localStorage.getItem(UsageStatistics.optOutKey)) {
        return;
      }
      this.gatherer.gather(this.storage);
      setTimeout(function () {
        _this.maybeSend();
      }, this.gatherDelay * 1000);
    }
  }, {
    key: 'lottery',
    value: function lottery() {
      return true;
    }
  }, {
    key: 'currentMonth',
    value: function currentMonth() {
      return this.now.getYear() * 12 + this.now.getMonth();
    }
  }, {
    key: 'maybeSend',
    value: function maybeSend() {
      var firstUse = Number(localStorage.getItem(UsageStatistics.firstUseKey));
      var monthProcessed = Number(localStorage.getItem(UsageStatistics.monthProcessedKey));

      if (!firstUse) {
        // Use a grace period to avoid interfering with tests, incognito mode etc
        firstUse = this.timeNow;
        localStorage.setItem(UsageStatistics.firstUseKey, firstUse);
      }

      if (this.timeNow < firstUse + this.initialDelay * 1000) {
        this.logger.debug("No statistics will be sent until the initial delay of " + this.initialDelay + "s has passed");
        return;
      }
      if (this.currentMonth() <= monthProcessed) {
        this.logger.debug("This month has already been processed");
        return;
      }
      localStorage.setItem(UsageStatistics.monthProcessedKey, this.currentMonth());
      // Use random sampling
      if (this.lottery()) {
        this.logger.debug("Congratulations, we have a winner!");
      } else {
        this.logger.debug("Sorry, no stats from you this time");
        return;
      }

      this.send();
    }
  }, {
    key: 'send',
    value: function send() {
      // Ensure we have the latest data
      this.gatherer.gather(this.storage);

      // Read, send and clean up
      var data = this.storage.read();
      data["firstUse"] = Number(localStorage.getItem(UsageStatistics.firstUseKey));
      data["usageStatisticsVersion"] = UsageStatistics.version;
      var info = 'This request contains usage statistics gathered from the application running in development mode. \n\nStatistics gathering is automatically disabled and excluded from production builds.\n\nFor details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.\n\n\n\n';
      var self = this;
      this.sender.send(info + JSON.stringify(data), function () {
        // Revert the 'month processed' flag
        localStorage.setItem(UsageStatistics.monthProcessedKey, self.currentMonth() - 1);
      });
    }
  }], [{
    key: 'version',
    get: function get$1() {
      return '2.1.2';
    }
  }, {
    key: 'firstUseKey',
    get: function get$1() {
      return 'vaadin.statistics.firstuse';
    }
  }, {
    key: 'monthProcessedKey',
    get: function get$1() {
      return 'vaadin.statistics.monthProcessed';
    }
  }, {
    key: 'optOutKey',
    get: function get$1() {
      return 'vaadin.statistics.optout';
    }
  }]);
  return UsageStatistics;
}();

try {
  window.Vaadin = window.Vaadin || {};
  window.Vaadin.usageStatsChecker = window.Vaadin.usageStatsChecker || new UsageStatistics();
  window.Vaadin.usageStatsChecker.maybeGatherAndSend();
} catch (e) {
  // Intentionally ignored as this is not a problem in the app being developed
}

}());

  vaadin-dev-mode:end **/
}

const usageStatistics = function() {
  if (typeof runIfDevelopmentMode === 'function') {
    return runIfDevelopmentMode(maybeGatherAndSendStats);
  }
};

function __REGISTER__(feature, vaadinObj = window.Vaadin ??= {}) {
  vaadinObj.registrations ??= [];
  vaadinObj.registrations.push({
    is: "@vaadin/router",
    version: "2.0.0"
  });
}
__REGISTER__();
usageStatistics();

const willAnimate = (elem) => {
  const name = getComputedStyle(elem).getPropertyValue("animation-name");
  return name && name !== "none";
};
const waitForAnimation = (elem, cb) => {
  const listener = () => {
    elem.removeEventListener("animationend", listener);
    cb();
  };
  elem.addEventListener("animationend", listener);
};
async function animate(elem, className) {
  elem.classList.add(className);
  return await new Promise((resolve) => {
    if (willAnimate(elem)) {
      const rect = elem.getBoundingClientRect();
      const size = `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
      elem.setAttribute("style", `position: absolute; ${size}`);
      waitForAnimation(elem, () => {
        elem.classList.remove(className);
        elem.removeAttribute("style");
        resolve();
      });
    } else {
      elem.classList.remove(className);
      resolve();
    }
  });
}
var animate_default = animate;

function ensureRoute(route) {
  if (!route || !isString(route.path)) {
    throw new Error(
      log(`Expected route config to be an object with a "path" string property, or an array of such objects`)
    );
  }
  if (!isFunction(route.action) && !Array.isArray(route.children) && !isFunction(route.children) && !isString(route.component) && !isString(route.redirect)) {
    throw new Error(
      log(
        `Expected route config "${route.path}" to include either "component, redirect" or "action" function but none found.`
      )
    );
  }
  if (route.redirect) {
    ["bundle", "component"].forEach((overriddenProp) => {
      if (overriddenProp in route) {
        console.warn(
          log(
            `Route config "${String(route.path)}" has both "redirect" and "${overriddenProp}" properties, and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`
          )
        );
      }
    });
  }
}
function ensureRoutes(routes) {
  toArray(routes).forEach((route) => ensureRoute(route));
}
function copyContextWithoutNext({
  next: _,
  ...context
}) {
  return context;
}
function getPathnameForRouter(pathname, router) {
  const base = router.__effectiveBaseUrl;
  return base ? new URL(pathname.replace(/^\//u, ""), base).pathname : pathname;
}
function getMatchedPath(pathItems) {
  return pathItems.map((pathItem) => pathItem.path).reduce((a, b) => {
    if (b.length) {
      return `${a.replace(/\/$/u, "")}/${b.replace(/^\//u, "")}`;
    }
    return a;
  }, "");
}
function getRoutePath(chain) {
  return getMatchedPath(chain.map((chainItem) => chainItem.route));
}
function createLocation({ chain = [], hash = "", params = {}, pathname = "", redirectFrom, resolver, search = "" }, route) {
  const routes = chain.map((item) => item.route);
  return {
    baseUrl: resolver?.baseUrl ?? "",
    getUrl: (userParams = {}) => resolver ? getPathnameForRouter(compile(getRoutePath(chain))({ ...params, ...userParams }), resolver) : "",
    hash,
    params,
    pathname,
    redirectFrom,
    route: route ?? (Array.isArray(routes) ? routes.at(-1) : void 0) ?? null,
    routes,
    search,
    searchParams: new URLSearchParams(search)
  };
}
function createRedirect(context, pathname) {
  const params = { ...context.params };
  return {
    redirect: {
      from: context.pathname,
      params,
      pathname
    }
  };
}
function renderElement(context, element) {
  element.location = createLocation(context);
  if (context.chain) {
    const index = context.chain.map((item) => item.route).indexOf(context.route);
    context.chain[index].element = element;
  }
  return element;
}
function maybeCall(callback, thisArg, ...args) {
  if (typeof callback === "function") {
    return callback.apply(thisArg, args);
  }
  return void 0;
}
function amend(fn, obj, ...args) {
  return (result) => {
    if (result && isObject(result) && ("cancel" in result || "redirect" in result)) {
      return result;
    }
    return maybeCall(obj?.[fn], obj, ...args);
  };
}
function processNewChildren(newChildren, route) {
  if (!Array.isArray(newChildren) && !isObject(newChildren)) {
    throw new Error(
      log(
        `Incorrect "children" value for the route ${String(route.path)}: expected array or object, but got ${String(
          newChildren
        )}`
      )
    );
  }
  const children = toArray(newChildren);
  children.forEach((child) => ensureRoute(child));
  route.__children = children;
}
function fireRouterEvent(type, detail) {
  return !window.dispatchEvent(new CustomEvent(`vaadin-router-${type}`, { cancelable: type === "go", detail }));
}
function logValue(value) {
  if (typeof value !== "object") {
    return String(value);
  }
  const [stringType = "Unknown"] = / (.*)\]$/u.exec(String(value)) ?? [];
  if (stringType === "Object" || stringType === "Array") {
    return `${stringType} ${JSON.stringify(value)}`;
  }
  return stringType;
}

function getAnchorOrigin(anchor) {
  const { port, protocol } = anchor;
  const defaultHttp = protocol === "http:" && port === "80";
  const defaultHttps = protocol === "https:" && port === "443";
  const host = defaultHttp || defaultHttps ? anchor.hostname : anchor.host;
  return `${protocol}//${host}`;
}
function getNormalizedNodeName(e) {
  if (!(e instanceof Element)) {
    return void 0;
  }
  return e.nodeName.toLowerCase();
}
function vaadinRouterGlobalClickHandler(event) {
  if (event.defaultPrevented) {
    return;
  }
  if (event.button !== 0) {
    return;
  }
  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  let anchorCandidate = event.target;
  const path = event instanceof MouseEvent ? event.composedPath() : event.path ?? [];
  for (let i = 0; i < path.length; i++) {
    const target = path[i];
    if ("nodeName" in target && target.nodeName.toLowerCase() === "a") {
      anchorCandidate = target;
      break;
    }
  }
  while (anchorCandidate && anchorCandidate instanceof Node && getNormalizedNodeName(anchorCandidate) !== "a") {
    anchorCandidate = anchorCandidate.parentNode;
  }
  if (!anchorCandidate || getNormalizedNodeName(anchorCandidate) !== "a") {
    return;
  }
  const anchor = anchorCandidate;
  if (anchor.target && anchor.target.toLowerCase() !== "_self") {
    return;
  }
  if (anchor.hasAttribute("download")) {
    return;
  }
  if (anchor.hasAttribute("router-ignore")) {
    return;
  }
  if (anchor.pathname === window.location.pathname && anchor.hash !== "") {
    return;
  }
  const origin = anchor.origin || getAnchorOrigin(anchor);
  if (origin !== window.location.origin) {
    return;
  }
  const { hash, pathname, search } = anchor;
  if (fireRouterEvent("go", { hash, pathname, search }) && event instanceof MouseEvent) {
    event.preventDefault();
    if (event.type === "click") {
      window.scrollTo(0, 0);
    }
  }
}
const CLICK = {
  activate() {
    window.document.addEventListener("click", vaadinRouterGlobalClickHandler);
  },
  inactivate() {
    window.document.removeEventListener("click", vaadinRouterGlobalClickHandler);
  }
};
var click_default = CLICK;

function vaadinRouterGlobalPopstateHandler(event) {
  if (event.state === "vaadin-router-ignore") {
    return;
  }
  const { hash, pathname, search } = window.location;
  fireRouterEvent("go", { hash, pathname, search });
}
const POPSTATE = {
  activate() {
    window.addEventListener("popstate", vaadinRouterGlobalPopstateHandler);
  },
  inactivate() {
    window.removeEventListener("popstate", vaadinRouterGlobalPopstateHandler);
  }
};
var popstate_default = POPSTATE;

let triggers = [];
const DEFAULT_TRIGGERS = {
  CLICK: click_default,
  POPSTATE: popstate_default
};
function setNavigationTriggers(newTriggers = []) {
  triggers.forEach((trigger) => trigger.inactivate());
  newTriggers.forEach((trigger) => trigger.activate());
  triggers = newTriggers;
}

const MAX_REDIRECT_COUNT = 256;
function prevent() {
  return { cancel: true };
}
const rootContext = {
  __renderId: -1,
  params: {},
  route: {
    __synthetic: true,
    children: [],
    path: "",
    action() {
      return void 0;
    }
  },
  pathname: "",
  // eslint-disable-next-line @typescript-eslint/require-await
  async next() {
    return notFoundResult;
  }
};
class Router extends Resolver {
  /**
   * Contains read-only information about the current router location:
   * pathname, active routes, parameters. See the
   * [Location type declaration](#/classes/RouterLocation)
   * for more details.
   */
  location = createLocation({ resolver: this });
  /**
   * A promise that is settled after the current render cycle completes. If
   * there is no render cycle in progress the promise is immediately settled
   * with the last render cycle result.
   */
  ready = Promise.resolve(this.location);
  #addedByRouter = /* @__PURE__ */ new WeakSet();
  #createdByRouter = /* @__PURE__ */ new WeakSet();
  #navigationEventHandler = this.#onNavigationEvent.bind(this);
  #lastStartedRenderId = 0;
  #outlet;
  __previousContext;
  #urlForName;
  #appearingContent = null;
  #disappearingContent = null;
  /**
   * Creates a new Router instance with a given outlet, and
   * automatically subscribes it to navigation events on the `window`.
   * Using a constructor argument or a setter for outlet is equivalent:
   *
   * ```
   * const router = new Router();
   * router.setOutlet(outlet);
   * ```
   * @param outlet - a container to render the resolved route
   * @param options - an optional object with options
   */
  constructor(outlet, options) {
    const baseElement = document.head.querySelector("base");
    const baseHref = baseElement?.getAttribute("href");
    super([], {
      baseUrl: baseHref ? new URL(baseHref, document.URL).href.replace(/[^/]*$/u, "") : void 0,
      ...options,
      resolveRoute: async (context) => await this.#resolveRoute(context)
    });
    setNavigationTriggers(Object.values(DEFAULT_TRIGGERS));
    this.setOutlet(outlet);
    this.subscribe();
  }
  async #resolveRoute(context) {
    const { route } = context;
    if (isFunction(route.children)) {
      let children = await route.children(copyContextWithoutNext(context));
      if (!isFunction(route.children)) {
        ({ children } = route);
      }
      processNewChildren(children, route);
    }
    const commands = {
      component: (component) => {
        const element = document.createElement(component);
        this.#createdByRouter.add(element);
        return element;
      },
      prevent,
      redirect: (path) => createRedirect(context, path)
    };
    return await Promise.resolve().then(async () => {
      if (this.#isLatestRender(context)) {
        return await maybeCall(route.action, route, context, commands);
      }
    }).then((result) => {
      if (result != null && (typeof result === "object" || typeof result === "symbol")) {
        if (result instanceof HTMLElement || result === notFoundResult || isObject(result) && "redirect" in result) {
          return result;
        }
      }
      if (isString(route.redirect)) {
        return commands.redirect(route.redirect);
      }
    }).then((result) => {
      if (result != null) {
        return result;
      }
      if (isString(route.component)) {
        return commands.component(route.component);
      }
    });
  }
  /**
   * Sets the router outlet (the DOM node where the content for the current
   * route is inserted). Any content pre-existing in the router outlet is
   * removed at the end of each render pass.
   *
   * @remarks
   * This method is automatically invoked first time when creating a new Router
   * instance.
   *
   * @param outlet - the DOM node where the content for the current route is
   * inserted.
   */
  setOutlet(outlet) {
    if (outlet) {
      this.#ensureOutlet(outlet);
    }
    this.#outlet = outlet;
  }
  /**
   * Returns the current router outlet. The initial value is `undefined`.
   *
   * @returns the current router outlet (or `undefined`)
   */
  getOutlet() {
    return this.#outlet;
  }
  /**
   * Sets the routing config (replacing the existing one) and triggers a
   * navigation event so that the router outlet is refreshed according to the
   * current `window.location` and the new routing config.
   *
   * Each route object may have the following properties, listed here in the processing order:
   * * `path` – the route path (relative to the parent route if any) in the
   * [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths).
   *
   * * `children` – an array of nested routes or a function that provides this
   * array at the render time. The function can be synchronous or asynchronous:
   * in the latter case the render is delayed until the returned promise is
   * resolved. The `children` function is executed every time when this route is
   * being rendered. This allows for dynamic route structures (e.g. backend-defined),
   * but it might have a performance impact as well. In order to avoid calling
   * the function on subsequent renders, you can override the `children` property
   * of the route object and save the calculated array there
   * (via `context.route.children = [ route1, route2, ...];`).
   * Parent routes are fully resolved before resolving the children. Children
   * 'path' values are relative to the parent ones.
   *
   * * `action` – the action that is executed before the route is resolved.
   * The value for this property should be a function, accepting `context`
   * and `commands` parameters described below. If present, this function is
   * always invoked first, disregarding of the other properties' presence.
   * The action can return a result directly or within a `Promise`, which
   * resolves to the result. If the action result is an `HTMLElement` instance,
   * a `commands.component(name)` result, a `commands.redirect(path)` result,
   * or a `context.next()` result, the current route resolution is finished,
   * and other route config properties are ignored.
   * See also **Route Actions** section in [Live Examples](#/classes/Router/demos/demo/index.html).
   *
   * * `redirect` – other route's path to redirect to. Passes all route parameters to the redirect target.
   * The target route should also be defined.
   * See also **Redirects** section in [Live Examples](#/classes/Router/demos/demo/index.html).
   *
   * * `component` – the tag name of the Web Component to resolve the route to.
   * The property is ignored when either an `action` returns the result or `redirect` property is present.
   * If route contains the `component` property (or an action that return a component)
   * and its child route also contains the `component` property, child route's component
   * will be rendered as a light dom child of a parent component.
   *
   * * `name` – the string name of the route to use in the
   * [`router.urlForName(name, params)`](#/classes/Router#method-urlForName)
   * navigation helper method.
   *
   * For any route function (`action`, `children`) defined, the corresponding `route` object is available inside the
   * callback through the `this` reference. If you need to access it, make sure you define the callback as a non-arrow
   * function because arrow functions do not have their own `this` reference.
   *
   * `context` object that is passed to `action` function holds the following properties:
   * * `context.pathname` – string with the pathname being resolved
   *
   * * `context.search` – search query string
   *
   * * `context.hash` – hash string
   *
   * * `context.params` – object with route parameters
   *
   * * `context.route` – object that holds the route that is currently being rendered.
   *
   * * `context.next()` – function for asynchronously getting the next route
   * contents from the resolution chain (if any)
   *
   * `commands` object that is passed to `action` function has
   * the following methods:
   *
   * * `commands.redirect(path)` – function that creates a redirect data
   * for the path specified.
   *
   * * `commands.component(component)` – function that creates a new HTMLElement
   * with current context. Note: the component created by this function is reused if visiting the same path twice in
   * row.
   *
   * @param routes - a single route or an array of those
   * @param skipRender - configure the router but skip rendering the
   *     route corresponding to the current `window.location` values
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async setRoutes(routes, skipRender = false) {
    this.__previousContext = void 0;
    this.#urlForName = void 0;
    ensureRoutes(routes);
    super.setRoutes(routes);
    if (!skipRender) {
      this.#onNavigationEvent();
    }
    return await this.ready;
  }
  addRoutes(routes) {
    ensureRoutes(routes);
    return super.addRoutes(routes);
  }
  /**
   * Asynchronously resolves the given pathname and renders the resolved route
   * component into the router outlet. If no router outlet is set at the time of
   * calling this method, or at the time when the route resolution is completed,
   * a `TypeError` is thrown.
   *
   * Returns a promise that is fulfilled with the router outlet DOM Element | DocumentFragment after
   * the route component is created and inserted into the router outlet, or
   * rejected if no route matches the given path.
   *
   * If another render pass is started before the previous one is completed, the
   * result of the previous render pass is ignored.
   *
   * @param pathnameOrContext - the pathname to render or a context object with
   * a `pathname` property, optional `search` and `hash` properties, and other
   * properties to pass to the resolver.
   * @param shouldUpdateHistory - update browser history with the rendered
   * location
   */
  async render(pathnameOrContext, shouldUpdateHistory = false) {
    this.#lastStartedRenderId += 1;
    const renderId = this.#lastStartedRenderId;
    const context = {
      ...rootContext,
      ...isString(pathnameOrContext) ? { hash: "", search: "", pathname: pathnameOrContext } : pathnameOrContext,
      __renderId: renderId
    };
    this.ready = this.#doRender(context, shouldUpdateHistory);
    return await this.ready;
  }
  async #doRender(context, shouldUpdateHistory) {
    const { __renderId: renderId } = context;
    try {
      const ctx = await this.resolve(context);
      const contextWithChain = await this.#fullyResolveChain(ctx);
      if (!this.#isLatestRender(contextWithChain)) {
        return this.location;
      }
      const previousContext = this.__previousContext;
      if (contextWithChain === previousContext) {
        this.#updateBrowserHistory(previousContext, true);
        return this.location;
      }
      this.location = createLocation(contextWithChain);
      if (shouldUpdateHistory) {
        this.#updateBrowserHistory(contextWithChain, renderId === 1);
      }
      fireRouterEvent("location-changed", {
        router: this,
        location: this.location
      });
      if (contextWithChain.__skipAttach) {
        this.#copyUnchangedElements(contextWithChain, previousContext);
        this.__previousContext = contextWithChain;
        return this.location;
      }
      this.#addAppearingContent(contextWithChain, previousContext);
      const animationDone = this.#animateIfNeeded(contextWithChain);
      this.#runOnAfterEnterCallbacks(contextWithChain);
      this.#runOnAfterLeaveCallbacks(contextWithChain, previousContext);
      await animationDone;
      if (this.#isLatestRender(contextWithChain)) {
        this.#removeDisappearingContent();
        this.__previousContext = contextWithChain;
        return this.location;
      }
    } catch (error) {
      if (renderId === this.#lastStartedRenderId) {
        if (shouldUpdateHistory) {
          this.#updateBrowserHistory(this.context);
        }
        for (const child of this.#outlet?.children ?? []) {
          child.remove();
        }
        this.location = createLocation(Object.assign(context, { resolver: this }));
        fireRouterEvent("error", {
          router: this,
          error,
          ...context
        });
        throw error;
      }
    }
    return this.location;
  }
  // `topOfTheChainContextBeforeRedirects` is a context coming from Resolver.resolve().
  // It would contain a 'redirect' route or the first 'component' route that
  // matched the pathname. There might be more child 'component' routes to be
  // resolved and added into the chain. This method would find and add them.
  // `contextBeforeRedirects` is the context containing such a child component
  // route. It's only necessary when this method is called recursively (otherwise
  // it's the same as the 'top of the chain' context).
  //
  // Apart from building the chain of child components, this method would also
  // handle 'redirect' routes, call 'onBefore' callbacks and handle 'prevent'
  // and 'redirect' callback results.
  async #fullyResolveChain(topOfTheChainContextBeforeRedirects, contextBeforeRedirects = topOfTheChainContextBeforeRedirects) {
    const contextAfterRedirects = await this.#findComponentContextAfterAllRedirects(contextBeforeRedirects);
    const redirectsHappened = contextAfterRedirects !== contextBeforeRedirects;
    const topOfTheChainContextAfterRedirects = redirectsHappened ? contextAfterRedirects : topOfTheChainContextBeforeRedirects;
    const matchedPath = getPathnameForRouter(getMatchedPath(contextAfterRedirects.chain ?? []), this);
    const isFound = matchedPath === contextAfterRedirects.pathname;
    const findNextContextIfAny = async (context, parent = context.route, prevResult) => {
      const nextContext2 = await context.next(false, parent, prevResult);
      if (nextContext2 === null || nextContext2 === notFoundResult) {
        if (isFound) {
          return context;
        } else if (parent.parent != null) {
          return await findNextContextIfAny(context, parent.parent, nextContext2);
        }
        return nextContext2;
      }
      return nextContext2;
    };
    const nextContext = await findNextContextIfAny(contextAfterRedirects);
    if (nextContext == null || nextContext === notFoundResult) {
      throw getNotFoundError(
        topOfTheChainContextAfterRedirects
      );
    }
    return nextContext !== contextAfterRedirects ? await this.#fullyResolveChain(topOfTheChainContextAfterRedirects, nextContext) : await this.#amendWithOnBeforeCallbacks(contextAfterRedirects);
  }
  async #findComponentContextAfterAllRedirects(context) {
    const { result } = context;
    if (result instanceof HTMLElement) {
      renderElement(context, result);
      return context;
    } else if (result && "redirect" in result) {
      const ctx = await this.#redirect(result.redirect, context.__redirectCount, context.__renderId);
      return await this.#findComponentContextAfterAllRedirects(ctx);
    }
    throw result instanceof Error ? result : new Error(
      log(
        `Invalid route resolution result for path "${context.pathname}". Expected redirect object or HTML element, but got: "${logValue(result)}". Double check the action return value for the route.`
      )
    );
  }
  async #amendWithOnBeforeCallbacks(contextWithFullChain) {
    return await this.#runOnBeforeCallbacks(contextWithFullChain).then(async (amendedContext) => {
      if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
        return amendedContext;
      }
      return await this.#fullyResolveChain(amendedContext);
    });
  }
  async #runOnBeforeCallbacks(newContext) {
    const previousContext = this.__previousContext ?? {};
    const previousChain = previousContext.chain ?? [];
    const newChain = newContext.chain ?? [];
    let callbacks = Promise.resolve(void 0);
    const redirect = (pathname) => createRedirect(newContext, pathname);
    newContext.__divergedChainIndex = 0;
    newContext.__skipAttach = false;
    if (previousChain.length) {
      for (let i = 0; i < Math.min(previousChain.length, newChain.length); newContext.__divergedChainIndex++, i++) {
        if (previousChain[i].route !== newChain[i].route || previousChain[i].path !== newChain[i].path && previousChain[i].element !== newChain[i].element || !this.#isReusableElement(
          previousChain[i].element,
          newChain[i].element
        )) {
          break;
        }
      }
      newContext.__skipAttach = // Same route chain
      newChain.length === previousChain.length && newContext.__divergedChainIndex === newChain.length && // Same element
      this.#isReusableElement(newContext.result, previousContext.result);
      if (newContext.__skipAttach) {
        for (let i = newChain.length - 1; i >= 0; i--) {
          callbacks = this.#runOnBeforeLeaveCallbacks(callbacks, newContext, { prevent }, previousChain[i]);
        }
        for (let i = 0; i < newChain.length; i++) {
          callbacks = this.#runOnBeforeEnterCallbacks(
            callbacks,
            newContext,
            {
              prevent,
              redirect
            },
            newChain[i]
          );
          previousChain[i].element.location = createLocation(newContext, previousChain[i].route);
        }
      } else {
        for (let i = previousChain.length - 1; i >= newContext.__divergedChainIndex; i--) {
          callbacks = this.#runOnBeforeLeaveCallbacks(callbacks, newContext, { prevent }, previousChain[i]);
        }
      }
    }
    if (!newContext.__skipAttach) {
      for (let i = 0; i < newChain.length; i++) {
        if (i < newContext.__divergedChainIndex) {
          if (i < previousChain.length && previousChain[i].element) {
            previousChain[i].element.location = createLocation(newContext, previousChain[i].route);
          }
        } else {
          callbacks = this.#runOnBeforeEnterCallbacks(
            callbacks,
            newContext,
            {
              prevent,
              redirect
            },
            newChain[i]
          );
          if (newChain[i].element) {
            newChain[i].element.location = createLocation(newContext, newChain[i].route);
          }
        }
      }
    }
    return await callbacks.then(async (amendmentResult) => {
      if (amendmentResult && isObject(amendmentResult)) {
        if ("cancel" in amendmentResult && this.__previousContext) {
          this.__previousContext.__renderId = newContext.__renderId;
          return this.__previousContext;
        }
        if ("redirect" in amendmentResult) {
          return await this.#redirect(amendmentResult.redirect, newContext.__redirectCount, newContext.__renderId);
        }
      }
      return newContext;
    });
  }
  async #runOnBeforeLeaveCallbacks(callbacks, newContext, commands, chainElement) {
    const location = createLocation(newContext);
    let result = await callbacks;
    if (this.#isLatestRender(newContext)) {
      const beforeLeaveFunction = amend("onBeforeLeave", chainElement.element, location, commands, this);
      result = beforeLeaveFunction(result);
    }
    if (!(isObject(result) && "redirect" in result)) {
      return result;
    }
  }
  async #runOnBeforeEnterCallbacks(callbacks, newContext, commands, chainElement) {
    const location = createLocation(newContext, chainElement.route);
    const result = await callbacks;
    if (this.#isLatestRender(newContext)) {
      const beforeEnterFunction = amend("onBeforeEnter", chainElement.element, location, commands, this);
      return beforeEnterFunction(result);
    }
  }
  #isReusableElement(element, otherElement) {
    if (element instanceof Element && otherElement instanceof Element) {
      return this.#createdByRouter.has(element) && this.#createdByRouter.has(otherElement) ? element.localName === otherElement.localName : element === otherElement;
    }
    return false;
  }
  #isLatestRender(context) {
    return context.__renderId === this.#lastStartedRenderId;
  }
  async #redirect(redirectData, counter = 0, renderId = 0) {
    if (counter > MAX_REDIRECT_COUNT) {
      throw new Error(log(`Too many redirects when rendering ${redirectData.from}`));
    }
    return await this.resolve({
      ...rootContext,
      pathname: this.urlForPath(redirectData.pathname, redirectData.params),
      redirectFrom: redirectData.from,
      __redirectCount: counter + 1,
      __renderId: renderId
    });
  }
  #ensureOutlet(outlet = this.#outlet) {
    if (!(outlet instanceof Element || outlet instanceof DocumentFragment)) {
      throw new TypeError(
        log(`Expected router outlet to be a valid DOM Element | DocumentFragment (but got ${outlet})`)
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  #updateBrowserHistory({ pathname, search = "", hash = "" }, replace) {
    if (window.location.pathname !== pathname || window.location.search !== search || window.location.hash !== hash) {
      const changeState = replace ? "replaceState" : "pushState";
      window.history[changeState](null, document.title, pathname + search + hash);
      window.dispatchEvent(new PopStateEvent("popstate", { state: "vaadin-router-ignore" }));
    }
  }
  #copyUnchangedElements(context, previousContext) {
    let deepestCommonParent = this.#outlet;
    for (let i = 0; i < (context.__divergedChainIndex ?? 0); i++) {
      const unchangedElement = previousContext?.chain?.[i].element;
      if (unchangedElement) {
        if (unchangedElement.parentNode === deepestCommonParent) {
          context.chain[i].element = unchangedElement;
          deepestCommonParent = unchangedElement;
        } else {
          break;
        }
      }
    }
    return deepestCommonParent;
  }
  #addAppearingContent(context, previousContext) {
    this.#ensureOutlet();
    this.#removeAppearingContent();
    const deepestCommonParent = this.#copyUnchangedElements(context, previousContext);
    this.#appearingContent = [];
    this.#disappearingContent = Array.from(deepestCommonParent?.children ?? []).filter(
      // Only remove layout content that was added by router
      (e) => this.#addedByRouter.has(e) && // Do not remove the result element to avoid flickering
      e !== context.result
    );
    let parentElement = deepestCommonParent;
    for (let i = context.__divergedChainIndex ?? 0; i < (context.chain?.length ?? 0); i++) {
      const elementToAdd = context.chain[i].element;
      if (elementToAdd) {
        parentElement?.appendChild(elementToAdd);
        this.#addedByRouter.add(elementToAdd);
        if (parentElement === deepestCommonParent) {
          this.#appearingContent.push(elementToAdd);
        }
        parentElement = elementToAdd;
      }
    }
  }
  #removeDisappearingContent() {
    if (this.#disappearingContent) {
      for (const element of this.#disappearingContent) {
        element.remove();
      }
    }
    this.#disappearingContent = null;
    this.#appearingContent = null;
  }
  #removeAppearingContent() {
    if (this.#disappearingContent && this.#appearingContent) {
      for (const element of this.#appearingContent) {
        element.remove();
      }
      this.#disappearingContent = null;
      this.#appearingContent = null;
    }
  }
  #runOnAfterLeaveCallbacks(currentContext, targetContext) {
    if (!targetContext?.chain || currentContext.__divergedChainIndex == null) {
      return;
    }
    for (let i = targetContext.chain.length - 1; i >= currentContext.__divergedChainIndex; i--) {
      if (!this.#isLatestRender(currentContext)) {
        break;
      }
      const currentComponent = targetContext.chain[i].element;
      if (!currentComponent) {
        continue;
      }
      try {
        const location = createLocation(currentContext);
        maybeCall(currentComponent.onAfterLeave, currentComponent, location, {}, this);
      } finally {
        if (this.#disappearingContent?.includes(currentComponent)) {
          for (const child of currentComponent.children) {
            child.remove();
          }
        }
      }
    }
  }
  #runOnAfterEnterCallbacks(currentContext) {
    if (!currentContext.chain || currentContext.__divergedChainIndex == null) {
      return;
    }
    for (let i = currentContext.__divergedChainIndex; i < currentContext.chain.length; i++) {
      if (!this.#isLatestRender(currentContext)) {
        break;
      }
      const currentComponent = currentContext.chain[i].element;
      if (currentComponent) {
        const location = createLocation(currentContext, currentContext.chain[i].route);
        maybeCall(currentComponent.onAfterEnter, currentComponent, location, {}, this);
      }
    }
  }
  async #animateIfNeeded(context) {
    const from = this.#disappearingContent?.[0];
    const to = this.#appearingContent?.[0];
    const promises = [];
    const { chain = [] } = context;
    let config;
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i].route.animate) {
        config = chain[i].route.animate;
        break;
      }
    }
    if (from && to && config) {
      const leave = isObject(config) && config.leave ? config.leave : "leaving";
      const enter = isObject(config) && config.enter ? config.enter : "entering";
      promises.push(animate_default(from, leave));
      promises.push(animate_default(to, enter));
    }
    await Promise.all(promises);
    return context;
  }
  /**
   * Subscribes this instance to navigation events on the `window`.
   *
   * NOTE: beware of resource leaks. For as long as a router instance is
   * subscribed to navigation events, it won't be garbage collected.
   */
  subscribe() {
    window.addEventListener("vaadin-router-go", this.#navigationEventHandler);
  }
  /**
   * Removes the subscription to navigation events created in the `subscribe()`
   * method.
   */
  unsubscribe() {
    window.removeEventListener("vaadin-router-go", this.#navigationEventHandler);
  }
  #onNavigationEvent(event) {
    const { pathname, search, hash } = event instanceof CustomEvent ? event.detail : window.location;
    if (isString(this.__normalizePathname(pathname))) {
      if (event?.preventDefault) {
        event.preventDefault();
      }
      void this.render({ pathname, search, hash }, true);
    }
  }
  /**
   * Configures what triggers Router navigation events:
   *  - `POPSTATE`: popstate events on the current `window`
   *  - `CLICK`: click events on `<a>` links leading to the current page
   *
   * This method is invoked with the pre-configured values when creating a new Router instance.
   * By default, both `POPSTATE` and `CLICK` are enabled. This setup is expected to cover most of the use cases.
   *
   * See the `router-config.js` for the default navigation triggers config. Based on it, you can
   * create the own one and only import the triggers you need, instead of pulling in all the code,
   * e.g. if you want to handle `click` differently.
   *
   * See also **Navigation Triggers** section in [Live Examples](#/classes/Router/demos/demo/index.html).
   *
   * @param triggers - navigation triggers
   */
  static setTriggers(...triggers) {
    setNavigationTriggers(triggers);
  }
  /**
   * Generates a URL for the route with the given name, optionally performing
   * substitution of parameters.
   *
   * The route is searched in all the Router instances subscribed to
   * navigation events.
   *
   * **Note:** For child route names, only array children are considered.
   * It is not possible to generate URLs using a name for routes set with
   * a children function.
   *
   * @param name - The route name or the route’s `component` name.
   * @param params - Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   */
  urlForName(name, params) {
    if (!this.#urlForName) {
      this.#urlForName = generateUrls_default(this, {
        cacheKeyProvider(route) {
          return "component" in route && typeof route.component === "string" ? route.component : void 0;
        }
      });
    }
    return getPathnameForRouter(this.#urlForName(name, params ?? void 0), this);
  }
  /**
   * Generates a URL for the given route path, optionally performing
   * substitution of parameters.
   *
   * @param path - String route path declared in [express.js
   * syntax](https://expressjs.com/en/guide/routing.html#route-paths).
   * @param params - Optional object with route path parameters.
   * Named parameters are passed by name (`params[name] = value`), unnamed
   * parameters are passed by index (`params[index] = value`).
   */
  urlForPath(path, params) {
    return getPathnameForRouter(
      compile(path)(params ?? void 0),
      this
    );
  }
  /**
   * Triggers navigation to a new path. Returns a boolean without waiting until
   * the navigation is complete. Returns `true` if at least one `Router`
   * has handled the navigation (was subscribed and had `baseUrl` matching
   * the `path` argument), otherwise returns `false`.
   *
   * @param path - A new in-app path string, or an URL-like object with
   * `pathname` string property, and optional `search` and `hash` string
   * properties.
   */
  static go(path) {
    const { pathname, search, hash } = isString(path) ? new URL(path, "http://a") : path;
    return fireRouterEvent("go", { pathname, search, hash });
  }
}

export { Router };
