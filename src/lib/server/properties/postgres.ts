import { eq } from 'drizzle-orm';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import type { IPropertyRepository } from './types';
import type { InsertProperty } from '$lib/types/db';

export class PostgresPropertyRepository implements IPropertyRepository {
	async insertProperty(property: InsertProperty): Promise<string> {
		const [newProperty] = await db.insert(propertiesTable).values(property).returning();

		return newProperty.id;
	}
}
