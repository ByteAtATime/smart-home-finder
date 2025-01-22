import { db } from '../db';
import {
	count,
	eq,
	and,
	sql,
	inArray,
	between,
	isNull,
	ilike,
	or,
	ne,
	exists,
	type SQL
} from 'drizzle-orm';
import {
	selectDeviceSchema,
	type DeviceData,
	type DeviceType,
	type Paginated,
	type UpdateDevice
} from '@smart-home-finder/common/types';
import {
	deviceListingsTable,
	devicesTable,
	devicePropertiesTable,
	priceHistoryTable
} from '@smart-home-finder/common/schema';
import type { DeviceFilters, IDeviceRepository } from './types';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<DeviceData[]> {
		return db.query.devicesTable.findMany();
	}

	async getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: DeviceFilters = {}
	): Promise<Paginated<DeviceData>> {
		const offset = (page - 1) * pageSize;

		// Optimize the main query to get devices with current prices in a single query
		const query = db
			.select({
				id: devicesTable.id,
				name: devicesTable.name,
				deviceType: devicesTable.deviceType,
				protocol: devicesTable.protocol,
				images: devicesTable.images,
				createdAt: devicesTable.createdAt,
				updatedAt: devicesTable.updatedAt,
				price: sql<number>`MIN(${priceHistoryTable.price})`,
				total: count().append(sql`OVER()`)
			})
			.from(devicesTable)
			.leftJoin(
				deviceListingsTable,
				and(
					eq(devicesTable.id, deviceListingsTable.deviceId),
					eq(deviceListingsTable.isActive, true)
				)
			)
			.leftJoin(
				priceHistoryTable,
				and(
					eq(deviceListingsTable.id, priceHistoryTable.listingId),
					isNull(priceHistoryTable.validTo)
				)
			)
			.groupBy(devicesTable.id)
			.offset(offset)
			.limit(pageSize);

		const whereConditions: (SQL | undefined)[] = [];

		if (filters.deviceType) {
			whereConditions.push(inArray(devicesTable.deviceType, filters.deviceType));
		}
		if (filters.protocol) {
			whereConditions.push(inArray(devicesTable.protocol, filters.protocol));
		}
		if (filters.priceBounds) {
			whereConditions.push(
				between(priceHistoryTable.price, filters.priceBounds[0], filters.priceBounds[1])
			);
		}
		if (filters.search) {
			whereConditions.push(ilike(devicesTable.name, `%${filters.search}%`));
		}

		if (filters.propertyFilters) {
			for (const propertyFilter of filters.propertyFilters) {
				const subquery = db
					.select({ deviceId: devicePropertiesTable.deviceId })
					.from(devicePropertiesTable)
					.where(
						and(
							eq(devicePropertiesTable.propertyId, propertyFilter.propertyId),
							eq(devicePropertiesTable.deviceId, devicesTable.id),
							propertyFilter.bounds
								? between(
										devicePropertiesTable.floatValue,
										propertyFilter.bounds[0],
										propertyFilter.bounds[1]
									)
								: propertyFilter.booleanValue !== undefined
									? eq(devicePropertiesTable.booleanValue, propertyFilter.booleanValue)
									: sql`1=1`
						)
					);

				whereConditions.push(
					or(ne(devicesTable.deviceType, propertyFilter.deviceType), exists(subquery))
				);
			}
		}

		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}

		// Add sorting
		const sortConfig = filters.sortField
			? { field: filters.sortField, direction: filters.sortDirection ?? 'asc' }
			: undefined;

		if (sortConfig) {
			const direction = sortConfig.direction === 'desc' ? sql`DESC` : sql`ASC`;
			switch (sortConfig.field) {
				case 'price':
					query.orderBy(sql`MIN(${priceHistoryTable.price}) ${direction}`);
					break;
				case 'name':
					query.orderBy(sql`${devicesTable.name} ${direction}`);
					break;
				case 'createdAt':
					query.orderBy(sql`${devicesTable.createdAt} ${direction}`);
					break;
			}
		} else {
			query.orderBy(sql`${devicesTable.name} ASC`);
		}

		const devices = await query;

		return {
			items: devices.map(({ total: _, ...rest }) => rest),
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
		const device = await db.query.devicesTable.findFirst({
			where: eq(devicesTable.id, id)
		});
		return selectDeviceSchema.nullable().parse(device ?? null);
	}

	async insertDevice(device: DeviceData): Promise<number> {
		const [inserted] = await db
			.insert(devicesTable)
			.values({
				name: device.name,
				deviceType: device.deviceType,
				protocol: device.protocol,
				images: device.images
			})
			.returning({ insertedId: devicesTable.id });

		if (!inserted) throw new Error('Failed to insert device');
		return inserted.insertedId;
	}

	async updateDevice(id: number, device: UpdateDevice): Promise<DeviceData | null> {
		const [updated] = await db
			.update(devicesTable)
			.set({
				...device,
				updatedAt: sql`CURRENT_TIMESTAMP`
			})
			.where(eq(devicesTable.id, id))
			.returning();

		return updated ? selectDeviceSchema.parse(updated) : null;
	}

	async getFilteredDeviceTypes(
		filters: Omit<DeviceFilters, 'propertyFilters'>
	): Promise<DeviceType[]> {
		const query = db
			.selectDistinct({ deviceType: devicesTable.deviceType })
			.from(devicesTable)
			.leftJoin(
				deviceListingsTable,
				and(
					eq(devicesTable.id, deviceListingsTable.deviceId),
					eq(deviceListingsTable.isActive, true)
				)
			)
			.leftJoin(
				priceHistoryTable,
				and(
					eq(deviceListingsTable.id, priceHistoryTable.listingId),
					isNull(priceHistoryTable.validTo)
				)
			);

		const whereConditions: SQL[] = [];

		if (filters.deviceType) {
			whereConditions.push(inArray(devicesTable.deviceType, filters.deviceType));
		}
		if (filters.protocol) {
			whereConditions.push(inArray(devicesTable.protocol, filters.protocol));
		}
		if (filters.priceBounds) {
			whereConditions.push(
				between(priceHistoryTable.price, filters.priceBounds[0], filters.priceBounds[1])
			);
		}

		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}

		const result = await query;
		return result.map((r) => r.deviceType);
	}
}
