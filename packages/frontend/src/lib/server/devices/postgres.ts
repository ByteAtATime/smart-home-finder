import { count, eq, and, sql, inArray } from 'drizzle-orm';
import {
	selectDeviceSchema,
	type DeviceData,
	type DeviceProtocol,
	type DeviceType,
	type Paginated,
	type UpdateDevice
} from '@smart-home-finder/common/types';
import { devicesTable } from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { IDeviceRepository } from './types';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<DeviceData[]> {
		return await db.query.devicesTable.findMany();
	}

	async getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: { deviceType?: string[]; protocol?: string[] } = {}
	): Promise<Paginated<DeviceData>> {
		const offset = (page - 1) * pageSize;

		const query = db.select().from(devicesTable).offset(offset).limit(pageSize);

		const whereConditions = [];
		if (filters.deviceType) {
			whereConditions.push(inArray(devicesTable.deviceType, filters.deviceType as DeviceType[]));
		}
		if (filters.protocol) {
			whereConditions.push(inArray(devicesTable.protocol, filters.protocol as DeviceProtocol[]));
		}

		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}

		const devices = await query;

		const totalResult = await db.select({ value: count() }).from(devicesTable).execute();
		const total = totalResult[0].value;

		return {
			items: devices,
			total,
			page,
			pageSize
		};
	}

	async deleteDevice(id: number): Promise<boolean> {
		const result = await db.delete(devicesTable).where(eq(devicesTable.id, id));
		return result.length > 0;
	}

	async getBaseDeviceById(id: number): Promise<DeviceData | null> {
		const device =
			(await db.query.devicesTable.findFirst({
				where: eq(devicesTable.id, id)
			})) ?? null;

		return selectDeviceSchema.nullable().parse(device);
	}

	async insertDevice(device: DeviceData): Promise<number> {
		const result = await db
			.insert(devicesTable)
			.values({
				name: device.name,
				deviceType: device.deviceType,
				protocol: device.protocol,
				images: device.images
			})
			.returning({ insertedId: devicesTable.id });

		if (result.length === 0) {
			throw new Error('Failed to insert device');
		}

		return result[0].insertedId;
	}

	async updateDevice(id: number, device: UpdateDevice): Promise<DeviceData | null> {
		const result = await db
			.update(devicesTable)
			.set({ ...device, updatedAt: sql`CURRENT_TIMESTAMP` })
			.where(eq(devicesTable.id, id))
			.returning();

		if (result.length === 0) {
			return null;
		}

		return selectDeviceSchema.parse(result[0]);
	}
}
