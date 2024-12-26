import { describe, it, vi, expect } from 'vitest';
import { withBodySchema } from './validation';
import { z } from 'zod';

describe('withBodySchema', () => {
	const schema = z.object({
		name: z.string(),
		age: z.number()
	});

	it('should pass valid data to next handler', async () => {
		const middleware = withBodySchema(schema);
		const next = vi.fn().mockResolvedValue(new Response());
		const validBody = { name: 'John', age: 25 };

		const event = {
			request: new Request('http://test.com', {
				method: 'POST',
				body: JSON.stringify(validBody)
			})
		} as any;

		await middleware({}, event, next);

		expect(next).toHaveBeenCalledWith({ body: validBody });
	});

	it('should return 400 for invalid JSON', async () => {
		const middleware = withBodySchema(schema);
		const next = vi.fn();

		const event = {
			request: new Request('http://test.com', {
				method: 'POST',
				body: 'invalid json'
			})
		} as any;

		const response = await middleware({}, event, next);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			error: 'Invalid JSON',
			details: expect.any(String)
		});
		expect(next).not.toHaveBeenCalled();
	});

	it('should return 400 for schema validation failures', async () => {
		const middleware = withBodySchema(schema);
		const next = vi.fn();
		const invalidBody = { name: 123, age: 'not a number' };

		const event = {
			request: new Request('http://test.com', {
				method: 'POST',
				body: JSON.stringify(invalidBody)
			})
		} as any;

		const response = await middleware({}, event, next);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			error: 'Validation failed',
			errors: expect.any(Array)
		});
		expect(next).not.toHaveBeenCalled();
	});
});
