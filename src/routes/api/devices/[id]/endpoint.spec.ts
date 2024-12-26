import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_GET } from './endpoint';
import type { Device, DeviceProperty } from '$lib/types/db';

const mockDevice = {
	id: 1,
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
		const params = { id: '1' };

		deviceRepository.getDeviceWithProperties = vi.fn().mockResolvedValue({
			...mockDevice,
			properties: mockDeviceProperties
		});

		const endpoint = await endpoint_GET({ deviceRepository, params });

		expect(deviceRepository.getDeviceWithProperties).toHaveBeenCalledWith(1);
		expect(endpoint.status).toBe(200);
		expect(endpoint.headers.get('Content-Type')).toBe('application/json');
		expect(await endpoint.json()).toEqual({
			success: true,
			device: resultDevice
		});
	});
});
