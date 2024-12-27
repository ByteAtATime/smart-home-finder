import { and, eq, isNull } from 'drizzle-orm';
import type { CurrentPrice, DeviceListing } from '@smart-home-finder/common/types';
import {
	deviceListingsTable,
	priceHistoryTable,
	sellersTable
} from '@smart-home-finder/common/schema';
import { db } from '$lib/server/db';
import type { IListingRepository } from './types';

export class PostgresListingRepository implements IListingRepository {
	async getDeviceListings(id: number): Promise<DeviceListing[]> {
		return await db.query.deviceListingsTable.findMany({
			where: eq(deviceListingsTable.deviceId, id)
		});
	}

	async getDevicePrices(id: number): Promise<CurrentPrice[]> {
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

		return result as CurrentPrice[];
	}
}
