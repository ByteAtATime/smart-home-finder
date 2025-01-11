import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';
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

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

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

	return {
		form,
		devices,
		sellers
	};
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Create the listing
			const [listing] = await db
				.insert(deviceListingsTable)
				.values({
					deviceId: form.data.deviceId,
					sellerId: form.data.sellerId,
					url: form.data.url,
					isActive: true
				})
				.returning();

			if (form.data.price !== 0) {
				// Create initial price history entry
				await db.insert(priceHistoryTable).values({
					listingId: listing.id,
					price: form.data.price,
					inStock: form.data.inStock === 'true',
					validFrom: new Date(),
					validTo: null
				});
			}

			return { form };
		} catch (err) {
			// Handle unique constraint violation
			if (err instanceof Error && 'code' in err && err.code === '23505') {
				return setError(form, '', 'A listing for this device from this seller already exists');
			}

			// Handle other database errors
			if (err instanceof Error) {
				console.error('Failed to create listing:', err);
				return setError(form, '', 'Failed to create listing. Please try again later.');
			}

			// Handle unknown errors
			console.error('Unknown error:', err);
			throw error(500, 'An unexpected error occurred');
		}
	}
} satisfies Actions;
