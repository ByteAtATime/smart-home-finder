import type { Device, InsertDevice, PaginatedDevices } from '$lib/types/db';

export interface IDeviceRepository {
	getAllDevices(): Promise<Device[]>;
	getDeviceById(id: number): Promise<Device | null>;
	insertDevice(device: InsertDevice): Promise<number>; // Returns the ID of the new device
	getAllDevicesPaginated(page: number, pageSize: number): Promise<PaginatedDevices>;
}
