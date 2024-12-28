import type { IAuthProvider } from '$lib/server/auth/types';
import { type DeviceService } from '$lib/server/devices/service';
import type { IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { insertDeviceSchema, type PaginatedDevices } from '@smart-home-finder/common/types';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export const querySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	pageSize: z.coerce.number().min(1).max(100).optional().default(10)
});

export const endpoint_GET: EndpointHandler<{
	deviceService: DeviceService;
	query: z.infer<typeof querySchema>;
}> = async ({ deviceService, query }) => {
	const paginatedDevices: PaginatedDevices =
		await deviceService.getAllDevicesWithVariantsAndProperties(query.page, query.pageSize);

	return json({
		success: true,
		total: paginatedDevices.total,
		pageSize: query.pageSize,
		page: query.page,
		devices: paginatedDevices.devices
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
