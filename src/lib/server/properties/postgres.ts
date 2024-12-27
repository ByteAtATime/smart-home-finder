import { db } from '../db';
import { devicePropertiesTable, propertiesTable } from '../db/schema';
import type { IPropertyRepository } from './types';
import type { DeviceWithProperties, InsertProperty } from '$lib/types/db';
import { eq } from 'drizzle-orm';

export class PostgresPropertyRepository implements IPropertyRepository {
	async insertProperty(property: InsertProperty): Promise<string> {
		const [newProperty] = await db.insert(propertiesTable).values(property).returning();

		return newProperty.id;
	}

	async getPropertiesForDevice(
		deviceId: number
	): Promise<Record<string, DeviceWithProperties['properties'][number]>> {
		const properties = await db
			.select()
			.from(propertiesTable)
			.leftJoin(devicePropertiesTable, eq(propertiesTable.id, devicePropertiesTable.propertyId))
			.where(eq(devicePropertiesTable.deviceId, deviceId));

		const deviceProperties: Record<string, DeviceWithProperties['properties'][number]> = {};

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
				value: propertyValue
			};
		}

		return deviceProperties;
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
