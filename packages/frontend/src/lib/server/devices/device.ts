import type {
	BaseDevice,
	DeviceProperties,
	ListingWithPrice,
	Variant
} from '@smart-home-finder/common/types';
import type { DeviceService } from './service';

export type DeviceJson = BaseDevice & {
	variants: Variant[];
	properties: DeviceProperties;
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

	private _properties: DeviceProperties | null = null;

	public async getProperties(): Promise<DeviceProperties> {
		if (this._properties) {
			return this._properties;
		}

		this._properties = await this.service.getDeviceProperties(this.base.id);
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
		return {
			...this.base,
			variants: await this.getVariants(),
			properties: await this.getProperties(),
			listings: await this.getListings()
		};
	}
}
