import { MockDeviceRepository } from '$lib/server/devices/mock';
import type { DeviceProperties, SelectDeviceSchema } from '$lib/server/devices/types';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_GET } from './endpoint';

const mockDevice = {
	id: 1,
	name: 'Test Device',
	deviceType: 'light',
	protocol: 'zwave',
	createdAt: new Date(),
	updatedAt: new Date()
} satisfies SelectDeviceSchema;
const mockDeviceProperties = {
	voltage: { type: 'float', value: 123.45, name: 'Voltage' }
} satisfies DeviceProperties;
const resultDevice = JSON.parse(
	JSON.stringify({ ...mockDevice, properties: mockDeviceProperties })
);

describe('GET /api/devices/:id', () => {
	it('should return a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const params = { id: '1' };

		deviceRepository.getDeviceById = vi.fn().mockResolvedValue(mockDevice);
		deviceRepository.getDeviceProperties = vi.fn().mockResolvedValue(mockDeviceProperties);

		const endpoint = await endpoint_GET({ deviceRepository, params });

		expect(deviceRepository.getDeviceById).toHaveBeenCalledWith(1);
		expect(deviceRepository.getDeviceProperties).toHaveBeenCalledWith(1);
		expect(endpoint.status).toBe(200);
		expect(endpoint.headers.get('Content-Type')).toBe('application/json');
		expect(await endpoint.json()).toEqual({
			success: true,
			device: resultDevice
		});
	});
});
