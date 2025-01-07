import { deviceTypeEnum, protocolEnum } from '@smart-home-finder/common/schema';
import type {
	DeviceData,
	DeviceType,
	Paginated,
	UpdateDevice
} from '@smart-home-finder/common/types';
import { z } from 'zod';

export const deviceFiltersSchema = z.object({
	deviceType: z.array(z.enum(deviceTypeEnum.enumValues)).optional(),
	protocol: z.array(z.enum(protocolEnum.enumValues)).optional(),
	priceBounds: z.array(z.number()).optional(),
	search: z.string().optional(),
	propertyFilters: z
		.array(
			z.object({
				propertyId: z.string(),
				deviceType: z.enum(deviceTypeEnum.enumValues),
				bounds: z.array(z.number())
			})
		)
		.optional()
});

export type DeviceFilters = z.infer<typeof deviceFiltersSchema>;

export interface IDeviceRepository {
	getAllDevices(): Promise<DeviceData[]>;
	getBaseDeviceById(id: number): Promise<DeviceData | null>;
	/**
	 * Inserts a new {@link Device} into the database.
	 *
	 * @param device - The device to insert. The fields `id`, `createdAt` are ignored.
	 * @returns The ID of the inserted device.
	 */
	insertDevice(device: DeviceData): Promise<number>;
	updateDevice(id: number, device: UpdateDevice): Promise<DeviceData | null>;
	deleteDevice(id: number): Promise<boolean>;
	getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters?: DeviceFilters
	): Promise<Paginated<DeviceData>>;

	/**
	 * Gets all device types that match the given filters, excluding property filters.
	 * This is used to show available device types in the UI before pagination.
	 */
	getFilteredDeviceTypes(filters: Omit<DeviceFilters, 'propertyFilters'>): Promise<DeviceType[]>;
}
