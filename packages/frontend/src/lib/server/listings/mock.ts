import { vi } from 'vitest';
import type { IListingRepository } from './types';

export class MockListingRepository implements IListingRepository {
	getDeviceListings = vi.fn();
	getDevicePrices = vi.fn();
	getPriceBounds = vi.fn();
}
