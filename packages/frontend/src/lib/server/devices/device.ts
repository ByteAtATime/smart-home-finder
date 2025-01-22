import {
	type DeviceData,
	type ListingWithPrice,
	type DeviceProtocol,
	type DeviceType,
	selectDeviceSchema,
	currentPriceSchema
} from '@smart-home-finder/common/types';
import type { DeviceService } from './service';
import { propertyJsonSchema, type Property, type PropertyJson } from '../properties/property';
import { variantJsonSchema, type Variant } from '../variant/variant';
import { z } from 'zod';

export const deviceSchema = selectDeviceSchema.extend({
	properties: z.record(z.string(), propertyJsonSchema),
	variants: z.array(variantJsonSchema),
	listings: z.array(currentPriceSchema)
});

export type DeviceJson = z.infer<typeof deviceSchema>;

export class Device {
	public constructor(
		private data: DeviceData,
		private service: DeviceService
	) {}

	public get id(): number {
		return this.data.id;
	}

	public get name(): string {
		return this.data.name;
	}

	public get images(): string[] {
		return this.data.images;
	}

	public get deviceType(): DeviceType {
		return this.data.deviceType;
	}

	public get protocol(): DeviceProtocol {
		return this.data.protocol;
	}

	public get createdAt(): Date {
		return this.data.createdAt;
	}

	public get updatedAt(): Date {
		return this.data.updatedAt;
	}

	private _variants: Variant[] | null = null;
	private _variantsJson: Promise<z.infer<typeof variantJsonSchema>[]> | null = null;

	public async getVariants(): Promise<Variant[]> {
		if (this._variants) {
			return this._variants;
		}

		this._variants = await this.service.getDeviceVariants(this.data.id);
		return this._variants;
	}

	private _properties: Property[] | null = null;
	private _propertiesJson: Promise<Record<string, PropertyJson>> | null = null;

	public async getProperties(): Promise<Property[]> {
		if (this._properties === null) {
			this._properties = await this.service.getDeviceProperties(this.data.id);
		}

		return this._properties;
	}

	private _listings: ListingWithPrice[] | null = null;

	public async getListings(): Promise<ListingWithPrice[]> {
		if (this._listings) {
			return this._listings;
		}

		this._listings = await this.service.getDeviceListings(this.data.id);
		return this._listings;
	}

	private async getPropertiesJson(): Promise<Record<string, PropertyJson>> {
		if (this._propertiesJson === null) {
			const properties = await this.getProperties();
			this._propertiesJson = Promise.all(properties.map((p) => p.toJson(this.data.id))).then(
				(jsonProperties) =>
					jsonProperties.reduce(
						(acc, property) => {
							acc[property.id] = property;
							return acc;
						},
						{} as Record<string, PropertyJson>
					)
			);
		}
		return this._propertiesJson;
	}

	private async getVariantsJson(): Promise<z.infer<typeof variantJsonSchema>[]> {
		if (this._variantsJson === null) {
			const variants = await this.getVariants();
			this._variantsJson = Promise.all(variants.map((v) => v.toJson(this.id)));
		}
		return this._variantsJson;
	}

	public async toJson(): Promise<DeviceJson> {
		// Start all async operations immediately
		const propertiesPromise = this.getProperties().then(async (properties) => {
			const jsonProperties = await Promise.all(properties.map((p) => p.toJson(this.data.id)));
			return jsonProperties.reduce(
				(acc, property) => {
					acc[property.id] = property;
					return acc;
				},
				{} as Record<string, PropertyJson>
			);
		});

		const variantsPromise = this.getVariants().then(async (variants) =>
			Promise.all(variants.map((v) => v.toJson(this.id)))
		);

		const listingsPromise = this.getListings();

		// Wait for all transformations to complete
		const [properties, variants, listings] = await Promise.all([
			propertiesPromise,
			variantsPromise,
			listingsPromise
		]);

		return {
			...this.data,
			variants,
			properties,
			listings
		};
	}
}
