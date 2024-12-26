import { propertiesTable } from '$lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

export const selectPropertySchema = createSelectSchema(propertiesTable);
export const insertPropertySchema = createInsertSchema(propertiesTable);

export type SelectPropertySchema = z.infer<typeof selectPropertySchema>;
export type InsertPropertySchema = z.infer<typeof insertPropertySchema>;

export interface IPropertyRepository {
	insertProperty(property: InsertPropertySchema): Promise<string>;
}
