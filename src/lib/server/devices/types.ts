import { devicePropertiesTable, devicesTable } from '$lib/server/db/schema';
import type { Device, DeviceWithProperties, InsertDevice, PaginatedDevices } from '$lib/types/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

export interface IDeviceRepository {
	getAllDevices(): Promise<Device[]>;
	getDeviceById(id: number): Promise<Device | null>;
	insertDevice(device: InsertDevice): Promise<number>; // Returns the ID of the new device
	getDeviceWithProperties(id: number): Promise<DeviceWithProperties | null>;
	getAllDevicesPaginated(page: number, pageSize: number): Promise<PaginatedDevices>;
}
