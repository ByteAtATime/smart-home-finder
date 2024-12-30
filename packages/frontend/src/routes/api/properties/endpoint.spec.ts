import { MockAuthProvider } from '$lib/server/auth/mock';
import { MockPropertyRepository } from '$lib/server/properties/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_DELETE, endpoint_GET, endpoint_POST } from './endpoint';
import { Property } from '$lib/server/properties/property';
import { endpoint_PATCH } from './endpoint';

const mockProperty = {
	id: 'new-property',
	name: 'New Property',
	type: 'string',
	unit: null,
	description: null
} as const;

describe('POST /api/properties', () => {
	it('should allow an admin to create a property', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const body = mockProperty;

		propertyRepository.insertProperty = vi.fn().mockResolvedValue('new-property');

		const endpoint = await endpoint_POST({ authProvider, propertyRepository, body });

		expect(propertyRepository.insertProperty).toHaveBeenCalledWith(body);
		expect(endpoint.status).toBe(201);
		expect(await endpoint.json()).toEqual({ success: true, id: 'new-property' });
	});

	it('should return 401 if the user is not an admin', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockSignedIn();
		const body = mockProperty;

		const endpoint = await endpoint_POST({ authProvider, propertyRepository, body });

		expect(propertyRepository.insertProperty).not.toHaveBeenCalled();
		expect(endpoint.status).toBe(401);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
	});
});

describe('GET /api/properties', () => {
	it('should return a list of properties', async () => {
		const propertyRepository = new MockPropertyRepository();
		const mockProperties = [
			new Property(
				{
					id: 'property1',
					name: 'Property 1',
					type: 'string',
					unit: null,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				propertyRepository
			),
			new Property(
				{
					id: 'property2',
					name: 'Property 2',
					type: 'float',
					unit: 'unit',
					description: 'Description',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				propertyRepository
			)
		];

		propertyRepository.getAllProperties = vi.fn().mockResolvedValue(mockProperties);

		const endpoint = await endpoint_GET({ propertyRepository });

		expect(propertyRepository.getAllProperties).toHaveBeenCalled();
		expect(endpoint.status).toBe(200);
		expect(await endpoint.json()).toEqual({
			success: true,
			properties: JSON.parse(
				JSON.stringify(await Promise.all(mockProperties.map((p) => p.toJson())))
			)
		});
	});

	it('should return 500 if getting properties fails', async () => {
		const propertyRepository = new MockPropertyRepository();

		propertyRepository.getAllProperties = vi
			.fn()
			.mockRejectedValue(new Error('Failed to get properties'));

		const endpoint = await endpoint_GET({ propertyRepository });

		expect(propertyRepository.getAllProperties).toHaveBeenCalled();
		expect(endpoint.status).toBe(500);
		expect(await endpoint.json()).toEqual({
			success: false,
			error: 'Failed to get properties'
		});
	});
});

describe('PATCH /api/properties/:id', () => {
	it('should allow an admin to update a property', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: 'property1' };
		const body = { name: 'Updated Property Name' };

		const updatedProperty = new Property(
			{
				...mockProperty,
				...body,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			propertyRepository
		);
		propertyRepository.updateProperty = vi.fn().mockResolvedValue(updatedProperty);

		const endpoint = await endpoint_PATCH({ authProvider, propertyRepository, params, body });

		expect(propertyRepository.updateProperty).toHaveBeenCalledWith('property1', body);
		expect(endpoint.status).toBe(200);
		expect(await endpoint.json()).toEqual({
			success: true,
			property: JSON.parse(JSON.stringify(await updatedProperty.toJson()))
		});
	});

	it('should return 401 if the user is not an admin', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockSignedIn(); // Not an admin
		const params = { id: 'property1' };
		const body = { name: 'Updated Property Name' };

		const endpoint = await endpoint_PATCH({ authProvider, propertyRepository, params, body });

		expect(propertyRepository.updateProperty).not.toHaveBeenCalled();
		expect(endpoint.status).toBe(401);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
	});

	it('should return 404 if the property is not found', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: 'property1' };
		const body = { name: 'Updated Property Name' };

		propertyRepository.updateProperty = vi.fn().mockResolvedValue(null); // Simulate not found

		const endpoint = await endpoint_PATCH({ authProvider, propertyRepository, params, body });

		expect(propertyRepository.updateProperty).toHaveBeenCalledWith('property1', body);
		expect(endpoint.status).toBe(404);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Property not found' });
	});
});

describe('DELETE /api/properties/:id', () => {
	it('should allow an admin to delete a property', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: 'property1' };

		propertyRepository.deleteProperty = vi.fn().mockResolvedValue(true);

		const endpoint = await endpoint_DELETE({ authProvider, propertyRepository, params });

		expect(propertyRepository.deleteProperty).toHaveBeenCalledWith('property1');
		expect(endpoint.status).toBe(200);
		expect(await endpoint.json()).toEqual({ success: true });
	});

	it('should return 401 if the user is not an admin', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockSignedIn(); // Not an admin
		const params = { id: 'property1' };

		const endpoint = await endpoint_DELETE({ authProvider, propertyRepository, params });

		expect(propertyRepository.deleteProperty).not.toHaveBeenCalled();
		expect(endpoint.status).toBe(401);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
	});

	it('should return 404 if the property is not found', async () => {
		const propertyRepository = new MockPropertyRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: 'property1' };

		propertyRepository.deleteProperty = vi.fn().mockResolvedValue(false); // Simulate not found

		const endpoint = await endpoint_DELETE({ authProvider, propertyRepository, params });

		expect(propertyRepository.deleteProperty).toHaveBeenCalledWith('property1');
		expect(endpoint.status).toBe(404);
		expect(await endpoint.json()).toEqual({
			success: false,
			error: 'Property not found or in use'
		});
	});
});
