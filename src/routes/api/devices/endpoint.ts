import type { IAuthProvider } from '$lib/server/auth/types';
import { insertDeviceSchema, type IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { json } from '@sveltejs/kit';
import type { z } from 'zod';

export const endpoint_GET: EndpointHandler<{
	deviceRepository: IDeviceRepository;
}> = async ({ deviceRepository }) => {
	const devices = await deviceRepository.getAllDevices();

	const devicesWithProperties = await Promise.all(
		devices.map(async (device) => ({
			...device,
			properties: await deviceRepository.getDeviceProperties(device.id)
		}))
	);

	return json({ success: true, devices: devicesWithProperties });
};

export const postBodySchema = insertDeviceSchema;

export const endpoint_POST: EndpointHandler<{
	authProvider: IAuthProvider;
	deviceRepository: IDeviceRepository;
	body: z.infer<typeof postBodySchema>;
}> = async ({ authProvider, deviceRepository, body }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = await deviceRepository.insertDevice(body);

	return json({ success: true, id: deviceId }, { status: 201 });
};
