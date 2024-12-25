import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { EndpointHandler, MiddlewareHandler } from './types';

export const endpoint = (handler: EndpointHandler<Record<string, never>>): RequestHandler => {
	return (event) => {
		try {
			return handler({});
		} catch (e) {
			console.error(e);
			throw e;
		}
	};
};

type ComposedHandler<TDeps> = (deps: TDeps, event: RequestEvent) => Response | Promise<Response>;

export const compose = <TDeps extends Record<string, unknown>>(
	...middlewares: MiddlewareHandler<any>[]
) => {
	return (handler: EndpointHandler<TDeps>): RequestHandler => {
		const composedMiddleware = middlewares.reduceRight<ComposedHandler<TDeps>>(
			(next, middleware) => {
				return (deps, event) => middleware(deps, event, (newDeps) => next(newDeps, event));
			},
			(deps) => handler(deps)
		);

		return (event) => composedMiddleware({} as TDeps, event);
	};
};
