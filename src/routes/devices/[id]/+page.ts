import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const device = await fetch(`/api/devices/${params.id}`).then((res) => res.json());

	return device;
};
