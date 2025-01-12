import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { deviceListingsTable, priceHistoryTable } from '@smart-home-finder/common/schema';
import { eq } from 'drizzle-orm';
import { zod } from 'sveltekit-superforms/adapters';

const schema = z.object({
	deviceId: z.number().int().positive(),
	sellerId: z.number().int().positive(),
	url: z.string().url(),
	price: z.number().positive(),
	inStock: z.boolean(),
	metadata: z.record(z.unknown()).default({})
});

export async function load({ params }) {
	const listing = await db.query.deviceListingsTable.findFirst({
		where: eq(deviceListingsTable.id, parseInt(params.id))
	});

	if (!listing) {
		throw error(404, 'Listing not found');
	}

	const currentPrice = await db.query.priceHistoryTable.findFirst({
		where: eq(priceHistoryTable.listingId, listing.id),
		orderBy: (price) => price.validFrom
	});

	const form = await superValidate(
		{
			deviceId: listing.deviceId,
			sellerId: listing.sellerId,
			url: listing.url,
			price: currentPrice?.price ?? 0,
			inStock: currentPrice?.inStock ?? true,
			metadata: listing.metadata as Record<string, unknown>
		},
		zod(schema)
	);

	const devices = await db.query.devicesTable.findMany();
	const sellers = await db.query.sellersTable.findMany();

	return { form, devices, sellers };
}

export const actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { deviceId, sellerId, url, price, inStock, metadata } = form.data;
		const listingId = parseInt(params.id);

		await db.transaction(async (tx) => {
			// Update listing
			await tx
				.update(deviceListingsTable)
				.set({
					deviceId,
					sellerId,
					url,
					metadata: metadata as Record<string, unknown>
				})
				.where(eq(deviceListingsTable.id, listingId));

			// Update price
			const now = new Date();

			// Close current price period
			await tx
				.update(priceHistoryTable)
				.set({ validTo: now })
				.where(eq(priceHistoryTable.listingId, listingId));

			// Create new price period
			await tx.insert(priceHistoryTable).values({
				listingId,
				price,
				inStock,
				validFrom: now,
				validTo: null
			});
		});

		return { form };
	}
};
