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
}
