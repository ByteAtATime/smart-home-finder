import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { EndpointHandler, MiddlewareHandler } from './types';
import { json } from '@sveltejs/kit';

type ComposedHandler<TDeps> = (deps: TDeps, event: RequestEvent) => Response | Promise<Response>;

export const compose = <TDeps extends Record<string, unknown>>(
	...middlewares: MiddlewareHandler<any>[]
) => {
	return (handler: EndpointHandler<TDeps>): RequestHandler => {
		const composedMiddleware = middlewares.reduceRight<ComposedHandler<TDeps>>(
			(next, middleware) => {
				return (deps, event) => middleware(deps, event, (newDeps) => next(newDeps, event));
			},
			(deps, event) => handler(deps)
		);

		return async (event) => {
			try {
				return await composedMiddleware({} as TDeps, event);
			} catch (e) {
				console.error(e);
				return json({ error: 'Internal server error' }, { status: 500 });
			}
		};
	};
};
