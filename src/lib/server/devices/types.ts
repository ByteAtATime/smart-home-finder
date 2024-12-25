import { devicesTable } from '$lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const selectDeviceSchema = createSelectSchema(devicesTable);
export const insertDeviceSchema = createInsertSchema(devicesTable);

export type SelectDeviceSchema = typeof devicesTable.$inferSelect;
export type InsertDeviceSchema = typeof devicesTable.$inferInsert;

export interface IDeviceRepository {
	getDeviceById(id: number): Promise<SelectDeviceSchema | null>;
	insertDevice(device: InsertDeviceSchema): Promise<number>;
}
