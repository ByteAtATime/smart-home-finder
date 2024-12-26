import { eq, sql } from 'drizzle-orm';
import type {
	InsertDeviceSchema,
	SelectDeviceSchema,
	IDeviceRepository,
	PropertyValue,
	DeviceProperties
} from './types';
import { devicePropertiesTable, devicesTable, propertiesTable } from '../db/schema';
import { db } from '../db';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<SelectDeviceSchema[]> {
		const devices = await db.query.devicesTable.findMany();

		return devices;
	}

	async addDeviceProperty(
		deviceId: number,
		propertyId: string,
		property: PropertyValue
	): Promise<string> {
		const [newProperty] = await db
			.insert(devicePropertiesTable)
			.values({
				deviceId,
				propertyId,
				[`${property.type}Value`]: property.value
			})
			.returning();

		return newProperty.propertyId;
	}

	async getDeviceProperties(deviceId: number): Promise<DeviceProperties> {
		const properties = await db
			.select({
				id: devicePropertiesTable.propertyId,
				type: propertiesTable.type,
				intValue: devicePropertiesTable.intValue,
				floatValue: devicePropertiesTable.floatValue,
				stringValue: devicePropertiesTable.stringValue,
				booleanValue: devicePropertiesTable.booleanValue
			})
			.from(devicePropertiesTable)
			.leftJoin(propertiesTable, eq(devicePropertiesTable.propertyId, propertiesTable.id))
			.where(eq(devicePropertiesTable.deviceId, deviceId));

		const deviceProperties: DeviceProperties = {};

		for (const property of properties) {
			if (!property.type) continue;

			let propertyValue: PropertyValue;
			if (property.intValue !== null) {
				propertyValue = { type: 'int', value: property.intValue };
			} else if (property.floatValue !== null) {
				propertyValue = { type: 'float', value: property.floatValue };
			} else if (property.stringValue !== null) {
				propertyValue = { type: 'string', value: property.stringValue };
			} else if (property.booleanValue !== null) {
				propertyValue = { type: 'boolean', value: property.booleanValue };
			} else {
				continue;
			}

			deviceProperties[property.id] = propertyValue;
		}

		return deviceProperties;
	}

	async getDeviceById(id: number): Promise<SelectDeviceSchema | null> {
		const device = await db.query.devicesTable.findFirst({
			where: eq(devicesTable.id, id)
		});

		return device ?? null;
	}

	async insertDevice(device: InsertDeviceSchema): Promise<number> {
		const [newDevice] = await db.insert(devicesTable).values(device).returning();

		if (!newDevice) {
			throw new Error('Failed to insert device');
		}

		return newDevice.id;
	}
}
