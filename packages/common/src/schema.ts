import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	real,
	serial,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
	jsonb
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	authProvider: text('auth_provider').notNull(),
	authProviderId: text('auth_provider_id').notNull(),
	isAdmin: boolean('is_admin').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const propertyTypeEnum = pgEnum('property_type', ['int', 'float', 'string', 'boolean']);
export const deviceTypeEnum = pgEnum('device_type', ['light', 'switch', 'sensor', 'plug']);
export const protocolEnum = pgEnum('protocol', ['zwave', 'zigbee', 'bluetooth', 'wifi']);

export const devicesTable = pgTable('devices', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	images: text('images').array().default([]).notNull(),
	deviceType: deviceTypeEnum('device_type').notNull(),
	protocol: protocolEnum('protocol').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const variantsTable = pgTable('variants', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const variantOptionsTable = pgTable('variant_options', {
	id: serial('id').primaryKey(),
	variantId: integer('variant_id')
		.references(() => variantsTable.id)
		.notNull(),
	value: text('value').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const deviceVariantsTable = pgTable(
	'device_variants',
	{
		deviceId: integer('device_id')
			.references(() => devicesTable.id)
			.notNull(),
		variantId: integer('variant_id')
			.references(() => variantsTable.id)
			.notNull(),
		variantOptionId: integer('variant_option_id')
			.references(() => variantOptionsTable.id)
			.notNull()
	},
	(table) => [
		index('device_variants_device_idx').on(table.deviceId),
		index('device_variants_variant_idx').on(table.variantId),
		index('device_variants_option_idx').on(table.variantOptionId)
	]
);

export const propertiesTable = pgTable('properties', {
	id: varchar('id', { length: 255 }).primaryKey(),
	name: text('name').notNull(),
	type: propertyTypeEnum('type').notNull(),
	unit: text('unit'),
	description: text('description'),
	minValue: real('min_value'),
	maxValue: real('max_value'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const devicePropertiesTable = pgTable(
	'device_properties',
	{
		deviceId: integer('device_id')
			.references(() => devicesTable.id)
			.notNull(),
		propertyId: varchar('property_id', { length: 255 })
			.references(() => propertiesTable.id)
			.notNull(),
		intValue: integer('int_value'),
		floatValue: real('float_value'),
		stringValue: text('string_value'),
		booleanValue: boolean('boolean_value')
	},
	(table) => [
		primaryKey({ columns: [table.deviceId, table.propertyId] }),
		index('device_idx').on(table.deviceId),
		index('property_idx').on(table.propertyId),
		check(
			'value_check',
			sql`(
                CASE WHEN int_value IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN float_value IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN string_value IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN boolean_value IS NOT NULL THEN 1 ELSE 0 END
            ) = 1`
		)
	]
);

export const sellersTable = pgTable('sellers', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	website: text('website'),
	scraperId: text('scraper_id').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const deviceListingsTable = pgTable(
	'device_listings',
	{
		id: serial('id').primaryKey(),
		deviceId: integer('device_id')
			.references(() => devicesTable.id)
			.notNull(),
		sellerId: integer('seller_id')
			.references(() => sellersTable.id)
			.notNull(),
		url: text('url').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		metadata: jsonb('metadata').default({}).notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => [
		unique('unique_listing').on(table.deviceId, table.sellerId),
		index('device_seller_idx').on(table.deviceId, table.sellerId),
		index('device_listings_device_idx').on(table.deviceId),
		index('device_listings_active_idx').on(table.deviceId, table.isActive)
	]
);

export const priceHistoryTable = pgTable(
	'price_history',
	{
		id: serial('id').primaryKey(),
		listingId: integer('listing_id')
			.references(() => deviceListingsTable.id)
			.notNull(),
		price: real('price').notNull(),
		inStock: boolean('in_stock').notNull().default(true),
		validFrom: timestamp('valid_from').notNull().defaultNow(),
		validTo: timestamp('valid_to'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => [
		index('listing_idx').on(table.listingId),
		index('valid_from_idx').on(table.validFrom),
		index('valid_to_idx').on(table.validTo),
		index('price_history_listing_valid_idx').on(table.listingId, table.validTo),
		index('price_history_current_idx')
			.on(table.listingId)
			.where(sql`valid_to IS NULL`)
	]
);

export const currentDevicePricesView = sql`
CREATE MATERIALIZED VIEW IF NOT EXISTS current_device_prices AS
SELECT 
    d.id as device_id,
    d.name as device_name,
    d.images,
    d.device_type,
    d.protocol,
    d.created_at as device_created_at,
    d.updated_at as device_updated_at,
    dl.id as listing_id,
    dl.seller_id,
    s.name as seller_name,
    dl.url,
    dl.is_active,
    ph.price,
    ph.in_stock
FROM devices d
LEFT JOIN device_listings dl ON d.id = dl.device_id AND dl.is_active = true
LEFT JOIN sellers s ON dl.seller_id = s.id
LEFT JOIN price_history ph ON dl.id = ph.listing_id AND ph.valid_to IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS current_device_prices_device_id_idx ON current_device_prices (device_id);
CREATE INDEX IF NOT EXISTS current_device_prices_price_idx ON current_device_prices (price);
CREATE INDEX IF NOT EXISTS current_device_prices_device_type_idx ON current_device_prices (device_type);

REFRESH MATERIALIZED VIEW current_device_prices;
`;
