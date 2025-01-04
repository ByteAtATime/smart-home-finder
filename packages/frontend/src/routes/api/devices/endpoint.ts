import type { IAuthProvider } from '$lib/server/auth/types';
import { type DeviceService } from '$lib/server/devices/service';
import { type IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import type { IListingRepository } from '$lib/server/listings/types';
import type { PropertyJson } from '$lib/server/properties/property';
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
		.transform((val) => val?.split(',').map(Number)),
	propertyFilters: z
		.string()
		.optional()
		.transform((val) =>
			val?.split(',').map((filter) => {
				const [propertyId, deviceType, bounds] = filter.split(':');
				const [min, max] = bounds.split('-').map(Number);
				return {
					propertyId,
					deviceType: deviceType as (typeof deviceTypeEnum.enumValues)[number],
					bounds: [min, max]
				};
			})
		)
		.pipe(
			z
				.array(
					z.object({
						propertyId: z.string(),
						deviceType: z.enum(deviceTypeEnum.enumValues),
						bounds: z.array(z.number())
					})
				)
				.optional()
		)
});

export const endpoint_GET: EndpointHandler<{
	deviceService: DeviceService;
	listingRepository: IListingRepository;
	query: z.infer<typeof querySchema>;
}> = async ({ deviceService, listingRepository, query }) => {
	const {
		page,
		pageSize,
		deviceType,
		protocol,
		priceBounds: filterPriceRange,
		propertyFilters
	} = query;

	const [minPrice, maxPrice] = filterPriceRange ?? [null, null];

	const filteredDeviceTypes = await deviceService.getFilteredDeviceTypes({
		deviceType: deviceType ?? undefined,
		protocol: protocol ?? undefined,
		priceBounds: minPrice != null && maxPrice != null ? [minPrice, maxPrice] : undefined
	});

	const paginatedDevices = await deviceService.getAllDevicesWithVariantsAndProperties(
		page,
		pageSize,
		{
			deviceType: deviceType ?? undefined,
			protocol: protocol ?? undefined,
			priceBounds: minPrice != null && maxPrice != null ? [minPrice, maxPrice] : undefined,
			propertyFilters: propertyFilters ?? undefined
		}
	);

	const databasePriceRange = await listingRepository.getPriceBounds();

	const allProperties = await deviceService.getAllProperties();
	const propertiesByDeviceTypePromise = allProperties.reduce(
		(acc, property) => {
			const deviceTypes = getDeviceTypesForProperty(property.id);
			const availableDeviceTypes = deviceTypes.filter((dt) => filteredDeviceTypes.includes(dt));
			for (const deviceType of availableDeviceTypes) {
				if (!acc[deviceType]) {
					acc[deviceType] = [];
				}
				acc[deviceType].push(property.toJson());
			}
			return acc;
		},
		{} as Record<string, Promise<PropertyJson>[]>
	);

	const propertiesByDeviceType = Object.fromEntries(
		await Promise.all(
			Object.entries(propertiesByDeviceTypePromise).map(async ([deviceType, properties]) => [
				deviceType,
				await Promise.all(properties)
			])
		)
	);

	return json({
		success: true,
		total: paginatedDevices.total,
		pageSize,
		page,
		devices: paginatedDevices.items,
		priceBounds: databasePriceRange,
		propertiesByDeviceType,
		availableDeviceTypes: filteredDeviceTypes
	});
};

// TODO: This should come from a database table
function getDeviceTypesForProperty(
	propertyId: string
): (typeof deviceTypeEnum.enumValues)[number][] {
	switch (propertyId) {
		case 'voltage':
			return ['switch'];
		case 'color':
			return ['light'];
		case 'power':
			return ['plug'];
		case 'state':
			return ['switch', 'plug'];
		default:
			return [];
	}
}

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
