import { devicesTable } from '$lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

export const selectDeviceSchema = createSelectSchema(devicesTable);
export const insertDeviceSchema = createInsertSchema(devicesTable);

export type SelectDeviceSchema = z.infer<typeof selectDeviceSchema>;
export type InsertDeviceSchema = z.infer<typeof insertDeviceSchema>;

export interface IDeviceRepository {
	getDeviceById(id: number): Promise<SelectDeviceSchema | null>;
	insertDevice(device: InsertDeviceSchema): Promise<number>;
	getAllDevices(): Promise<SelectDeviceSchema[]>;
}
