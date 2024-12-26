import { deviceWithPropertiesSchema } from '$lib/types/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const device = await fetch(`/api/devices/${params.id}`).then((res) => res.json());

	return { device: deviceWithPropertiesSchema.parse(device.device) };
};
