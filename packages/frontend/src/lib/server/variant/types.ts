import { selectVariantOptionSchema } from '@smart-home-finder/common/types';
import type { Variant } from './variant';
import { z } from 'zod';

export const variantOptionSchema = selectVariantOptionSchema.extend({
	deviceId: z.number()
});
export type VariantOption = z.infer<typeof variantOptionSchema>;

export interface IVariantRepository {
	/**
	 * Inserts a new {@link Variant} into the database.
	 * @param variant - The variant to insert. The fields `id`, `createdAt`, `updatedAt` are ignored.
	 * @returns The ID of the inserted variant.
	 */
	insertVariant(variant: Variant): Promise<number>;
	getVariantById(id: number): Promise<Variant | null>;
	getVariantsForDevice(deviceId: number): Promise<Variant[]>;
	/**
	 * @param prioritizedDeviceId - The ID of the device to prioritize. If there are multiple devices with the same variant option, the option from the prioritized device is returned.
	 */
	getVariantOptions(id: number, prioritizedDeviceId?: number): Promise<VariantOption[]>;

	/**
	 * Pre-fetches variants and their options for multiple devices.
	 * This allows batch loading of variants to avoid N+1 queries.
	 * @param deviceIds - Array of device IDs to pre-fetch variants for
	 */
	preloadDeviceVariants(deviceIds: number[]): Promise<void>;

	/**
	 * Gets variants for a device from the cache if available, otherwise fetches from DB.
	 * Should be called after preloadDeviceVariants for optimal performance.
	 */
	getCachedDeviceVariants(deviceId: number): Promise<Variant[]>;

	/**
	 * Pre-fetches variant options for multiple variants.
	 * This allows batch loading of options to avoid N+1 queries.
	 * @param variantIds - Array of variant IDs to pre-fetch options for
	 * @param prioritizedDeviceId - The ID of the device to prioritize for option selection
	 */
	preloadVariantOptions(variantIds: number[], prioritizedDeviceId?: number): Promise<void>;

	/**
	 * Gets variant options from the cache if available, otherwise fetches from DB.
	 * Should be called after preloadVariantOptions for optimal performance.
	 */
	getCachedVariantOptions(
		variantId: number,
		prioritizedDeviceId?: number
	): Promise<VariantOption[]>;
}
