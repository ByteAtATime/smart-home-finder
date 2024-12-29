import { db } from '../db';
import { devicePropertiesTable, propertiesTable } from '@smart-home-finder/common/schema';
import type { IPropertyRepository } from './types';
import {
	selectPropertySchema,
	type DeviceProperties,
	type InsertProperty,
	type Property,
	type UpdateProperty
} from '@smart-home-finder/common/types';
import { eq, sql } from 'drizzle-orm';

export class PostgresPropertyRepository implements IPropertyRepository {
	async insertProperty(property: InsertProperty): Promise<string> {
		const [newProperty] = await db.insert(propertiesTable).values(property).returning();

		return newProperty.id;
	}

	async getPropertiesForDevice(deviceId: number): Promise<DeviceProperties> {
		const properties = await db
			.select()
			.from(propertiesTable)
			.leftJoin(devicePropertiesTable, eq(propertiesTable.id, devicePropertiesTable.propertyId))
			.where(eq(devicePropertiesTable.deviceId, deviceId));

		const deviceProperties: DeviceProperties = {};

		for (const property of properties) {
			const propertyId = property.device_properties!.propertyId;
			const propertyType = property.properties.type;

			if (!propertyType) continue;

			const propertyValue = this.extractPropertyValue(property.device_properties!);

			if (propertyValue === null) continue;

			deviceProperties[propertyId] = {
				id: propertyId,
				name: property.properties.name,
				type: propertyType,
				unit: property.properties.unit,
				description: property.properties.description,
				value: propertyValue,
				createdAt: property.properties.createdAt,
				updatedAt: property.properties.updatedAt
			};
		}

		return deviceProperties;
	}

	async getAllProperties(): Promise<Property[]> {
		const properties = await db.query.propertiesTable.findMany();
		return properties.map((p) => selectPropertySchema.parse(p));
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

		return selectPropertySchema.parse(result[0]);
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
