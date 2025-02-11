import { MockAuthProvider } from '$lib/server/auth/mock';
import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_GET, endpoint_POST, querySchema } from './endpoint';
import type { DeviceData, Paginated, PropertyData } from '@smart-home-finder/common/types';
import { DeviceService } from '$lib/server/devices/service';
import { MockPropertyRepository } from '$lib/server/properties/mock';
import { MockListingRepository } from '$lib/server/listings/mock';
import { Property } from '$lib/server/properties/property';
import { MockVariantRepository } from '$lib/server/variant/mock';
import { Variant } from '$lib/server/variant/variant';
import type { z } from 'zod';

const mockDevice = {
	id: 1,
	name: 'Test Device',
	deviceType: 'light',
	protocol: 'zwave',
	createdAt: new Date(),
	updatedAt: new Date(),
	images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
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

describe('devices', () => {
	describe('GET', () => {
		it('should return a list of devices with default parameters', async () => {
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

			const mockPropertyClass = new Property(mockDeviceProperties.voltage, propertyRepository);

			const mockVariant = new Variant(
				{
					id: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
					name: 'Test Variant'
				},
				variantRepository
			);

			const query = {
				page: 1,
				pageSize: 10
			};
			deviceRepository.getAllDevicesPaginated = vi.fn().mockResolvedValue({
				items: [mockDevice],
				total: 1,
				page: query.page,
				pageSize: query.pageSize
			} satisfies Paginated<DeviceData>);

			propertyRepository.getDeviceProperties = vi.fn().mockResolvedValue([mockPropertyClass]);
			propertyRepository.getAllProperties = vi.fn().mockResolvedValue([mockPropertyClass]);
			variantRepository.getVariantsForDevice = vi.fn().mockResolvedValue([mockVariant]);
			propertyRepository.getPropertyValueForDevice = vi.fn().mockResolvedValue(123.45);
			listingRepository.getPriceBounds = vi.fn().mockResolvedValue([0, 100]);
			deviceRepository.getFilteredDeviceTypes = vi.fn().mockResolvedValue(['light', 'switch']);

			const endpoint = await endpoint_GET({ deviceService, listingRepository, query });

			expect(deviceRepository.getAllDevicesPaginated).toHaveBeenCalledWith(1, 10, {
				deviceType: undefined,
				protocol: undefined,
				priceBounds: undefined
			});
			expect(propertyRepository.getDeviceProperties).toHaveBeenCalled();
			expect(propertyRepository.getAllProperties).toHaveBeenCalled();
			expect(endpoint.status).toBe(200);
			expect(endpoint.headers.get('Content-Type')).toBe('application/json');
			expect(await endpoint.json()).toEqual({
				success: true,
				availableDeviceTypes: ['light', 'switch'],
				devices: [
					{ ...resultDevice, variants: [JSON.parse(JSON.stringify(await mockVariant.toJson()))] }
				],
				propertiesByDeviceType: {
					switch: [JSON.parse(JSON.stringify(await mockPropertyClass.toJson()))]
				},
				page: 1,
				pageSize: 10,
				total: 1,
				priceBounds: [0, 100]
			});
		});

		it('should handle filters correctly', async () => {
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

			const query = {
				page: 2,
				pageSize: 25,
				deviceType: ['light', 'switch'],
				protocol: ['zwave'],
				minPrice: 10,
				maxPrice: 100
			} satisfies z.infer<typeof querySchema>;
			deviceRepository.getAllDevicesPaginated = vi.fn().mockResolvedValue({
				items: [],
				total: 0,
				page: query.page,
				pageSize: query.pageSize
			} satisfies Paginated<DeviceData>);
			listingRepository.getPriceBounds = vi.fn().mockResolvedValue([0, 100]);
			propertyRepository.getAllProperties = vi.fn().mockResolvedValue([]);
			const endpoint = await endpoint_GET({ deviceService, listingRepository, query });

			expect(deviceRepository.getAllDevicesPaginated).toHaveBeenCalledWith(
				query.page,
				query.pageSize,
				{
					deviceType: ['light', 'switch'],
					protocol: ['zwave'],
					priceBounds: [10, 100]
				}
			);
			expect(endpoint.status).toBe(200);
		});

		it('should return an empty array if no devices are found', async () => {
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

			const query = {
				page: 1,
				pageSize: 10
			};
			deviceRepository.getAllDevicesPaginated = vi.fn().mockResolvedValue({
				items: [],
				total: 0,
				page: query.page,
				pageSize: query.pageSize
			} satisfies Paginated<DeviceData>);
			listingRepository.getPriceBounds = vi.fn().mockResolvedValue([0, 100]);
			propertyRepository.getAllProperties = vi.fn().mockResolvedValue([]);

			const endpoint = await endpoint_GET({ deviceService, listingRepository, query });

			expect(endpoint.status).toBe(200);
			expect(await endpoint.json()).toEqual({
				success: true,
				devices: [],
				propertiesByDeviceType: {},
				page: 1,
				pageSize: 10,
				total: 0,
				priceBounds: [0, 100]
			});
		});
	});

	describe('POST', () => {
		it('should allow an admin to create a device', async () => {
			const deviceRepository = new MockDeviceRepository();
			const authProvider = new MockAuthProvider().mockAdmin();
			const body = mockDevice;

			deviceRepository.insertDevice = vi.fn().mockResolvedValue(1);

			const endpoint = await endpoint_POST({ authProvider, deviceRepository, body });

			expect(deviceRepository.insertDevice).toHaveBeenCalledWith({
				name: body.name,
				protocol: body.protocol,
				deviceType: body.deviceType,
				images: body.images,
				id: 0,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date)
			});
			expect(endpoint.status).toBe(201);
			expect(endpoint.headers.get('Content-Type')).toBe('application/json');
			expect(await endpoint.json()).toEqual({ success: true, id: 1 });
		});

		it('should return 401 if the user is not an admin', async () => {
			const deviceRepository = new MockDeviceRepository();
			const authProvider = new MockAuthProvider().mockSignedIn();
			const body = mockDevice;

			const endpoint = await endpoint_POST({ authProvider, deviceRepository, body });

			expect(deviceRepository.insertDevice).not.toHaveBeenCalled();
			expect(endpoint.status).toBe(401);
			expect(endpoint.headers.get('Content-Type')).toBe('application/json');
			expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
		});
	});
});
