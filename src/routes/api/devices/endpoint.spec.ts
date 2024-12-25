import { MockAuthProvider } from '$lib/server/auth/mock';
import { MockDeviceRepository } from '$lib/server/devices/mock';
import { describe, expect, it } from 'vitest';
import { endpoint_POST, postBodySchema } from './endpoint';
import type { z } from 'zod';

describe('devices', () => {
	it('should allow an admin to create a device', async () => {
		const deviceRepository = new MockDeviceRepository();
		const authProvider = new MockAuthProvider();
		const body = {
			name: 'Test Device'
		} satisfies z.infer<typeof postBodySchema>;

		const endpoint = endpoint_POST({ authProvider, deviceRepository, body });

		expect(deviceRepository.insertDevice).toHaveBeenCalledWith({
			name: 'test',
			description: 'test',
			userId: '1'
		});
	});
});
