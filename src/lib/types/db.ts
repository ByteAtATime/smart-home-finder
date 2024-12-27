import {
	devicesTable,
	devicePropertiesTable,
	propertiesTable,
	sellersTable,
	deviceListingsTable,
	priceHistoryTable
} from '$lib/server/db/schema';
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

export const selectSellerSchema = createSelectSchema(sellersTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export const insertSellerSchema = createInsertSchema(sellersTable);

export const selectDeviceListingSchema = createSelectSchema(deviceListingsTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export const insertDeviceListingSchema = createInsertSchema(deviceListingsTable);

export const selectPriceHistorySchema = createSelectSchema(priceHistoryTable, {
	validFrom: z.coerce.date(),
	validTo: z.coerce.date().nullable(),
	createdAt: z.coerce.date()
});
export const insertPriceHistorySchema = createInsertSchema(priceHistoryTable, {
	validFrom: z.coerce.date().optional(),
	validTo: z.coerce.date().nullable().optional()
});

export type Device = z.infer<typeof selectDeviceSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Property = z.infer<typeof selectPropertySchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type DeviceProperty = z.infer<typeof selectDevicePropertySchema>;
export type Seller = z.infer<typeof selectSellerSchema>;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type DeviceListing = z.infer<typeof selectDeviceListingSchema>;
export type InsertDeviceListing = z.infer<typeof insertDeviceListingSchema>;
export type PriceHistory = z.infer<typeof selectPriceHistorySchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

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

export const currentPriceSchema = z.object({
	// Listing information
	listingId: z.number(),
	deviceId: z.number(),
	sellerId: z.number(),
	sellerName: z.string(),
	url: z.string(),
	isActive: z.boolean(),
	listingCreatedAt: z.coerce.date(),
	listingUpdatedAt: z.coerce.date(),

	// Price information
	priceId: z.number(),
	price: z.number(),
	inStock: z.boolean(),
	validFrom: z.coerce.date(),
	validTo: z.coerce.date().nullable(),
	priceCreatedAt: z.coerce.date()
});

export const deviceWithListingsSchema = selectDeviceSchema.extend({
	listings: z.array(
		selectDeviceListingSchema.extend({
			seller: selectSellerSchema,
			currentPrice: selectPriceHistorySchema.nullable()
		})
	)
});

export type DeviceWithProperties = z.infer<typeof deviceWithPropertiesSchema>;
export type CurrentPrice = z.infer<typeof currentPriceSchema>;
export type DeviceWithListings = z.infer<typeof deviceWithListingsSchema>;

export type PaginatedDevices = {
	devices: DeviceWithProperties[];
	total: number;
	page: number;
	pageSize: number;
};
