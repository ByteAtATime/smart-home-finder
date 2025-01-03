import {
	deviceVariantsTable,
	variantOptionsTable,
	variantsTable
} from '@smart-home-finder/common/schema';
import { db } from '../db';
import type { IVariantRepository } from './types';
import { Variant } from './variant';
import { eq, inArray, sql } from 'drizzle-orm';
import type { VariantOption } from './types';

export class PostgresVariantRepository implements IVariantRepository {
	async insertVariant(variant: Variant): Promise<number> {
		const [newVariant] = await db
			.insert(variantsTable)
			.values({
				name: variant.name
			})
			.returning();

		return newVariant.id;
	}

	async getVariantById(id: number): Promise<Variant | null> {
		const [variant] = await db.select().from(variantsTable).where(eq(variantsTable.id, id));
		return variant ? new Variant(variant, this) : null;
	}

	async getVariantOptions(id: number, prioritizedDeviceId?: number): Promise<VariantOption[]> {
		const options = await db
			.select({
				id: variantOptionsTable.id,
				variantId: variantOptionsTable.variantId,
				value: variantOptionsTable.value,
				createdAt: variantOptionsTable.createdAt,
				updatedAt: variantOptionsTable.updatedAt,
				deviceId: sql<number>`
                    COALESCE(
						MIN(CASE 
							WHEN ${deviceVariantsTable.deviceId} = ${prioritizedDeviceId ?? -1} THEN ${deviceVariantsTable.deviceId}
							ELSE NULL 
						END),
						MIN(${deviceVariantsTable.deviceId})
					)
            `
			})
			.from(variantOptionsTable)
			.innerJoin(
				deviceVariantsTable,
				eq(variantOptionsTable.id, deviceVariantsTable.variantOptionId)
			)
			.where(eq(variantOptionsTable.variantId, id))
			.groupBy(
				variantOptionsTable.id,
				variantOptionsTable.variantId,
				variantOptionsTable.value,
				variantOptionsTable.createdAt,
				variantOptionsTable.updatedAt
			);

		return options;
	}

	async getVariantsForDevice(deviceId: number): Promise<Variant[]> {
		try {
			const data = await db
				.select({
					id: variantsTable.id,
					name: variantsTable.name,
					createdAt: variantsTable.createdAt,
					updatedAt: variantsTable.updatedAt
				})
				.from(variantsTable)
				.where(
					inArray(
						variantsTable.id,
						db
							.select({ id: deviceVariantsTable.variantId })
							.from(deviceVariantsTable)
							.where(eq(deviceVariantsTable.deviceId, deviceId))
					)
				);

			return data.map((variant) => new Variant(variant, this));
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}
