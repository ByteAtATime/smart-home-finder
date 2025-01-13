import type { Variant as VariantData } from '@smart-home-finder/common/types';
import { variantOptionSchema, type IVariantRepository, type VariantOption } from './types';
import { z } from 'zod';
import { selectVariantSchema } from '@smart-home-finder/common/types';

export const variantJsonSchema = selectVariantSchema.extend({
	options: z.array(variantOptionSchema)
});
export type VariantJson = z.infer<typeof variantJsonSchema>;

export class Variant {
	constructor(
		private readonly variant: VariantData,
		private readonly repository: IVariantRepository
	) {}

	public get id(): number {
		return this.variant.id;
	}

	public get name(): string {
		return this.variant.name;
	}

	public get createdAt(): Date {
		return this.variant.createdAt;
	}

	public get updatedAt(): Date {
		return this.variant.updatedAt;
	}

	public async getOptions(prioritizedDeviceId?: number): Promise<VariantOption[]> {
		const options = await this.repository.getCachedVariantOptions(this.id);
		if (!prioritizedDeviceId) return options;

		// Sort options locally to prioritize the device
		return [...options].sort((a, b) => {
			if (a.deviceId === prioritizedDeviceId) return -1;
			if (b.deviceId === prioritizedDeviceId) return 1;
			return 0;
		});
	}

	public async toJson(prioritizedDeviceId?: number): Promise<VariantJson> {
		return {
			...this.variant,
			options: await this.getOptions(prioritizedDeviceId)
		};
	}
}
