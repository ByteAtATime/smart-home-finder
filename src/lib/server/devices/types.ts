import { devicesTable } from '$lib/server/db/schema';

export type Device = typeof devicesTable.$inferSelect;

export interface IDeviceRepository {
	getDeviceById(id: number): Promise<Device | null>;
}
