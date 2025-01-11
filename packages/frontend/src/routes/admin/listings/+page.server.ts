import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	deviceListingsTable,
	devicesTable,
	priceHistoryTable,
	sellersTable
} from '@smart-home-finder/common/schema';
import { and, count, desc, eq, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = 10;

	// Get total count
	const [{ count: total }] = await db.select({ count: count() }).from(deviceListingsTable);

	// Get listings with their current prices
	const listings = await db
		.select({
			id: deviceListingsTable.id,
			deviceId: deviceListingsTable.deviceId,
			deviceName: devicesTable.name,
			sellerId: deviceListingsTable.sellerId,
			sellerName: sellersTable.name,
			url: deviceListingsTable.url,
			isActive: deviceListingsTable.isActive,
			currentPrice: priceHistoryTable.price,
			inStock: priceHistoryTable.inStock,
			updatedAt: deviceListingsTable.updatedAt
		})
		.from(deviceListingsTable)
		.innerJoin(devicesTable, eq(deviceListingsTable.deviceId, devicesTable.id))
		.innerJoin(sellersTable, eq(deviceListingsTable.sellerId, sellersTable.id))
		.leftJoin(
			priceHistoryTable,
			and(
				eq(priceHistoryTable.listingId, deviceListingsTable.id),
				isNull(priceHistoryTable.validTo)
			)
		)
		.orderBy(desc(deviceListingsTable.updatedAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	return {
		listings: {
			items: listings,
			total: Number(total),
			page,
			pageSize
		}
	};
};

export const actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return { success: false, error: 'No listing ID provided' };
		}

		try {
			// First, update any active prices to be inactive
			await db
				.update(priceHistoryTable)
				.set({ validTo: new Date() })
				.where(and(eq(priceHistoryTable.listingId, Number(id)), isNull(priceHistoryTable.validTo)));

			// Then delete the listing
			await db.delete(deviceListingsTable).where(eq(deviceListingsTable.id, Number(id)));

			return { success: true };
		} catch (error) {
			console.error('Failed to delete listing:', error);
			return { success: false, error: 'Failed to delete listing' };
		}
	}
} satisfies Actions;
