import { and, eq, isNull, max, min, inArray } from 'drizzle-orm';
import type { ListingWithPrice, DeviceListing } from '@smart-home-finder/common/types';
import {
	deviceListingsTable,
	priceHistoryTable,
	sellersTable
} from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { IListingRepository } from './types';

export class PostgresListingRepository implements IListingRepository {
	// Cache for listings by device ID
	private deviceListingsCache = new Map<number, Promise<ListingWithPrice[]>>();

	async getDeviceListings(id: number): Promise<DeviceListing[]> {
		const listings = await db.query.deviceListingsTable.findMany({
			where: eq(deviceListingsTable.deviceId, id)
		});
		return listings.map((listing) => ({
			...listing,
			metadata: listing.metadata as Record<string, unknown>
		}));
	}

	async getDevicePrices(id: number): Promise<ListingWithPrice[]> {
		const cached = this.deviceListingsCache.get(id);
		if (cached) return cached;

		return this.fetchDevicePrices(id);
	}

	private async fetchDevicePrices(id: number): Promise<ListingWithPrice[]> {
		const result = await db
			.select({
				// Listing information
				listingId: deviceListingsTable.id,
				deviceId: deviceListingsTable.deviceId,
				sellerId: sellersTable.id,
				sellerName: sellersTable.name,
				url: deviceListingsTable.url,
				isActive: deviceListingsTable.isActive,
				listingCreatedAt: deviceListingsTable.createdAt,
				listingUpdatedAt: deviceListingsTable.updatedAt,

				// Price information
				priceId: priceHistoryTable.id,
				price: priceHistoryTable.price,
				inStock: priceHistoryTable.inStock,
				validFrom: priceHistoryTable.validFrom,
				validTo: priceHistoryTable.validTo,
				priceCreatedAt: priceHistoryTable.createdAt,
				priceUpdatedAt: priceHistoryTable.updatedAt
			})
			.from(deviceListingsTable)
			.innerJoin(sellersTable, eq(deviceListingsTable.sellerId, sellersTable.id))
			.innerJoin(priceHistoryTable, eq(priceHistoryTable.listingId, deviceListingsTable.id))
			.where(
				and(
					eq(deviceListingsTable.deviceId, id),
					eq(deviceListingsTable.isActive, true),
					isNull(priceHistoryTable.validTo)
				)
			);

		return result as ListingWithPrice[];
	}

	async preloadDeviceListings(deviceIds: number[]): Promise<void> {
		// Skip if all devices are already cached
		const uncachedDeviceIds = deviceIds.filter((id) => !this.deviceListingsCache.has(id));
		if (uncachedDeviceIds.length === 0) return;

		// Fetch listings for all uncached devices in a single query
		const result = await db
			.select({
				// Listing information
				listingId: deviceListingsTable.id,
				deviceId: deviceListingsTable.deviceId,
				sellerId: sellersTable.id,
				sellerName: sellersTable.name,
				url: deviceListingsTable.url,
				isActive: deviceListingsTable.isActive,
				listingCreatedAt: deviceListingsTable.createdAt,
				listingUpdatedAt: deviceListingsTable.updatedAt,

				// Price information
				priceId: priceHistoryTable.id,
				price: priceHistoryTable.price,
				inStock: priceHistoryTable.inStock,
				validFrom: priceHistoryTable.validFrom,
				validTo: priceHistoryTable.validTo,
				priceCreatedAt: priceHistoryTable.createdAt,
				priceUpdatedAt: priceHistoryTable.updatedAt
			})
			.from(deviceListingsTable)
			.innerJoin(sellersTable, eq(deviceListingsTable.sellerId, sellersTable.id))
			.innerJoin(priceHistoryTable, eq(priceHistoryTable.listingId, deviceListingsTable.id))
			.where(
				and(
					inArray(deviceListingsTable.deviceId, uncachedDeviceIds),
					eq(deviceListingsTable.isActive, true),
					isNull(priceHistoryTable.validTo)
				)
			);

		// Group listings by device ID
		const listingsByDevice = new Map<number, ListingWithPrice[]>();
		for (const listing of result) {
			if (!listingsByDevice.has(listing.deviceId)) {
				listingsByDevice.set(listing.deviceId, []);
			}
			listingsByDevice.get(listing.deviceId)!.push(listing as ListingWithPrice);
		}

		// Cache the results
		for (const deviceId of uncachedDeviceIds) {
			const deviceListings = listingsByDevice.get(deviceId) || [];
			this.deviceListingsCache.set(deviceId, Promise.resolve(deviceListings));
		}
	}

	async getCachedDevicePrices(deviceId: number): Promise<ListingWithPrice[]> {
		const cached = this.deviceListingsCache.get(deviceId);
		if (cached) return cached;

		// If not cached, fetch and cache for future use
		const promise = this.fetchDevicePrices(deviceId);
		this.deviceListingsCache.set(deviceId, promise);
		return promise;
	}

	async getPriceBounds(): Promise<[number, number]> {
		const result = await db
			.select({
				lowestPrice: min(priceHistoryTable.price),
				highestPrice: max(priceHistoryTable.price)
			})
			.from(priceHistoryTable)
			.where(isNull(priceHistoryTable.validTo));

		return [result[0].lowestPrice ?? 0, result[0].highestPrice ?? 0];
	}
}
