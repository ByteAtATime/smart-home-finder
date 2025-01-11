import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { propertiesTable } from '@smart-home-finder/common/schema';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const properties = await db
		.select()
		.from(propertiesTable)
		.orderBy(desc(propertiesTable.updatedAt));

	return {
		properties
	};
};

export const actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id || typeof id !== 'string') {
			throw error(400, 'Invalid property ID');
		}

		try {
			// Delete the property
			await db.delete(propertiesTable).where(eq(propertiesTable.id, id));

			return { success: true };
		} catch (err) {
			console.error('Failed to delete property:', err);
			throw error(500, 'Failed to delete property');
		}
	}
} satisfies Actions;
