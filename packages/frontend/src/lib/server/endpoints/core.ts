import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { EndpointHandler, MiddlewareHandler } from './types';
import { json } from '@sveltejs/kit';

type ComposedHandler<TDeps> = (deps: TDeps, event: RequestEvent) => Response | Promise<Response>;

// TODO: how can we not have to use any here?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const compose = (...middlewares: MiddlewareHandler<any>[]) => {
	return <TDeps>(handler: EndpointHandler<TDeps>): RequestHandler => {
		const composedMiddleware = middlewares.reduceRight<ComposedHandler<TDeps>>(
			(next, middleware) => {
				return (deps, event) => middleware(deps, event, (newDeps) => next(newDeps, event));
			},
			(deps) => handler(deps)
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
