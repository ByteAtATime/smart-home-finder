import { eq } from 'drizzle-orm';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import type { InsertPropertySchema, IPropertyRepository, SelectPropertySchema } from './types';

export class PostgresPropertyRepository implements IPropertyRepository {
	async insertProperty(property: InsertPropertySchema): Promise<string> {
		const [newProperty] = await db.insert(propertiesTable).values(property).returning();

		return newProperty.id;
	}
}
