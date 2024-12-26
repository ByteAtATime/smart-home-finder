import { devicesTable, devicePropertiesTable, propertiesTable } from '$lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const selectDeviceSchema = createSelectSchema(devicesTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	images: z.array(z.string())
});
export const insertDeviceSchema = createInsertSchema(devicesTable, {
	images: z.array(z.string()).optional()
});

export const selectPropertySchema = createSelectSchema(propertiesTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export const insertPropertySchema = createInsertSchema(propertiesTable);

export const selectDevicePropertySchema = createSelectSchema(devicePropertiesTable);

export type Device = z.infer<typeof selectDeviceSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Property = z.infer<typeof selectPropertySchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type DeviceProperty = z.infer<typeof selectDevicePropertySchema>;

const devicePropertyValueSchema = selectPropertySchema
	.extend({
		value: z.union([z.number(), z.number(), z.string(), z.boolean()])
	})
	.omit({
		createdAt: true,
		updatedAt: true
	});

export const deviceWithPropertiesSchema = selectDeviceSchema.extend({
	properties: z.record(z.string(), devicePropertyValueSchema)
});

export type DeviceWithProperties = z.infer<typeof deviceWithPropertiesSchema>;

export type PaginatedDevices = {
	devices: DeviceWithProperties[];
	total: number;
	page: number;
	pageSize: number;
};
