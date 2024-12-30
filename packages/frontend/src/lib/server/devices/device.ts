import type {
	BaseDevice,
	ListingWithPrice,
	Variant,
	Property as PropertyData
} from '@smart-home-finder/common/types';
import type { DeviceService } from './service';
import type { Property } from '../properties/property';

export type DeviceJson = BaseDevice & {
	variants: Variant[];
	properties: Record<string, PropertyData>;
	listings: ListingWithPrice[];
};

export class Device {
	public constructor(
		public base: BaseDevice,
		private service: DeviceService
	) {}

	private _variants: Variant[] | null = null;

	public async getVariants(): Promise<Variant[]> {
		if (this._variants) {
			return this._variants;
		}

		this._variants = await this.service.getDeviceVariants(this.base.id);
		return this._variants;
	}

	private _properties: Property[] | null = null;

	public async getProperties(): Promise<Property[]> {
		if (this._properties === null) {
			this._properties = await this.service.getAllProperties();
		}

		return this._properties;
	}

	private _listings: ListingWithPrice[] | null = null;

	public async getListings(): Promise<ListingWithPrice[]> {
		if (this._listings) {
			return this._listings;
		}

		this._listings = await this.service.getDeviceListings(this.base.id);
		return this._listings;
	}

	public async toJson(): Promise<DeviceJson> {
		const properties = await this.getProperties();

		const jsonProperties = await Promise.all(
			properties.map(async (property) => {
				return property.toJson(this.base.id);
			})
		);

		const propertiesById = jsonProperties.reduce(
			(acc, property) => {
				acc[property.id] = property;
				return acc;
			},
			{} as Record<string, PropertyData>
		);

		return {
			...this.base,
			variants: await this.getVariants(),
			properties: propertiesById,
			listings: await this.getListings()
		};
	}
}
