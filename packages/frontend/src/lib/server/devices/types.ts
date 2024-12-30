import type {
	BaseDevice,
	InsertDevice,
	Paginated,
	UpdateDevice,
	VariantWithOptions
} from '@smart-home-finder/common/types';

export interface IDeviceRepository {
	getAllDevices(): Promise<BaseDevice[]>;
	getBaseDeviceById(id: number): Promise<BaseDevice | null>;
	insertDevice(device: InsertDevice): Promise<number>;
	updateDevice(id: number, device: UpdateDevice): Promise<BaseDevice | null>;
	deleteDevice(id: number): Promise<boolean>;
	getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: { deviceType?: string[]; protocol?: string[] }
	): Promise<Paginated<BaseDevice>>;
	getVariantsForDevice(deviceId: number): Promise<VariantWithOptions[]>;
}
