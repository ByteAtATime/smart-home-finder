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
	uuid
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
export const deviceTypeEnum = pgEnum('device_type', ['light', 'switch', 'plug']);
export const protocolEnum = pgEnum('protocol', ['zwave', 'zigbee', 'bluetooth', 'wifi']);

export const devicesTable = pgTable('devices', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	deviceType: deviceTypeEnum('device_type').notNull(),
	protocol: protocolEnum('protocol').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const propertiesTable = pgTable('properties', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	type: propertyTypeEnum('type').notNull(),
	unit: text('unit'),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const devicePropertiesTable = pgTable(
	'device_properties',
	{
		deviceId: integer('device_id')
			.references(() => devicesTable.id)
			.notNull(),
		propertyId: integer('property_id')
			.references(() => propertiesTable.id)
			.notNull(),
		intValue: integer('int_value'),
		floatValue: real('float_value'),
		stringValue: text('string_value'),
		booleanValue: boolean('boolean_value')
	},
	(table) => ({
		pk: primaryKey({ columns: [table.deviceId, table.propertyId] }),
		deviceIdx: index('device_idx').on(table.deviceId),
		propertyIdx: index('property_idx').on(table.propertyId),
		// Ensure only one value type is set
		valueCheck: check(
			'value_check',
			sql`(
                CASE WHEN int_value IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN float_value IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN string_value IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN boolean_value IS NOT NULL THEN 1 ELSE 0 END
            ) = 1`
		)
	})
);
