import { MockAuthProvider } from '$lib/server/auth/mock';
import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_GET, endpoint_POST } from './endpoint';
import type {
	DeviceData,
	Paginated,
	Property as PropertyData
} from '@smart-home-finder/common/types';
import { DeviceService } from '$lib/server/devices/service';
import { MockPropertyRepository } from '$lib/server/properties/mock';
import { MockListingRepository } from '$lib/server/listings/mock';
import { Property } from '$lib/server/properties/property';

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
		description: null
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
		it('should return a list of devices', async () => {
			const deviceRepository = new MockDeviceRepository();
			const propertyRepository = new MockPropertyRepository();
			const listingRepository = new MockListingRepository();
			const deviceService = new DeviceService(
				deviceRepository,
				propertyRepository,
				listingRepository
			);

			const mockPropertyClass = new Property(mockDeviceProperties.voltage, propertyRepository);

			const query = { page: 1, pageSize: 10 };
			deviceRepository.getAllDevicesPaginated = vi.fn().mockResolvedValue({
				items: [mockDevice], // Devices without properties at repository level
				total: 1,
				page: query.page,
				pageSize: query.pageSize
			} satisfies Paginated<DeviceData>);

			propertyRepository.getAllProperties = vi.fn().mockResolvedValue([mockPropertyClass]);
			propertyRepository.getPropertyValueForDevice = vi.fn().mockResolvedValue(123.45);

			const endpoint = await endpoint_GET({ deviceService, query });

			expect(deviceRepository.getAllDevicesPaginated).toHaveBeenCalledWith(
				query.page,
				query.pageSize,
				{
					deviceType: undefined,
					protocol: undefined
				}
			);
			expect(propertyRepository.getAllProperties).toHaveBeenCalled();
			expect(endpoint.status).toBe(200);
			expect(endpoint.headers.get('Content-Type')).toBe('application/json');
			expect(await endpoint.json()).toEqual({
				success: true,
				devices: [resultDevice],
				page: query.page,
				pageSize: query.pageSize,
				total: 1
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
