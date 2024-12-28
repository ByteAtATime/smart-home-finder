import type {
	Device,
	InsertDevice,
	PaginatedDevices,
	VariantWithOptions
} from '@smart-home-finder/common/types';

export interface IDeviceRepository {
	getAllDevices(): Promise<Device[]>;
	getDeviceById(id: number): Promise<Device | null>;
	insertDevice(device: InsertDevice): Promise<number>;
	getAllDevicesPaginated(page: number, pageSize: number): Promise<PaginatedDevices>;
	getVariantsForDevice(deviceId: number): Promise<VariantWithOptions[]>;
}
