import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { formSchema } from '../new/schema';
import { db } from '$lib/server/db';
import { propertiesTable } from '@smart-home-finder/common/schema';
import { error, fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { setError } from 'sveltekit-superforms/server';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const property = await db
		.select()
		.from(propertiesTable)
		.where(eq(propertiesTable.id, params.id))
		.limit(1);

	if (property.length === 0) {
		throw error(404, 'Property not found');
	}

	const form = await superValidate(
		{
			id: property[0].id,
			name: property[0].name,
			type: property[0].type,
			unit: property[0].unit ?? '',
			description: property[0].description ?? '',
			minValue: property[0].minValue,
			maxValue: property[0].maxValue
		},
		zod(formSchema)
	);

	return {
		form
	};
};

export const actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Update the property
			await db
				.update(propertiesTable)
				.set({
					name: form.data.name,
					type: form.data.type,
					unit: form.data.unit || null,
					description: form.data.description || null,
					minValue: form.data.minValue,
					maxValue: form.data.maxValue
				})
				.where(eq(propertiesTable.id, params.id));

			return { form };
		} catch (err) {
			// Handle database errors
			if (err instanceof Error) {
				console.error('Failed to update property:', err);
				return setError(form, '', 'Failed to update property. Please try again later.');
			}

			// Handle unknown errors
			console.error('Unknown error:', err);
			throw error(500, 'An unexpected error occurred');
		}
	}
} satisfies Actions;
