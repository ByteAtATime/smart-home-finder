import type {
	DeviceData,
	Paginated,
	UpdateDevice,
	VariantWithOptions
} from '@smart-home-finder/common/types';

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
		filters: { deviceType?: string[]; protocol?: string[] }
	): Promise<Paginated<DeviceData>>;
	getVariantsForDevice(deviceId: number): Promise<VariantWithOptions[]>;
}
