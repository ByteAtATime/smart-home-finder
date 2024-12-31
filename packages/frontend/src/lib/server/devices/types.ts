import type {
	BaseDevice,
	Paginated,
	UpdateDevice,
	VariantWithOptions
} from '@smart-home-finder/common/types';

export interface IDeviceRepository {
	getAllDevices(): Promise<BaseDevice[]>;
	getBaseDeviceById(id: number): Promise<BaseDevice | null>;
	/**
	 * Inserts a new {@link Device} into the database.
	 *
	 * @param device - The device to insert. The fields `id`, `createdAt` are ignored.
	 * @returns The ID of the inserted device.
	 */
	insertDevice(device: BaseDevice): Promise<number>;
	updateDevice(id: number, device: UpdateDevice): Promise<BaseDevice | null>;
	deleteDevice(id: number): Promise<boolean>;
	getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: { deviceType?: string[]; protocol?: string[] }
	): Promise<Paginated<BaseDevice>>;
	getVariantsForDevice(deviceId: number): Promise<VariantWithOptions[]>;
}
