import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_DELETE, endpoint_GET, endpoint_PATCH } from './endpoint';
import type { DeviceData } from '@smart-home-finder/common/types';
import { DeviceService } from '$lib/server/devices/service';
import { MockPropertyRepository } from '$lib/server/properties/mock';
import { MockListingRepository } from '$lib/server/listings/mock';
import { MockAuthProvider } from '$lib/server/auth/mock';
import { Property } from '$lib/server/properties/property';
import type { PropertyData } from '@smart-home-finder/common/types';
import { MockVariantRepository } from '$lib/server/variant/mock';
import { Variant } from '$lib/server/variant/variant';
const mockDevice = {
	id: 1,
	images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
	name: 'Test Device',
	deviceType: 'light',
	protocol: 'zwave',
	createdAt: new Date(),
	updatedAt: new Date()
} satisfies DeviceData;
const mockDeviceProperties = {
	voltage: {
		id: 'voltage',
		name: 'voltage',
		createdAt: new Date(),
		updatedAt: new Date(),
		type: 'float',
		unit: 'V',
		description: null,
		minValue: 0,
		maxValue: 240
	}
} satisfies Record<string, PropertyData>;
const resultDevice = JSON.parse(
	JSON.stringify({
		...mockDevice,
		properties: { voltage: { ...mockDeviceProperties.voltage, value: 123.45 } }
	})
);

describe('GET /api/devices/:id', () => {
	it('should return a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const propertyRepository = new MockPropertyRepository();
		const listingRepository = new MockListingRepository();
		const variantRepository = new MockVariantRepository();
		const deviceService = new DeviceService(
			deviceRepository,
			propertyRepository,
			listingRepository,
			variantRepository
		);

		const params = { id: '1' };

		const mockVariant = new Variant(
			{
				id: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: 'Test Variant'
			},
			variantRepository
		);
		const mockPropertyClass = new Property(mockDeviceProperties.voltage, propertyRepository);

		deviceRepository.getBaseDeviceById = vi.fn().mockResolvedValue(mockDevice);
		propertyRepository.getPropertyValueForDevice = vi.fn().mockResolvedValue(123.45);
		propertyRepository.getDeviceProperties = vi.fn().mockResolvedValue([mockPropertyClass]);
		variantRepository.getVariantsForDevice = vi.fn().mockResolvedValue([mockVariant]);
		listingRepository.getDevicePrices = vi.fn().mockResolvedValue([]);

		const endpoint = await endpoint_GET({ deviceService, params });

		expect(deviceRepository.getBaseDeviceById).toHaveBeenCalledWith(1);
		expect(propertyRepository.getDeviceProperties).toHaveBeenCalled();
		expect(listingRepository.getDevicePrices).toHaveBeenCalledWith(1);
		expect(propertyRepository.getPropertyValueForDevice).toHaveBeenCalledWith('voltage', 1);
		expect(endpoint.status).toBe(200);
		expect(endpoint.headers.get('Content-Type')).toBe('application/json');
		expect(await endpoint.json()).toEqual({
			success: true,
			device: {
				...resultDevice,
				variants: [JSON.parse(JSON.stringify(await mockVariant.toJson()))],
				listings: []
			}
		});
	});

	it('should return 400 if the ID is not a number', async () => {
		const deviceRepository = new MockDeviceRepository();
		const propertyRepository = new MockPropertyRepository();
		const listingRepository = new MockListingRepository();
		const variantRepository = new MockVariantRepository();
		const deviceService = new DeviceService(
			deviceRepository,
			propertyRepository,
			listingRepository,
			variantRepository
		);

		const params = { id: 'abc' };

		const endpoint = await endpoint_GET({ deviceService, params });

		expect(endpoint.status).toBe(400);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Invalid device ID' });
	});

	it('should return 404 if the device is not found', async () => {
		const deviceRepository = new MockDeviceRepository();
		const propertyRepository = new MockPropertyRepository();
		const listingRepository = new MockListingRepository();
		const variantRepository = new MockVariantRepository();
		const deviceService = new DeviceService(
			deviceRepository,
			propertyRepository,
			listingRepository,
			variantRepository
		);

		const params = { id: '99' };

		deviceRepository.getBaseDeviceById = vi.fn().mockResolvedValue(null);

		const endpoint = await endpoint_GET({ deviceService, params });

		expect(endpoint.status).toBe(404);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Device not found' });
	});
});

describe('PATCH /api/devices/:id', () => {
	it('should update a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: '1' };
		const body = { name: 'Updated Device Name' };

		const updatedDevice = { ...mockDevice, ...body };
		deviceRepository.updateDevice.mockResolvedValue(updatedDevice);

		const endpoint = await endpoint_PATCH({ authProvider, deviceRepository, params, body });

		expect(deviceRepository.updateDevice).toHaveBeenCalledWith(1, body);
		expect(endpoint.status).toBe(200);
		expect(await endpoint.json()).toEqual({
			success: true,
			device: JSON.parse(JSON.stringify(updatedDevice))
		});
	});

	it('should return 401 if the user is not an admin', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockSignedIn(); // Not an admin
		const params = { id: '1' };
		const body = { name: 'Updated Device Name' };

		const endpoint = await endpoint_PATCH({ authProvider, deviceRepository, params, body });

		expect(deviceRepository.updateDevice).not.toHaveBeenCalled();
		expect(endpoint.status).toBe(401);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
	});

	it('should return 400 if the ID is not a number', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: 'abc' };
		const body = { name: 'Updated Device Name' };

		const endpoint = await endpoint_PATCH({ authProvider, deviceRepository, params, body });

		expect(endpoint.status).toBe(400);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Invalid device ID' });
	});

	it('should return 404 if the device is not found', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: '1' };
		const body = { name: 'Updated Device Name' };

		deviceRepository.updateDevice.mockResolvedValue(null);

		const endpoint = await endpoint_PATCH({ authProvider, deviceRepository, params, body });

		expect(deviceRepository.updateDevice).toHaveBeenCalledWith(1, body);
		expect(endpoint.status).toBe(404);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Device not found' });
	});
});

describe('DELETE /api/devices/:id', () => {
	it('should delete a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: '1' };

		deviceRepository.deleteDevice.mockResolvedValue(true);

		const endpoint = await endpoint_DELETE({ authProvider, deviceRepository, params });

		expect(deviceRepository.deleteDevice).toHaveBeenCalledWith(1);
		expect(endpoint.status).toBe(200);
		expect(await endpoint.json()).toEqual({ success: true });
	});

	it('should return 401 if the user is not an admin', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockSignedIn(); // Not an admin
		const params = { id: '1' };

		const endpoint = await endpoint_DELETE({ authProvider, deviceRepository, params });

		expect(deviceRepository.deleteDevice).not.toHaveBeenCalled();
		expect(endpoint.status).toBe(401);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
	});

	it('should return 400 if the ID is not a number', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: 'abc' };

		const endpoint = await endpoint_DELETE({ authProvider, deviceRepository, params });

		expect(endpoint.status).toBe(400);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Invalid device ID' });
	});

	it('should return 404 if the device is not found', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const params = { id: '1' };

		deviceRepository.deleteDevice.mockResolvedValue(false);

		const endpoint = await endpoint_DELETE({ authProvider, deviceRepository, params });

		expect(deviceRepository.deleteDevice).toHaveBeenCalledWith(1);
		expect(endpoint.status).toBe(404);
		expect(await endpoint.json()).toEqual({ success: false, error: 'Device not found' });
	});
});
