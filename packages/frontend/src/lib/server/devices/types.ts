import type {
	Device,
	InsertDevice,
	PaginatedDevices,
	UpdateDevice,
	VariantWithOptions
} from '@smart-home-finder/common/types';

export interface IDeviceRepository {
	getAllDevices(): Promise<Device[]>;
	getDeviceById(id: number): Promise<Device | null>;
	insertDevice(device: InsertDevice): Promise<number>;
	updateDevice(id: number, device: UpdateDevice): Promise<Device | null>;
	deleteDevice(id: number): Promise<boolean>;
	getAllDevicesPaginated(page: number, pageSize: number): Promise<PaginatedDevices>;
	getVariantsForDevice(deviceId: number): Promise<VariantWithOptions[]>;
}
