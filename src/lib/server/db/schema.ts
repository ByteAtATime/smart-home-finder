import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	authProvider: text('auth_provider').notNull(),
	authProviderId: text('auth_provider_id').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
