import { MockAuthProvider } from '$lib/server/auth/mock';
import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it, vi } from 'vitest';
import { endpoint_POST, postBodySchema } from './endpoint';
import type { InsertDeviceSchema } from '$lib/server/devices/types';

describe('devices', () => {
	it('should allow an admin to create a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockAdmin();
		const body = {
			name: 'Test Device',
			deviceType: 'test device type',
			brand: 'test brand',
			model: 'test model',
			protocol: 'test protocol'
		} satisfies InsertDeviceSchema;

		deviceRepository.insertDevice = vi.fn().mockResolvedValue(1);

		const endpoint = await endpoint_POST({ authProvider, deviceRepository, body });

		expect(deviceRepository.insertDevice).toHaveBeenCalledWith(body);
		expect(endpoint.status).toBe(201);
		expect(endpoint.headers.get('Content-Type')).toBe('application/json');
		expect(await endpoint.json()).toEqual({ success: true, id: 1 });
	});

	it('should return 401 if the user is not an admin', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider().mockSignedIn();
		const body = {
			name: 'Test Device',
			deviceType: 'test device type',
			brand: 'test brand',
			model: 'test model',
			protocol: 'test protocol'
		} satisfies InsertDeviceSchema;

		const endpoint = await endpoint_POST({ authProvider, deviceRepository, body });

		expect(deviceRepository.insertDevice).not.toHaveBeenCalled();
		expect(endpoint.status).toBe(401);
		expect(endpoint.headers.get('Content-Type')).toBe('application/json');
		expect(await endpoint.json()).toEqual({ success: false, error: 'Unauthorized' });
	});
});
