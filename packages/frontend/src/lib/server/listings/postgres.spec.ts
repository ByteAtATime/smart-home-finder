import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresListingRepository } from './postgres';
import { db } from '$lib/server/db';
import { deviceListingsTable } from '@smart-home-finder/common/schema';
import { SQL } from 'drizzle-orm';

vi.mock('$lib/server/db', () => ({
	db: {
		query: {
			deviceListingsTable: {
				findMany: vi.fn()
			}
		},
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis()
	}
}));

describe('PostgresListingRepository', () => {
	let repository: PostgresListingRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new PostgresListingRepository();
	});

	it('should get device listings for a valid device ID', async () => {
		const deviceId = 1;
		const mockListings = [{ id: 1, deviceId: deviceId, sellerId: 1, url: 'https://example.com' }];
		db.query.deviceListingsTable.findMany.mockResolvedValue(mockListings);

		const listings = await repository.getDeviceListings(deviceId);

		expect(db.query.deviceListingsTable.findMany).toHaveBeenCalledWith({
			where: expect.any(SQL)
		});
		expect(listings).toEqual(mockListings);
	});

	it('should return an empty array if no listings are found for a device ID', async () => {
		const deviceId = 99;
		db.query.deviceListingsTable.findMany.mockResolvedValue([]);

		const listings = await repository.getDeviceListings(deviceId);

		expect(listings).toEqual([]);
	});

	it('should get device prices with correct joins and conditions', async () => {
		const deviceId = 1;
		const mockPrices = [
			{
				listingId: 1,
				deviceId: deviceId,
				sellerId: 1,
				sellerName: 'Seller 1',
				url: 'https://example.com/1',
				isActive: true,
				listingCreatedAt: new Date(),
				listingUpdatedAt: new Date(),
				priceId: 101,
				price: 99.99,
				inStock: true,
				validFrom: new Date(),
				validTo: null,
				priceCreatedAt: new Date(),
				priceUpdatedAt: new Date()
			}
		];
		db.select().from().innerJoin().where.mockResolvedValue(mockPrices);
		db.innerJoin.mockClear(); // clears the call from above (while calling mockResolvedValue)

		const prices = await repository.getDevicePrices(deviceId);

		expect(db.select).toHaveBeenCalled();
		expect(db.from).toHaveBeenCalledWith(deviceListingsTable);
		expect(db.innerJoin).toHaveBeenCalledTimes(2);
		expect(db.where).toHaveBeenCalledWith(expect.any(SQL));
		expect(prices).toEqual(mockPrices);
	});
	it('should return an empty array if no prices are found for a device ID', async () => {
		const deviceId = 99;
		db.select().from().innerJoin().innerJoin().where.mockResolvedValue([]);

		const prices = await repository.getDevicePrices(deviceId);

		expect(prices).toEqual([]);
	});
});
