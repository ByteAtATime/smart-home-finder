import type { ListingWithPrice, DeviceListing } from '@smart-home-finder/common/types';

export interface IListingRepository {
	getDeviceListings(id: number): Promise<DeviceListing[]>;
	getDevicePrices(id: number): Promise<ListingWithPrice[]>;
	/** Gets the minimum and maximum price for all devices */
	getPriceBounds(): Promise<[number, number]>;

	/**
	 * Pre-fetches listings and their prices for multiple devices.
	 * This allows batch loading of listings to avoid N+1 queries.
	 * @param deviceIds - Array of device IDs to pre-fetch listings for
	 */
	preloadDeviceListings(deviceIds: number[]): Promise<void>;

	/**
	 * Gets listings for a device from the cache if available, otherwise fetches from DB.
	 * Should be called after preloadDeviceListings for optimal performance.
	 */
	getCachedDevicePrices(deviceId: number): Promise<ListingWithPrice[]>;
}
