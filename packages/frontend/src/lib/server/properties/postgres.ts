import { db } from '../db';
import { devicePropertiesTable, propertiesTable } from '@smart-home-finder/common/schema';
import type { IPropertyRepository } from './types';
import { selectPropertySchema, type UpdateProperty } from '@smart-home-finder/common/types';
import { eq, sql, and, getTableColumns } from 'drizzle-orm';
import { Property } from './property';

export class PostgresPropertyRepository implements IPropertyRepository {
	async insertProperty(property: Property): Promise<string> {
		const [newProperty] = await db
			.insert(propertiesTable)
			.values({
				id: property.id,
				name: property.name,
				type: property.type,
				unit: property.unit,
				minValue: property.minValue,
				maxValue: property.maxValue,
				description: property.description
			})
			.returning();

		return newProperty.id;
	}

	async getAllProperties(): Promise<Property[]> {
		const properties = await db.query.propertiesTable.findMany();
		return properties.map((p) => new Property(selectPropertySchema.parse(p), this));
	}

	async getDeviceProperties(deviceId: number): Promise<Property[]> {
		const properties = await db
			.select(getTableColumns(propertiesTable))
			.from(propertiesTable)
			.innerJoin(devicePropertiesTable, eq(devicePropertiesTable.propertyId, propertiesTable.id))
			.where(eq(devicePropertiesTable.deviceId, deviceId))
			.execute();

		return properties.map((p) => new Property(selectPropertySchema.parse(p), this));
	}

	async getPropertyById(id: string): Promise<Property | null> {
		const result = await db
			.select()
			.from(propertiesTable)
			.where(eq(propertiesTable.id, id))
			.execute();

		if (result.length === 0) {
			return null;
		}

		return new Property(selectPropertySchema.parse(result[0]), this);
	}

	async updateProperty(id: string, propertyData: UpdateProperty): Promise<Property | null> {
		const result = await db
			.update(propertiesTable)
			.set({ ...propertyData, updatedAt: sql`CURRENT_TIMESTAMP` })
			.where(eq(propertiesTable.id, id))
			.returning();

		if (result.length === 0) {
			return null;
		}

		return new Property(selectPropertySchema.parse(result[0]), this);
	}

	async deleteProperty(id: string): Promise<boolean> {
		try {
			const result = await db.delete(propertiesTable).where(eq(propertiesTable.id, id));

			return result.length > 0;
		} catch (error) {
			console.error('Failed to delete property:', error);
			throw error;
		}
	}

	async getPropertyValueForDevice(
		propertyId: string,
		deviceId: number
	): Promise<string | number | boolean | null> {
		const property = await db
			.select()
			.from(devicePropertiesTable)
			.where(
				and(
					eq(devicePropertiesTable.propertyId, propertyId),
					eq(devicePropertiesTable.deviceId, deviceId)
				)
			)
			.limit(1)
			.execute();

		if (property.length === 0) {
			return null;
		}

		return this.extractPropertyValue(property[0]);
	}

	// Helper function to extract the correct value based on type
	private extractPropertyValue(
		property: typeof devicePropertiesTable.$inferSelect
	): string | number | boolean | null {
		if (property.intValue !== null) {
			return property.intValue;
		} else if (property.floatValue !== null) {
			return property.floatValue;
		} else if (property.stringValue !== null) {
			return property.stringValue;
		} else if (property.booleanValue !== null) {
			return property.booleanValue;
		}
		return null;
	}
}
