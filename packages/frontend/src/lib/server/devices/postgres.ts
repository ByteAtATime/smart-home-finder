import { count, eq } from 'drizzle-orm';
import type {
	Device,
	InsertDevice,
	PaginatedDevices,
	VariantWithOptions
} from '@smart-home-finder/common/types';
import { devicesTable, variantOptionsTable, variantsTable } from '@smart-home-finder/common/schema';
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

		return {
			devices,
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
					variantId: variant.id,
					createdAt: variant.createdAt,
					updatedAt: variant.updatedAt,
					deviceId: variant.deviceId
				});
				return acc;
			},
			{} as Record<number, VariantWithOptions>
		);

		return Object.values(aggregatedVariants);
	}
}
