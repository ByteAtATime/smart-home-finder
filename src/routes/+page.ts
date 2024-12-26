import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const devices = await fetch('/api/devices').then((res) => res.json());

	return { devices };
};
