import type { IAuthProvider } from '$lib/server/auth/types';
import { insertDeviceSchema, type IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export const querySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	pageSize: z.coerce.number().min(1).max(100).optional().default(10)
});

export const endpoint_GET: EndpointHandler<{
	deviceRepository: IDeviceRepository;
	query: z.infer<typeof querySchema>;
}> = async ({ deviceRepository, query }) => {
	const devices = await deviceRepository.getAllDevicesPaginated(query.page, query.pageSize);

	const devicesWithProperties = await Promise.all(
		devices.devices.map(async (device) => ({
			...device,
			properties: await deviceRepository.getDeviceProperties(device.id)
		}))
	);

	return json({
		success: true,
		total: devices.total,
		pageSize: query.pageSize,
		page: query.page,
		devices: devicesWithProperties
	});
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
