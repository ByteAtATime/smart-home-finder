import type { RequestHandler } from '@sveltejs/kit';
import type { EndpointHandler, MiddlewareHandler } from './types';

export const endpoint = (handler: EndpointHandler<Record<string, never>>): RequestHandler => {
	return (event) => {
		try {
			return handler({}, event);
		} catch (e) {
			console.error(e);
			throw e;
		}
	};
};

export const compose = <TDeps>(...middlewares: MiddlewareHandler<any>[]) => {
	return (handler: EndpointHandler<TDeps>) =>
		middlewares.reduceRight(
			(next, middleware) => (deps, event) => middleware(deps, event, next),
			handler
		);
};
