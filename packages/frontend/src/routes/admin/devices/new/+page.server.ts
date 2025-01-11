import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import {
	deviceTypeEnum,
	protocolEnum,
	deviceVariantsTable,
	variantOptionsTable,
	variantsTable,
	devicesTable
} from '@smart-home-finder/common/schema';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { PostgresDeviceRepository } from '$lib/server/devices/postgres';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';

const schema = z.object({
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
		.default([])
});

export const load = (async (_event) => {
	const form = await superValidate(zod(schema));

	// Fetch existing variants with their device context and values
	const existingVariants = await db
		.selectDistinctOn([variantsTable.id], {
			variantId: variantsTable.id,
			variantName: variantsTable.name,
			deviceId: deviceVariantsTable.deviceId,
			deviceName: devicesTable.name,
			optionValue: variantOptionsTable.value
		})
		.from(variantsTable)
		.innerJoin(deviceVariantsTable, eq(variantsTable.id, deviceVariantsTable.variantId))
		.innerJoin(devicesTable, eq(deviceVariantsTable.deviceId, devicesTable.id))
		.leftJoin(variantOptionsTable, eq(variantsTable.id, variantOptionsTable.variantId))
		.groupBy(
			variantsTable.id,
			variantsTable.name,
			deviceVariantsTable.deviceId,
			devicesTable.name,
			variantOptionsTable.value
		);

	return {
		form,
		deviceTypes: deviceTypeEnum.enumValues,
		protocols: protocolEnum.enumValues,
		existingVariants
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const deviceRepo = new PostgresDeviceRepository();

		try {
			// First create the device
			const deviceId = await deviceRepo.insertDevice({
				id: 0, // Will be ignored by the repository
				name: form.data.name,
				deviceType: form.data.deviceType,
				protocol: form.data.protocol,
				images: form.data.images,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Then handle variants
			for (const variantData of form.data.variants) {
				const [existingOption] = await db
					.select()
					.from(variantOptionsTable)
					.where(
						and(
							eq(variantOptionsTable.variantId, variantData.variantId),
							eq(variantOptionsTable.value, variantData.value)
						)
					);

				const variantOptionId =
					existingOption?.id ??
					(
						await db
							.insert(variantOptionsTable)
							.values({
								variantId: variantData.variantId,
								value: variantData.value
							})
							.returning({ id: variantOptionsTable.id })
					)[0].id;

				await db.insert(deviceVariantsTable).values({
					deviceId,
					variantId: variantData.variantId,
					variantOptionId
				});
			}

			return { form, success: true, deviceId };
		} catch (error) {
			console.error('Failed to create device:', error);
			return fail(500, {
				form,
				error: 'Failed to create device'
			});
		}
	}
} satisfies Actions;
