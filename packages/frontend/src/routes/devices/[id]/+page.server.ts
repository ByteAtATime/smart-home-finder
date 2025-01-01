import type { PageServerLoad } from './$types';
import { deviceSchema } from '$lib/server/devices/device';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { device } = await fetch(`/api/devices/${params.id}`).then((res) => res.json());

	return {
		device: deviceSchema.parse(device)
	};
};
