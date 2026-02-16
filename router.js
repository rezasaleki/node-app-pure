const url = require('url')

class Router {
    constructor() {
        this.routes = {
            GET: [],
            POST: [],
            PUT: [],
            DELETE: [],
            PATCH: []
        }
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    get(path, ...handlers) {
        this._addRoute('GET', path, handlers);
    }

    post(path, ...handlers) {
        this._addRoute('POST', path, handlers);
    }

    put(path, ...handlers) {
        this._addRoute('PUT', path, handlers);
    }

    patch(path, ...handlers) {
        this._addRoute('PATCH', path, handlers);
    }

    delete(path, ...handlers) {
        this._addRoute('DELETE', path, handlers);
    }

    _addRoute(method, path, handlers) {
        const paramNames = [];
        const regexPath = path.replace(/:([^\/]+)/g, (_, paramName) => {
          paramNames.push(paramName);
          return '([^\/]+)';
        });

        const regex = new RegExp(`^${regexPath}$`);
        this.routes[method].push({
          path,
          regex,
          paramNames,
          handlers: handlers.flat(),
        });
    }

    async handle(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const method = req.method;

        req.query = parsedUrl.query;
        req.params = {};
        req.body = (method === 'POST') ? {} : null;

        let idx = 0;
        const next = async (err) => {
          if (err) {
            return this._sendError(res, 500, err.message);
          }
          if (idx < this.middlewares.length) {
            const middleware = this.middlewares[idx++];
            try {
              await middleware(req, res, next);
            } catch (error) {
              this._sendError(res, 500, error.message);
            }
          } else {
            // find main route bettwen all routes
            this._matchRoute(req, res, method, pathname);
          }
        };
        next();
    }

    _matchRoute(req, res, method, pathname) {
        const routes = this.routes[method] || [];
        for (const route of routes) {
          const match = pathname.match(route.regex);

          if (match) {
            // extract parameters
            route.paramNames.forEach((name, index) => {
              req.params[name] = match[index + 1];
            });
    
            // run chain handlers
            let handlerIndex = 0;
            const next = async (err) => {
              if (err) {
                return this._sendError(res, 500, err.message);
              }
              if (handlerIndex < route.handlers.length) {
                const handler = route.handlers[handlerIndex++];
                try {
                  await handler(req, res, next);
                } catch (error) {
                  this._sendError(res, 500, error.message);
                }
              } else {
                // handle error
                if (!res.headersSent) {
                  this._sendError(res, 404, 'Not Found');
                }
              }
            };
            next();
            return;
          }
        }
        // route not found
        this._sendError(res, 404, 'Route not found');
    }

    _sendError(res, statusCode, message) {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: message }));
      }
}

module.exports = Router;