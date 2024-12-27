import { currentPriceSchema, deviceWithPropertiesSchema } from '$lib/types/db';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const device = await fetch(`/api/devices/${params.id}`).then((res) => res.json());

	return {
		device: deviceWithPropertiesSchema.parse(device.device),
		prices: currentPriceSchema.array().parse(device.prices)
	};
};
