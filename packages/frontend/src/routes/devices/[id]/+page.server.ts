import { deviceSchema, currentPriceSchema } from '@smart-home-finder/common/types';
import type { PageServerLoad } from './$types';
import { z } from 'zod';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { device } = await fetch(`/api/devices/${params.id}`).then((res) => res.json());

	return {
		device: deviceSchema
			.extend({
				prices: z.array(currentPriceSchema)
			})
			.parse(device)
	};
};
