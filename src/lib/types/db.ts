import { devicesTable, devicePropertiesTable, propertiesTable } from '$lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const selectDeviceSchema = createSelectSchema(devicesTable);
export const insertDeviceSchema = createInsertSchema(devicesTable);

export const selectPropertySchema = createSelectSchema(propertiesTable);
export const insertPropertySchema = createInsertSchema(propertiesTable);

export const selectDevicePropertySchema = createSelectSchema(devicePropertiesTable);

export type Device = z.infer<typeof selectDeviceSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Property = z.infer<typeof selectPropertySchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type DeviceProperty = z.infer<typeof selectDevicePropertySchema>;

export const deviceWithPropertiesSchema = selectDeviceSchema.extend({
	properties: z.record(selectPropertySchema.merge(selectDevicePropertySchema))
});

export type DeviceWithProperties = z.infer<typeof deviceWithPropertiesSchema>;

export type PaginatedDevices = {
	devices: DeviceWithProperties[];
	total: number;
	page: number;
	pageSize: number;
};
