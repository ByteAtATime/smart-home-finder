import type { IAuthProvider } from '$lib/server/auth/types';
import { type DeviceService } from '$lib/server/devices/service';
import { type IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import type { IListingRepository } from '$lib/server/listings/types';
import { deviceTypeEnum, protocolEnum } from '@smart-home-finder/common/schema';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export const querySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	pageSize: z.coerce.number().min(1).max(100).optional().default(10),
	deviceType: z
		.string()
		.optional()
		.transform((val) => val?.split(','))
		.pipe(z.array(z.enum(deviceTypeEnum.enumValues)).optional()),
	protocol: z
		.string()
		.optional()
		.transform((val) => val?.split(','))
		.pipe(z.array(z.enum(protocolEnum.enumValues)).optional()),
	priceBounds: z
		.string()
		.optional()
		.transform((val) => val?.split(',').map(Number))
});

export const endpoint_GET: EndpointHandler<{
	deviceService: DeviceService;
	listingRepository: IListingRepository;
	query: z.infer<typeof querySchema>;
}> = async ({ deviceService, listingRepository, query }) => {
	const { page, pageSize, deviceType, protocol, priceBounds: filterPriceRange } = query;

	const [minPrice, maxPrice] = filterPriceRange ?? [null, null];

	const paginatedDevices = await deviceService.getAllDevicesWithVariantsAndProperties(
		page,
		pageSize,
		{
			deviceType: deviceType ?? undefined,
			protocol: protocol ?? undefined,
			priceBounds: minPrice != null && maxPrice != null ? [minPrice, maxPrice] : undefined
		}
	);

	const databasePriceRange = await listingRepository.getPriceBounds();

	return json({
		success: true,
		total: paginatedDevices.total,
		pageSize,
		page,
		devices: paginatedDevices.items,
		priceBounds: databasePriceRange
	});
};

export const postBodySchema = z.object({
	name: z.string().min(1),
	protocol: z.enum(protocolEnum.enumValues),
	deviceType: z.enum(deviceTypeEnum.enumValues),
	images: z.array(z.string()).optional()
});

export const endpoint_POST: EndpointHandler<{
	authProvider: IAuthProvider;
	deviceRepository: IDeviceRepository;
	body: z.infer<typeof postBodySchema>;
}> = async ({ authProvider, deviceRepository, body }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = await deviceRepository.insertDevice({
		name: body.name,
		protocol: body.protocol,
		deviceType: body.deviceType,
		images: body.images ?? [],

		// ignored
		id: 0,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	return json({ success: true, id: deviceId }, { status: 201 });
};
