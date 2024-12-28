import { describe, it, expect, vi } from 'vitest';
import { compose } from './core';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type { EndpointHandler, MiddlewareHandler } from './types';

describe('compose', () => {
	it('should compose middleware and handler correctly', async () => {
		const middleware1: MiddlewareHandler<unknown> = vi.fn((deps, _event, next) => {
			return next({ ...deps, a: 1 });
		});
		const middleware2: MiddlewareHandler<unknown> = vi.fn((deps, _event, next) => {
			return next({ ...deps, b: 2 });
		});
		const handler: EndpointHandler<unknown> = vi.fn((deps) => {
			return json({ result: deps.a + deps.b });
		});

		const composed = compose(middleware1, middleware2)(handler);
		const event = {} as RequestEvent;
		const response = await composed(event);

		expect(middleware1).toHaveBeenCalled();
		expect(middleware2).toHaveBeenCalled();
		expect(handler).toHaveBeenCalledWith({ a: 1, b: 2 });
		expect(await response.json()).toEqual({ result: 3 });
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
	});

	it('should handle errors in middleware', async () => {
		const middleware1: MiddlewareHandler<unknown> = vi.fn((_deps, _event, _next) => {
			throw new Error('Error in middleware1');
		});
		const middleware2: MiddlewareHandler<unknown> = vi.fn();
		const handler: EndpointHandler<unknown> = vi.fn();

		const composed = compose(middleware1, middleware2)(handler);
		const event = {} as RequestEvent;
		const response = await composed(event);

		expect(middleware1).toHaveBeenCalled();
		expect(middleware2).not.toHaveBeenCalled();
		expect(handler).not.toHaveBeenCalled();

		const responseBody = await response.json();
		expect(response.status).toBe(500);
		expect(responseBody).toEqual({ error: 'Internal server error' });
	});

	it('should work correctly with an empty middleware array', async () => {
		const handler: EndpointHandler<object> = vi.fn(() => {
			return json({ result: 'success' });
		});

		const composed = compose()(handler);
		const event = {} as RequestEvent;
		const response = await composed(event);

		expect(handler).toHaveBeenCalledWith({});
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		expect(await response.json()).toEqual({ result: 'success' });
	});
});
