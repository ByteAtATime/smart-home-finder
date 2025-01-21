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
	SQL,
	min
} from 'drizzle-orm';
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
	priceHistoryTable,
	devicePropertiesTable
} from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { DeviceFilters, IDeviceRepository } from './types';

function buildCommonWhere(filters: DeviceFilters) {
	const conditions: (SQL | undefined)[] = [isNull(priceHistoryTable.validTo)];

	if (filters.deviceType) {
		conditions.push(inArray(devicesTable.deviceType, filters.deviceType as DeviceType[]));
	}
	if (filters.protocol) {
		conditions.push(inArray(devicesTable.protocol, filters.protocol as DeviceProtocol[]));
	}
	if (filters.priceBounds) {
		conditions.push(
			between(priceHistoryTable.price, filters.priceBounds[0], filters.priceBounds[1]),
			isNull(priceHistoryTable.validTo)
		);
	}

	return conditions;
}

type SortConfig = {
	field: 'price' | 'name' | 'createdAt';
	direction: 'asc' | 'desc';
};

function buildOrderBy(sort?: SortConfig): SQL {
	if (!sort) {
		return sql`${devicesTable.name} ASC`;
	}

	const direction = sort.direction === 'desc' ? sql`DESC` : sql`ASC`;
	switch (sort.field) {
		case 'price':
			return sql`MIN(${priceHistoryTable.price}) ${direction}`;
		case 'name':
			return sql`${devicesTable.name} ${direction}`;
		case 'createdAt':
			return sql`${devicesTable.createdAt} ${direction}`;
	}
}

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

		const query = db
			.select({
				id: devicesTable.id,
				name: devicesTable.name,
				createdAt: devicesTable.createdAt,
				updatedAt: devicesTable.updatedAt,
				protocol: devicesTable.protocol,
				images: devicesTable.images,
				deviceType: devicesTable.deviceType,
				price: min(priceHistoryTable.price),
				total: count().append(sql`OVER()`)
			})
			.from(devicesTable)
			.groupBy(devicesTable.id)
			.leftJoin(deviceListingsTable, eq(devicesTable.id, deviceListingsTable.deviceId))
			.leftJoin(priceHistoryTable, eq(deviceListingsTable.id, priceHistoryTable.listingId))
			.offset(offset)
			.limit(pageSize);

		const whereConditions = buildCommonWhere(filters);

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
							eq(devicesTable.deviceType, propertyFilter.deviceType),
							propertyFilter.bounds
								? between(
										devicePropertiesTable.floatValue,
										propertyFilter.bounds[0],
										propertyFilter.bounds[1]
									)
								: propertyFilter.booleanValue !== undefined
									? eq(devicePropertiesTable.booleanValue, propertyFilter.booleanValue)
									: undefined
						)
					);

				whereConditions.push(
					or(
						ne(devicesTable.deviceType, propertyFilter.deviceType),
						inArray(devicesTable.id, subquery)
					)
				);
			}
		}

		if (whereConditions.length) {
			query.where(and(...whereConditions));
		}

		// Add sorting
		const sortConfig = filters.sortField
			? { field: filters.sortField, direction: filters.sortDirection ?? 'asc' }
			: undefined;
		query.orderBy(buildOrderBy(sortConfig));

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
			.leftJoin(deviceListingsTable, eq(devicesTable.id, deviceListingsTable.deviceId))
			.leftJoin(priceHistoryTable, eq(deviceListingsTable.id, priceHistoryTable.listingId));

		const whereConditions = buildCommonWhere(filters);
		if (whereConditions.length) {
			query.where(and(...whereConditions));
		}

		const result = await query;
		return result.map((r) => r.deviceType);
	}
}
