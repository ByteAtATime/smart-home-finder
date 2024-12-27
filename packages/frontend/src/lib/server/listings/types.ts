import type { CurrentPrice, DeviceListing } from '@smart-home-finder/common/types';

export interface IListingRepository {
	getDeviceListings(id: number): Promise<DeviceListing[]>;
	getDevicePrices(id: number): Promise<CurrentPrice[]>;
}
