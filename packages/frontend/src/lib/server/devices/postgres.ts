import { count, eq, and, sql, inArray } from 'drizzle-orm';
import {
	selectDeviceSchema,
	variantWithOptionsSchema,
	type BaseDevice,
	type DeviceProtocol,
	type DeviceType,
	type InsertDevice,
	type PaginatedDevices,
	type UpdateDevice,
	type Variant,
	type VariantWithOptions
} from '@smart-home-finder/common/types';
import {
	devicesTable,
	deviceVariantsTable,
	variantOptionsTable,
	variantsTable
} from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { IDeviceRepository } from './types';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<BaseDevice[]> {
		return await db.query.devicesTable.findMany();
	}

	async getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: { deviceType?: string[]; protocol?: string[] } = {}
	): Promise<PaginatedDevices> {
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
			devices,
			total,
			page,
			pageSize
		};
	}

	async deleteDevice(id: number): Promise<boolean> {
		const result = await db.delete(devicesTable).where(eq(devicesTable.id, id));
		return result.length > 0;
	}

	async getBaseDeviceById(id: number): Promise<BaseDevice | null> {
		const device =
			(await db.query.devicesTable.findFirst({
				where: eq(devicesTable.id, id)
			})) ?? null;

		return selectDeviceSchema.nullable().parse(device);
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

	async updateDevice(id: number, device: UpdateDevice): Promise<BaseDevice | null> {
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

	async getVariantsForDevice(deviceId: number): Promise<VariantWithOptions[]> {
		const options = await db
			.select({
				variantId: variantsTable.id,
				variantName: variantsTable.name,
				variantCreatedAt: variantsTable.createdAt,
				variantUpdatedAt: variantsTable.updatedAt,
				optionId: variantOptionsTable.id,
				optionValue: variantOptionsTable.value,
				optionDeviceId: sql<number>`
      COALESCE(
        MIN(CASE 
          WHEN ${deviceVariantsTable.deviceId} = ${deviceId} THEN ${deviceVariantsTable.deviceId}
          ELSE NULL 
        END),
        MIN(${deviceVariantsTable.deviceId})
      )
			  `, // TODO: what's the best way to handle multiple devices with the same variant option?
				optionCreatedAt: variantOptionsTable.createdAt,
				optionUpdatedAt: variantOptionsTable.updatedAt
			})
			.from(variantOptionsTable)
			.innerJoin(variantsTable, eq(variantOptionsTable.variantId, variantsTable.id))
			.innerJoin(
				deviceVariantsTable,
				eq(variantOptionsTable.id, deviceVariantsTable.variantOptionId)
			)
			.where(
				inArray(
					variantsTable.id,
					db
						.select({ id: deviceVariantsTable.variantId })
						.from(deviceVariantsTable)
						.where(eq(deviceVariantsTable.deviceId, deviceId))
				)
			)
			.groupBy(
				variantsTable.id,
				variantsTable.name,
				variantsTable.createdAt,
				variantsTable.updatedAt,
				variantOptionsTable.id,
				variantOptionsTable.value,
				variantOptionsTable.createdAt,
				variantOptionsTable.updatedAt
			);

		const aggregatedVariants = options.reduce(
			(acc, option) => {
				const variant = {
					id: option.variantId,
					name: option.variantName,
					createdAt: option.variantCreatedAt,
					updatedAt: option.variantUpdatedAt
				} satisfies Variant;

				acc[option.variantId] = acc[option.variantId] ?? { ...variant, options: [] };

				acc[option.variantId].options?.push({
					id: option.optionId!,
					value: option.optionValue!,
					deviceId: option.optionDeviceId,
					createdAt: option.optionCreatedAt!,
					updatedAt: option.optionUpdatedAt!,
					variantId: option.variantId!
				});
				return acc;
			},
			{} as Record<number, VariantWithOptions>
		);

		return variantWithOptionsSchema.array().parse(Object.values(aggregatedVariants));
	}
}
