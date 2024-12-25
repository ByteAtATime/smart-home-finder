import type { RequestEvent } from '@sveltejs/kit';

export type MiddlewareHandler<TDeps> = (
	deps: TDeps,
	event: RequestEvent,
	next: EndpointHandler<TDeps>
) => Promise<Response> | Response;

export type EndpointHandler<TDeps> = (
	deps: TDeps,
	event: RequestEvent
) => Promise<Response> | Response;

export type Handler<TDeps> = MiddlewareHandler<TDeps> | EndpointHandler<TDeps>;
