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

	private _options: Map<number | undefined, VariantOption[]> = new Map();

	public async getOptions(prioritizedDeviceId?: number): Promise<VariantOption[]> {
		if (this._options.has(prioritizedDeviceId)) {
			return this._options.get(prioritizedDeviceId)!;
		}

		const options = await this.repository.getVariantOptions(this.id, prioritizedDeviceId);
		this._options.set(prioritizedDeviceId, options);
		return options;
	}

	public async toJson(prioritizedDeviceId?: number): Promise<VariantJson> {
		return {
			...this.variant,
			options: await this.getOptions(prioritizedDeviceId)
		};
	}
}
