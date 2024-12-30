import type { IAuthProvider } from '$lib/server/auth/types';
import { type DeviceService } from '$lib/server/devices/service';
import type { IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { deviceTypeEnum, protocolEnum } from '@smart-home-finder/common/schema';
import { insertDeviceSchema } from '@smart-home-finder/common/types';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export const querySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	pageSize: z.coerce.number().min(1).max(100).optional().default(10),
	deviceType: z
		.string()
		.refine(
			(value) => {
				const parts = value.split(',');
				return parts.every((part) =>
					(Object.values(deviceTypeEnum.enumValues) as string[]).includes(part)
				);
			},
			{
				message:
					'Each value must be one of: ' +
					(Object.values(deviceTypeEnum.enumValues) as string[]).join(', ')
			}
		)
		.optional(),
	protocol: z
		.string()
		.refine(
			(value) => {
				const parts = value.split(',');
				return parts.every((part) =>
					(Object.values(protocolEnum.enumValues) as string[]).includes(part)
				);
			},
			{
				message:
					'Each value must be one of: ' +
					(Object.values(protocolEnum.enumValues) as string[]).join(', ')
			}
		)
		.optional()
});

export const endpoint_GET: EndpointHandler<{
	deviceService: DeviceService;
	query: z.infer<typeof querySchema>;
}> = async ({ deviceService, query }) => {
	const { page, pageSize, deviceType, protocol } = query;

	const paginatedDevices = await deviceService.getAllDevicesWithVariantsAndProperties(
		page,
		pageSize,
		{
			deviceType: deviceType ? deviceType.split(',') : undefined,
			protocol: protocol ? protocol.split(',') : undefined
		}
	);

	return json({
		success: true,
		total: paginatedDevices.total,
		pageSize,
		page,
		devices: paginatedDevices.items
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
