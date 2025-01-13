import { db } from '../db';
import {
	deviceVariantsTable,
	variantOptionsTable,
	variantsTable
} from '@smart-home-finder/common/schema';
import type { IVariantRepository, VariantOption } from './types';
import { selectVariantSchema } from '@smart-home-finder/common/types';
import { eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { Variant } from './variant';

export class PostgresVariantRepository implements IVariantRepository {
	// Cache for variants by device ID
	private deviceVariantsCache = new Map<number, Promise<Variant[]>>();
	// Cache for variant options by variant ID and prioritized device ID
	private variantOptionsCache = new Map<string, Promise<VariantOption[]>>();

	private getOptionsKey(variantId: number, prioritizedDeviceId?: number): string {
		return `${variantId}:${prioritizedDeviceId || 'default'}`;
	}

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

	async getVariantsForDevice(deviceId: number): Promise<Variant[]> {
		const cached = this.deviceVariantsCache.get(deviceId);
		if (cached) return cached;

		return this.fetchVariantsForDevice(deviceId);
	}

	private async fetchVariantsForDevice(deviceId: number): Promise<Variant[]> {
		const variants = await db
			.select({
				...getTableColumns(variantsTable),
				deviceId: deviceVariantsTable.deviceId
			})
			.from(variantsTable)
			.innerJoin(deviceVariantsTable, eq(deviceVariantsTable.variantId, variantsTable.id))
			.where(eq(deviceVariantsTable.deviceId, deviceId))
			.execute();

		return variants.map((v) => new Variant(selectVariantSchema.parse(v), this));
	}

	async preloadDeviceVariants(deviceIds: number[]): Promise<void> {
		const uncachedDeviceIds = deviceIds.filter((id) => !this.deviceVariantsCache.has(id));
		if (uncachedDeviceIds.length === 0) return;

		const variants = await db
			.select({
				id: variantsTable.id,
				name: variantsTable.name,
				createdAt: variantsTable.createdAt,
				updatedAt: variantsTable.updatedAt,
				deviceId: deviceVariantsTable.deviceId
			})
			.from(variantsTable)
			.innerJoin(deviceVariantsTable, eq(deviceVariantsTable.variantId, variantsTable.id))
			.where(inArray(deviceVariantsTable.deviceId, uncachedDeviceIds))
			.execute();

		const variantsByDevice = new Map<number, Variant[]>();
		for (const row of variants) {
			const { deviceId, ...variantData } = row;
			const variant = new Variant(selectVariantSchema.parse(variantData), this);

			if (!variantsByDevice.has(deviceId)) {
				variantsByDevice.set(deviceId, []);
			}
			variantsByDevice.get(deviceId)!.push(variant);
		}

		for (const deviceId of uncachedDeviceIds) {
			const deviceVariants = variantsByDevice.get(deviceId) || [];
			this.deviceVariantsCache.set(deviceId, Promise.resolve(deviceVariants));
		}
	}

	async getCachedDeviceVariants(deviceId: number): Promise<Variant[]> {
		const cached = this.deviceVariantsCache.get(deviceId);
		if (cached) return cached;

		const promise = this.fetchVariantsForDevice(deviceId);
		this.deviceVariantsCache.set(deviceId, promise);
		return promise;
	}

	async getVariantOptions(id: number, prioritizedDeviceId?: number): Promise<VariantOption[]> {
		const key = this.getOptionsKey(id, prioritizedDeviceId);
		const cached = this.variantOptionsCache.get(key);
		if (cached) return cached;

		return this.fetchVariantOptions(id, prioritizedDeviceId);
	}

	private async fetchVariantOptions(
		id: number,
		prioritizedDeviceId?: number
	): Promise<VariantOption[]> {
		const query = db
			.select({
				id: variantOptionsTable.id,
				value: variantOptionsTable.value,
				deviceId: deviceVariantsTable.deviceId,
				variantId: variantOptionsTable.variantId,
				createdAt: variantOptionsTable.createdAt,
				updatedAt: variantOptionsTable.updatedAt
			})
			.from(variantOptionsTable)
			.innerJoin(
				deviceVariantsTable,
				eq(deviceVariantsTable.variantOptionId, variantOptionsTable.id)
			)
			.where(eq(variantOptionsTable.variantId, id));

		if (prioritizedDeviceId) {
			query.orderBy(
				sql`CASE WHEN ${deviceVariantsTable.deviceId} = ${prioritizedDeviceId} THEN 0 ELSE 1 END`
			);
		}

		return query.execute();
	}

	async preloadVariantOptions(variantIds: number[], prioritizedDeviceId?: number): Promise<void> {
		const uncachedVariantIds = variantIds.filter(
			(id) => !this.variantOptionsCache.has(this.getOptionsKey(id, prioritizedDeviceId))
		);
		if (uncachedVariantIds.length === 0) return;

		const options = await db
			.selectDistinctOn([variantOptionsTable.id], {
				id: variantOptionsTable.id,
				value: variantOptionsTable.value,
				deviceId: deviceVariantsTable.deviceId,
				variantId: variantOptionsTable.variantId,
				createdAt: variantOptionsTable.createdAt,
				updatedAt: variantOptionsTable.updatedAt
			})
			.from(variantOptionsTable)
			.innerJoin(
				deviceVariantsTable,
				eq(deviceVariantsTable.variantOptionId, variantOptionsTable.id)
			)
			.where(inArray(variantOptionsTable.variantId, uncachedVariantIds))
			.orderBy(
				variantOptionsTable.id,
				...(prioritizedDeviceId
					? [
							sql`CASE WHEN ${deviceVariantsTable.deviceId} = ${prioritizedDeviceId} THEN 0 ELSE 1 END`
						]
					: [])
			);

		const optionsByVariant = new Map<number, VariantOption[]>();
		for (const option of options) {
			if (!optionsByVariant.has(option.variantId)) {
				optionsByVariant.set(option.variantId, []);
			}
			optionsByVariant.get(option.variantId)!.push(option);
		}

		for (const variantId of uncachedVariantIds) {
			const key = this.getOptionsKey(variantId, prioritizedDeviceId);
			const variantOptions = optionsByVariant.get(variantId) || [];
			this.variantOptionsCache.set(key, Promise.resolve(variantOptions));
		}
	}

	async getCachedVariantOptions(
		variantId: number,
		prioritizedDeviceId?: number
	): Promise<VariantOption[]> {
		const key = this.getOptionsKey(variantId, prioritizedDeviceId);
		const cached = this.variantOptionsCache.get(key);
		if (cached) return cached;

		const promise = this.fetchVariantOptions(variantId, prioritizedDeviceId);
		this.variantOptionsCache.set(key, promise);
		return promise;
	}
}
