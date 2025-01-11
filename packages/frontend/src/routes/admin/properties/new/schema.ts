import { z } from 'zod';
import { propertyTypeEnum } from '@smart-home-finder/common/schema';

export const formSchema = z.object({
	id: z
		.string()
		.min(1, 'Property ID is required')
		.regex(/^[a-z0-9-]+$/, 'Property ID must contain only lowercase letters, numbers, and hyphens'),
	name: z.string().min(1, 'Name is required'),
	type: z.enum(propertyTypeEnum.enumValues, {
		required_error: 'Please select a property type'
	}),
	unit: z.string().nullable(),
	description: z.string().nullable(),
	minValue: z.number().nullable(),
	maxValue: z.number().nullable()
}) satisfies z.ZodType<Record<string, unknown>>;

export type FormSchema = typeof formSchema;
