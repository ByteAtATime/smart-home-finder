import { db } from '../db';
import { devicePropertiesTable, propertiesTable } from '@smart-home-finder/common/schema';
import type { IPropertyRepository } from './types';
import { selectPropertySchema, type UpdateProperty } from '@smart-home-finder/common/types';
import { eq, sql, and, getTableColumns, inArray } from 'drizzle-orm';
import { Property } from './property';

export class PostgresPropertyRepository implements IPropertyRepository {
	// Cache for properties by device ID
	private devicePropertiesCache = new Map<number, Promise<Property[]>>();
	// Cache for property values by device ID and property ID
	private propertyValuesCache = new Map<string, Promise<string | number | boolean | null>>();

	private getValueKey(propertyId: string, deviceId: number): string {
		return `${propertyId}:${deviceId}`;
	}

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
		const cached = this.devicePropertiesCache.get(deviceId);
		if (cached) return cached;

		return this.fetchDeviceProperties(deviceId);
	}

	private async fetchDeviceProperties(deviceId: number): Promise<Property[]> {
		const results = await db
			.select({
				...getTableColumns(propertiesTable),
				deviceId: devicePropertiesTable.deviceId,
				intValue: devicePropertiesTable.intValue,
				floatValue: devicePropertiesTable.floatValue,
				stringValue: devicePropertiesTable.stringValue,
				booleanValue: devicePropertiesTable.booleanValue
			})
			.from(propertiesTable)
			.innerJoin(devicePropertiesTable, eq(devicePropertiesTable.propertyId, propertiesTable.id))
			.where(eq(devicePropertiesTable.deviceId, deviceId))
			.execute();

		return results.map((row) => {
			const { deviceId, intValue, floatValue, stringValue, booleanValue, ...propertyData } = row;
			const property = new Property(selectPropertySchema.parse(propertyData), this);

			const valueKey = this.getValueKey(property.id, deviceId);
			const value = this.extractPropertyValue({ intValue, floatValue, stringValue, booleanValue });
			this.propertyValuesCache.set(valueKey, Promise.resolve(value));

			return property;
		});
	}

	async preloadDeviceProperties(deviceIds: number[]): Promise<void> {
		// Skip if all devices are already cached
		const uncachedDeviceIds = deviceIds.filter((id) => !this.devicePropertiesCache.has(id));
		if (uncachedDeviceIds.length === 0) return;

		// Fetch properties and their values for all uncached devices in a single query
		const results = await db
			.select({
				...getTableColumns(propertiesTable),
				deviceId: devicePropertiesTable.deviceId,
				intValue: devicePropertiesTable.intValue,
				floatValue: devicePropertiesTable.floatValue,
				stringValue: devicePropertiesTable.stringValue,
				booleanValue: devicePropertiesTable.booleanValue
			})
			.from(propertiesTable)
			.innerJoin(devicePropertiesTable, eq(devicePropertiesTable.propertyId, propertiesTable.id))
			.where(inArray(devicePropertiesTable.deviceId, uncachedDeviceIds))
			.execute();

		// Group properties by device ID
		const propertiesByDevice = new Map<number, Property[]>();
		for (const row of results) {
			const { deviceId, intValue, floatValue, stringValue, booleanValue, ...propertyData } = row;
			const property = new Property(selectPropertySchema.parse(propertyData), this);

			// Cache the property value
			const valueKey = this.getValueKey(property.id, deviceId);
			const value = this.extractPropertyValue({ intValue, floatValue, stringValue, booleanValue });
			this.propertyValuesCache.set(valueKey, Promise.resolve(value));

			if (!propertiesByDevice.has(deviceId)) {
				propertiesByDevice.set(deviceId, []);
			}
			propertiesByDevice.get(deviceId)!.push(property);
		}

		// Cache the results
		for (const deviceId of uncachedDeviceIds) {
			const deviceProperties = propertiesByDevice.get(deviceId) || [];
			this.devicePropertiesCache.set(deviceId, Promise.resolve(deviceProperties));
		}
	}

	async getCachedDeviceProperties(deviceId: number): Promise<Property[]> {
		const cached = this.devicePropertiesCache.get(deviceId);
		if (cached) return cached;

		// If not cached, fetch and cache for future use
		const promise = this.fetchDeviceProperties(deviceId);
		this.devicePropertiesCache.set(deviceId, promise);
		return promise;
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
		const key = this.getValueKey(propertyId, deviceId);
		const cached = this.propertyValuesCache.get(key);
		if (cached) return cached;

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

		const value = this.extractPropertyValue(property[0]);
		this.propertyValuesCache.set(key, Promise.resolve(value));
		return value;
	}

	// Helper function to extract the correct value based on type
	private extractPropertyValue(property: {
		intValue: number | null;
		floatValue: number | null;
		stringValue: string | null;
		booleanValue: boolean | null;
	}): string | number | boolean | null {
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
