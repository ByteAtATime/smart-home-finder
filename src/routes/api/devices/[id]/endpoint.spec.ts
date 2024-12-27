import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_GET } from './endpoint';
import type { Device, DeviceProperty } from '$lib/types/db';
import { DeviceService } from '$lib/server/devices/service';
import { MockPropertyRepository } from '$lib/server/properties/mock';
import { MockListingRepository } from '$lib/server/listings/mock';

const mockDevice = {
	id: 1,
	images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
	name: 'Test Device',
	deviceType: 'light',
	protocol: 'zwave',
	createdAt: new Date(),
	updatedAt: new Date()
} satisfies Device;
const mockDeviceProperties = {
	voltage: {
		deviceId: 1,
		propertyId: 'voltage',
		intValue: null,
		floatValue: 123.45,
		stringValue: null,
		booleanValue: null
	}
} satisfies Record<string, DeviceProperty>;
const resultDevice = JSON.parse(
	JSON.stringify({ ...mockDevice, properties: mockDeviceProperties })
);

describe('GET /api/devices/:id', () => {
	it('should return a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const propertyRepository = new MockPropertyRepository();
		const listingRepository = new MockListingRepository();
		const deviceService = new DeviceService(
			deviceRepository,
			propertyRepository,
			listingRepository
		);

		const params = { id: '1' };

		deviceRepository.getDeviceById = vi.fn().mockResolvedValue(mockDevice);
		propertyRepository.getPropertiesForDevice = vi.fn().mockResolvedValue(mockDeviceProperties);
		listingRepository.getDevicePrices = vi.fn().mockResolvedValue([]);

		const endpoint = await endpoint_GET({ deviceService, params });

		expect(deviceRepository.getDeviceById).toHaveBeenCalledWith(1);
		expect(endpoint.status).toBe(200);
		expect(endpoint.headers.get('Content-Type')).toBe('application/json');
		expect(await endpoint.json()).toEqual({
			success: true,
			device: { ...resultDevice, prices: [] }
		});
	});
});
