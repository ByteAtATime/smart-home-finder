import {
	devicesTable,
	devicePropertiesTable,
	propertiesTable,
	sellersTable,
	deviceListingsTable,
	priceHistoryTable,
	variantsTable,
	variantOptionsTable,
	deviceTypeEnum,
	protocolEnum
} from '../schema';
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

export const updateDeviceSchema = createInsertSchema(devicesTable, {
	images: z.array(z.string()).optional()
})
	.partial()
	.omit({ id: true, createdAt: true });

export const selectVariantSchema = createSelectSchema(variantsTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export const insertVariantSchema = createInsertSchema(variantsTable);

export const selectVariantOptionSchema = createSelectSchema(variantOptionsTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export const insertVariantOptionSchema = createInsertSchema(variantOptionsTable);

export const selectPropertySchema = createSelectSchema(propertiesTable, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});
export const insertPropertySchema = createInsertSchema(propertiesTable);
export const updatePropertySchema = createInsertSchema(propertiesTable).partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true
});

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

export type DeviceType = (typeof deviceTypeEnum.enumValues)[number];
export type DeviceProtocol = (typeof protocolEnum.enumValues)[number];

export type UpdateDevice = z.infer<typeof updateDeviceSchema>;
export type Property = z.infer<typeof selectPropertySchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type SelectDeviceProperty = z.infer<typeof selectDevicePropertySchema>;
export type Seller = z.infer<typeof selectSellerSchema>;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type DeviceListing = z.infer<typeof selectDeviceListingSchema>;
export type InsertDeviceListing = z.infer<typeof insertDeviceListingSchema>;
export type PriceHistory = z.infer<typeof selectPriceHistorySchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type Variant = z.infer<typeof selectVariantSchema>;
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type VariantOption = z.infer<typeof selectVariantOptionSchema>;
export type InsertVariantOption = z.infer<typeof insertVariantOptionSchema>;

export const variantWithOptionsSchema = selectVariantSchema.extend({
	options: selectVariantOptionSchema
		.extend({
			deviceId: z.number()
		})
		.array()
});

export type VariantWithOptions = z.infer<typeof variantWithOptionsSchema>;

const devicePropertyValueSchema = selectPropertySchema.extend({
	value: z.union([z.number(), z.number(), z.string(), z.boolean()])
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
	priceCreatedAt: z.coerce.date(),
	priceUpdatedAt: z.coerce.date()
});

export const deviceSchema = selectDeviceSchema.extend({
	properties: z.record(z.string(), devicePropertyValueSchema),
	variants: z.array(variantWithOptionsSchema),
	listings: z.array(currentPriceSchema)
});

export const deviceWithListingsSchema = selectDeviceSchema.extend({
	listings: z.array(
		selectDeviceListingSchema.extend({
			seller: selectSellerSchema,
			currentPrice: selectPriceHistorySchema.nullable()
		})
	)
});

export type DeviceData = z.infer<typeof selectDeviceSchema>;

export type DeviceProperty = z.infer<typeof devicePropertyValueSchema>;

export type DeviceProperties = Record<string, DeviceProperty>;

export type DeviceWithDetails = z.infer<typeof deviceSchema>;
export type ListingWithPrice = z.infer<typeof currentPriceSchema>;
export type DeviceWithListings = z.infer<typeof deviceWithListingsSchema>;

export type PaginatedDevices = {
	devices: DeviceData[];
	total: number;
	page: number;
	pageSize: number;
};

export type PaginatedDevicesWithDetails = {
	devices: DeviceWithDetails[];
	total: number;
	page: number;
	pageSize: number;
};

export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
};
