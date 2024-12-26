import { devicePropertiesTable, devicesTable } from '$lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

export const selectDeviceSchema = createSelectSchema(devicesTable);
export const insertDeviceSchema = createInsertSchema(devicesTable);

export type SelectDeviceSchema = z.infer<typeof selectDeviceSchema>;
export type InsertDeviceSchema = z.infer<typeof insertDeviceSchema>;

export const selectDevicePropertySchema = createSelectSchema(devicePropertiesTable);
export const insertDevicePropertySchema = createInsertSchema(devicePropertiesTable);

export type SelectDevicePropertySchema = z.infer<typeof selectDevicePropertySchema>;
export type InsertDevicePropertySchema = z.infer<typeof insertDevicePropertySchema>;

export type PropertyValue =
	| { type: 'int'; value: number }
	| { type: 'float'; value: number }
	| { type: 'string'; value: string }
	| { type: 'boolean'; value: boolean };

export type DeviceProperties = Record<string, PropertyValue & { name: string }>;
export type SelectDeviceWithProperties = SelectDeviceSchema & {
	properties: DeviceProperties;
};

export interface IDeviceRepository {
	getDeviceById(id: number): Promise<SelectDeviceSchema | null>;
	addDeviceProperty(deviceId: number, propertyId: string, value: PropertyValue): Promise<string>;
	getDeviceProperties(deviceId: number): Promise<DeviceProperties>;
	insertDevice(device: InsertDeviceSchema): Promise<number>;
	getAllDevices(): Promise<SelectDeviceSchema[]>;
}
