import { and, eq, isNull } from 'drizzle-orm';
import { db } from './db';
import { priceHistoryTable, deviceListingsTable } from './schema';
import type { DeviceListing, PriceHistory, InsertPriceHistory } from './types';

interface NewPriceData {
	listingId: number;
	price: number;
	inStock: boolean;
}

export async function updatePrice({
	listingId,
	price,
	inStock
}: NewPriceData): Promise<PriceHistory> {
	return await db.transaction(async (tx) => {
		const now = new Date();

		// 1. First, verify the listing exists and is active
		const listing = (await tx.query.deviceListingsTable.findFirst({
			where: eq(deviceListingsTable.id, listingId)
		})) as DeviceListing | undefined;

		if (!listing) {
			throw new Error(`Device listing ${listingId} not found`);
		}

		if (!listing.isActive) {
			throw new Error(`Device listing ${listingId} is not active`);
		}

		// 2. Find and update the current active price record (if it exists)
		const currentPrice = (await tx.query.priceHistoryTable.findFirst({
			where: and(eq(priceHistoryTable.listingId, listingId), isNull(priceHistoryTable.validTo))
		})) as PriceHistory | undefined;

		if (currentPrice) {
			// Only update if the price or stock status has changed
			if (currentPrice.price === price && currentPrice.inStock === inStock) {
				console.log(`  └─ Already up to date`);
				return currentPrice;
			}

			// Close the current price period
			await tx
				.update(priceHistoryTable)
				.set({
					validTo: now
				})
				.where(eq(priceHistoryTable.id, currentPrice.id));
		}

		// 3. Insert the new price record
		const newPriceData: InsertPriceHistory = {
			listingId,
			price,
			inStock,
			validFrom: now,
			validTo: null
		};

		const [newPriceRecord] = await tx.insert(priceHistoryTable).values(newPriceData).returning();

		console.log(`  └─ Updated price`);

		return newPriceRecord as PriceHistory;
	});
}
