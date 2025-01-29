import { deviceTypeEnum, protocolEnum } from '@smart-home-finder/common/schema';
import { z } from 'zod';

export const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	deviceType: z.enum(deviceTypeEnum.enumValues, {
		required_error: 'Device type is required',
		invalid_type_error: 'Invalid device type'
	}),
	protocol: z.enum(protocolEnum.enumValues, {
		required_error: 'Protocol is required',
		invalid_type_error: 'Invalid protocol'
	}),
	images: z.array(z.string().url('Must be a valid URL')).default([]),
	variants: z
		.array(
			z.object({
				variantId: z.number(),
				value: z.string().min(1, 'Variant value is required')
			})
		)
		.default([]),
	properties: z
		.record(z.string(), z.union([z.number(), z.string(), z.boolean()]).nullish())
		.default({})
});
