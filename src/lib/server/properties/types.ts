import type { InsertProperty } from '$lib/types/db';

export interface IPropertyRepository {
	insertProperty(property: InsertProperty): Promise<string>;
}
