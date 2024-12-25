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
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const propertyTypeEnum = pgEnum('property_type', ['int', 'float', 'string', 'boolean']);

export const devices = pgTable('devices', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	deviceType: text('device_type').notNull(),
	brand: text('brand').notNull(),
	model: text('model').notNull(),
	protocol: text('protocol').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const properties = pgTable('properties', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	type: propertyTypeEnum('type').notNull(),
	unit: text('unit'),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const deviceProperties = pgTable(
	'device_properties',
	{
		deviceId: integer('device_id')
			.references(() => devices.id)
			.notNull(),
		propertyId: integer('property_id')
			.references(() => properties.id)
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
		),
		// Ensure the value type matches the property type
		typeCheck: check(
			'type_check',
			sql`
                (SELECT type FROM properties WHERE id = property_id) = 'int' AND int_value IS NOT NULL
                OR (SELECT type FROM properties WHERE id = property_id) = 'float' AND float_value IS NOT NULL 
                OR (SELECT type FROM properties WHERE id = property_id) = 'string' AND string_value IS NOT NULL
                OR (SELECT type FROM properties WHERE id = property_id) = 'boolean' AND boolean_value IS NOT NULL
            `
		)
	})
);
