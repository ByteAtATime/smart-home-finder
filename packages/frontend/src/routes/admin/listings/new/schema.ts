import { z } from 'zod';

export const formSchema = z.object({
	deviceId: z.number({
		required_error: 'Please select a device'
	}),
	sellerId: z.number({
		required_error: 'Please select a seller'
	}),
	url: z.string().url('Please enter a valid URL'),
	price: z
		.number({
			required_error: 'Please enter a price'
		})
		.min(0, 'Price must be greater than 0'),
	inStock: z.enum(['true', 'false'], {
		required_error: 'Please select a stock status'
	})
}) satisfies z.ZodType<Record<string, unknown>>;

export type FormSchema = typeof formSchema;
