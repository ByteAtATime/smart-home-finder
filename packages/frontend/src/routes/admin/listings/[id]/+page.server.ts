import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { formSchema } from '../new/schema';
import { db } from '$lib/server/db';
import {
	deviceListingsTable,
	devicesTable,
	priceHistoryTable,
	sellersTable
} from '@smart-home-finder/common/schema';
import { error, fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { setError } from 'sveltekit-superforms/server';
import { and, eq, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const listingId = parseInt(params.id);
	if (isNaN(listingId)) {
		throw error(400, 'Invalid listing ID');
	}

	// Get the listing with its current price
	const [listing] = await db
		.select({
			id: deviceListingsTable.id,
			deviceId: deviceListingsTable.deviceId,
			sellerId: deviceListingsTable.sellerId,
			url: deviceListingsTable.url,
			isActive: deviceListingsTable.isActive,
			price: priceHistoryTable.price,
			inStock: priceHistoryTable.inStock
		})
		.from(deviceListingsTable)
		.leftJoin(
			priceHistoryTable,
			and(
				eq(priceHistoryTable.listingId, deviceListingsTable.id),
				isNull(priceHistoryTable.validTo)
			)
		)
		.where(eq(deviceListingsTable.id, listingId));

	if (!listing) {
		throw error(404, 'Listing not found');
	}

	// Get all devices and sellers for the dropdowns
	const devices = await db
		.select({
			id: devicesTable.id,
			name: devicesTable.name
		})
		.from(devicesTable);

	const sellers = await db
		.select({
			id: sellersTable.id,
			name: sellersTable.name
		})
		.from(sellersTable);

	// Initialize form with existing data
	const form = await superValidate(
		{
			deviceId: listing.deviceId ?? undefined,
			sellerId: listing.sellerId ?? undefined,
			url: listing.url ?? '',
			price: listing.price ?? 0,
			inStock: listing.inStock ? 'true' : 'false'
		},
		zod(formSchema)
	);

	return {
		form,
		devices,
		sellers
	};
};

export const actions = {
	default: async ({ request, params }) => {
		const listingId = parseInt(params.id);
		if (isNaN(listingId)) {
			throw error(400, 'Invalid listing ID');
		}

		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Update the listing
			const [listing] = await db
				.update(deviceListingsTable)
				.set({
					deviceId: form.data.deviceId,
					sellerId: form.data.sellerId,
					url: form.data.url
				})
				.where(eq(deviceListingsTable.id, listingId))
				.returning();

			// Close current price history entry
			await db
				.update(priceHistoryTable)
				.set({
					validTo: new Date()
				})
				.where(and(eq(priceHistoryTable.listingId, listingId), isNull(priceHistoryTable.validTo)));

			// Create new price history entry
			await db.insert(priceHistoryTable).values({
				listingId: listing.id,
				price: form.data.price,
				inStock: form.data.inStock === 'true',
				validFrom: new Date(),
				validTo: null
			});

			return { form };
		} catch (err) {
			// Handle unique constraint violation
			if (err instanceof Error && 'code' in err && err.code === '23505') {
				return setError(form, '', 'A listing for this device from this seller already exists');
			}

			// Handle other database errors
			if (err instanceof Error) {
				console.error('Failed to update listing:', err);
				return setError(form, '', 'Failed to update listing. Please try again later.');
			}

			// Handle unknown errors
			console.error('Unknown error:', err);
			throw error(500, 'An unexpected error occurred');
		}
	}
} satisfies Actions;
