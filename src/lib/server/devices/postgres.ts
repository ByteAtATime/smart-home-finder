import { count, eq } from 'drizzle-orm';
import type { Device, DeviceWithProperties, InsertDevice, PaginatedDevices } from '$lib/types/db';
import { devicePropertiesTable, devicesTable, propertiesTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import type { IDeviceRepository } from './types';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<Device[]> {
		return await db.query.devicesTable.findMany();
	}

	async getAllDevicesPaginated(page: number, pageSize: number): Promise<PaginatedDevices> {
		const offset = (page - 1) * pageSize;

		const devices = await db.query.devicesTable.findMany({
			offset,
			limit: pageSize
		});

		const totalResult = await db.select({ value: count() }).from(devicesTable);
		const total = totalResult[0].value;

		const devicesWithProperties = await Promise.all(
			devices.map(async (device) => this.getDeviceWithProperties(device.id))
		);

		return {
			devices: devicesWithProperties.filter((d): d is DeviceWithProperties => d !== null),
			total,
			page,
			pageSize
		};
	}

	async getDeviceById(id: number): Promise<Device | null> {
		return (
			(await db.query.devicesTable.findFirst({
				where: eq(devicesTable.id, id)
			})) ?? null
		);
	}

	async insertDevice(device: InsertDevice): Promise<number> {
		const result = await db
			.insert(devicesTable)
			.values(device)
			.returning({ insertedId: devicesTable.id });

		if (result.length === 0) {
			throw new Error('Failed to insert device');
		}

		return result[0].insertedId;
	}

	async getDeviceWithProperties(id: number): Promise<DeviceWithProperties | null> {
		const device = await this.getDeviceById(id);
		if (!device) return null;

		const properties = await db
			.select()
			.from(propertiesTable)
			.leftJoin(devicePropertiesTable, eq(propertiesTable.id, devicePropertiesTable.propertyId))
			.where(eq(devicePropertiesTable.deviceId, id));

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

		return { ...device, properties: deviceProperties };
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
