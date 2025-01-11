import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';
import { db } from '$lib/server/db';
import { propertiesTable } from '@smart-home-finder/common/schema';
import { error, fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { setError } from 'sveltekit-superforms/server';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));

	return {
		form
	};
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Create the property
			await db.insert(propertiesTable).values({
				id: form.data.id,
				name: form.data.name,
				type: form.data.type,
				unit: form.data.unit,
				description: form.data.description,
				minValue: form.data.minValue,
				maxValue: form.data.maxValue
			});

			return { form };
		} catch (err) {
			// Handle unique constraint violation
			if (err instanceof Error && 'code' in err && err.code === '23505') {
				return setError(form, 'id', 'A property with this ID already exists');
			}

			// Handle other database errors
			if (err instanceof Error) {
				console.error('Failed to create property:', err);
				return setError(form, '', 'Failed to create property. Please try again later.');
			}

			// Handle unknown errors
			console.error('Unknown error:', err);
			throw error(500, 'An unexpected error occurred');
		}
	}
} satisfies Actions;
