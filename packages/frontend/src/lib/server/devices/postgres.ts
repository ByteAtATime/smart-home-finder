import { count, eq, and, sql } from 'drizzle-orm';
import {
	selectDeviceSchema,
	variantWithOptionsSchema,
	type Device,
	type InsertDevice,
	type PaginatedDevices,
	type UpdateDevice,
	type VariantWithOptions
} from '@smart-home-finder/common/types';
import { devicesTable, variantOptionsTable, variantsTable } from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { IDeviceRepository } from './types';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getAllDevices(): Promise<Device[]> {
		return await db.query.devicesTable.findMany();
	}

	async getAllDevicesPaginated(
		page: number,
		pageSize: number,
		filters: { deviceType?: string; protocol?: string } = {}
	): Promise<PaginatedDevices> {
		const offset = (page - 1) * pageSize;

		const query = db.select().from(devicesTable).offset(offset).limit(pageSize);

		const whereConditions = [];
		if (filters.deviceType) {
			whereConditions.push(eq(devicesTable.deviceType, filters.deviceType));
		}
		if (filters.protocol) {
			whereConditions.push(eq(devicesTable.protocol, filters.protocol));
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

	async getDeviceById(id: number): Promise<Device | null> {
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

	async updateDevice(id: number, device: UpdateDevice): Promise<Device | null> {
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
		const variants = await db
			.select({
				id: variantsTable.id,
				name: variantsTable.name,
				updatedAt: variantsTable.updatedAt,
				createdAt: variantsTable.createdAt,
				deviceId: variantsTable.deviceId,
				optionId: variantOptionsTable.id,
				optionValue: variantOptionsTable.value
			})
			.from(variantsTable)
			.leftJoin(variantOptionsTable, eq(variantsTable.id, variantOptionsTable.variantId))
			.where(eq(variantsTable.deviceId, deviceId));

		const aggregatedVariants = variants.reduce(
			(acc, variant) => {
				acc[variant.id] = acc[variant.id] ?? { ...variant, options: [] };
				acc[variant.id].options?.push({
					id: variant.optionId!,
					value: variant.optionValue!,
					createdAt: variant.createdAt!,
					updatedAt: variant.updatedAt!,
					deviceId: variant.deviceId!,
					variantId: variant.id!
				});
				return acc;
			},
			{} as Record<number, VariantWithOptions>
		);

		return variantWithOptionsSchema.array().parse(Object.values(aggregatedVariants));
	}
}
