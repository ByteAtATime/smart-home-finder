import { currentPriceSchema, deviceWithPropertiesSchema } from '@smart-home-finder/common/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { device } = await fetch(`/api/devices/${params.id}`).then((res) => res.json());

	return {
		device: deviceWithPropertiesSchema
			.extend({
				prices: currentPriceSchema.array()
			})
			.parse(device)
	};
};
