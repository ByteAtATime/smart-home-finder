import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ClerkAuthProvider } from '$lib/server/auth/clerk';

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = new ClerkAuthProvider(locals.auth);

	if (!(auth instanceof Response)) {
		const isAdmin = await auth.isAdmin();
		if (!isAdmin) {
			throw redirect(302, '/');
		}

		return {
			user: {
				isAdmin
			}
		};
	}

	throw redirect(302, '/');
};
