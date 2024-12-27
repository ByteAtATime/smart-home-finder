import type { CurrentPrice, DeviceListing } from '$lib/types/db';

export interface IListingRepository {
	getDeviceListings(id: number): Promise<DeviceListing[]>;
	getDevicePrices(id: number): Promise<CurrentPrice[]>;
}
