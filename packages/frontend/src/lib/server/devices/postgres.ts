import { count, eq, and, sql, inArray, between, isNull } from 'drizzle-orm';
import {
	selectDeviceSchema,
	type DeviceData,
	type DeviceProtocol,
	type DeviceType,
	type Paginated,
	type UpdateDevice
} from '@smart-home-finder/common/types';
import {
	deviceListingsTable,
	devicesTable,
	priceHistoryTable
} from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { IDeviceRepository } from './types';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<DeviceData[]> {
		return await db.query.devicesTable.findMany();
	}

	async getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: { deviceType?: string[]; protocol?: string[]; priceBounds?: [number, number] } = {}
	): Promise<Paginated<DeviceData>> {
		const offset = (page - 1) * pageSize;

		const query = db
			.select({
				id: devicesTable.id,
				name: devicesTable.name,
				createdAt: devicesTable.createdAt,
				updatedAt: devicesTable.updatedAt,
				protocol: devicesTable.protocol,
				images: devicesTable.images,
				deviceType: devicesTable.deviceType,
				price: priceHistoryTable.price,
				priceHistory: priceHistoryTable.price,
				total: count().append(sql`OVER()`)
			})
			.from(devicesTable)
			.offset(offset)
			.limit(pageSize)
			.leftJoin(deviceListingsTable, eq(devicesTable.id, deviceListingsTable.deviceId))
			.leftJoin(priceHistoryTable, eq(deviceListingsTable.id, priceHistoryTable.listingId));

		const whereConditions = [];
		if (filters.deviceType) {
			whereConditions.push(inArray(devicesTable.deviceType, filters.deviceType as DeviceType[]));
		}
		if (filters.protocol) {
			whereConditions.push(inArray(devicesTable.protocol, filters.protocol as DeviceProtocol[]));
		}

		if (filters.priceBounds) {
			whereConditions.push(
				between(priceHistoryTable.price, filters.priceBounds[0], filters.priceBounds[1]),
				isNull(priceHistoryTable.validTo)
			);
		}

		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}

		const devices = await query;

		return {
			items: devices,
			total: devices[0]?.total ?? 0,
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
