import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	deviceTypeEnum,
	protocolEnum,
	devicePropertiesTable,
	propertiesTable,
	deviceVariantsTable,
	variantOptionsTable,
	variantsTable,
	devicesTable
} from '@smart-home-finder/common/schema';
import { and, eq } from 'drizzle-orm';
import { PostgresDeviceRepository } from '$lib/server/devices/postgres';
import { PostgresPropertyRepository } from '$lib/server/properties/postgres';

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
		.record(z.string(), z.union([z.number(), z.string(), z.boolean()]).nullable())
		.default({})
});

export const load: PageServerLoad = async ({ params }) => {
	const deviceId = parseInt(params.id);
	if (isNaN(deviceId)) {
		throw error(400, 'Invalid device ID');
	}

	// Get the device
	const [device] = await db
		.select()
		.from(devicesTable)
		.where(eq(devicesTable.id, deviceId))
		.limit(1);

	if (!device) {
		throw error(404, 'Device not found');
	}

	// Get device variants
	const variants = await db
		.select({
			variantId: variantsTable.id,
			variantName: variantsTable.name,
			optionValue: variantOptionsTable.value
		})
		.from(variantsTable)
		.innerJoin(deviceVariantsTable, eq(variantsTable.id, deviceVariantsTable.variantId))
		.leftJoin(variantOptionsTable, eq(deviceVariantsTable.variantOptionId, variantOptionsTable.id))
		.where(eq(deviceVariantsTable.deviceId, deviceId));

	// Get device properties
	const properties = await db
		.select({
			id: propertiesTable.id,
			name: propertiesTable.name,
			type: propertiesTable.type,
			unit: propertiesTable.unit,
			description: propertiesTable.description,
			minValue: propertiesTable.minValue,
			maxValue: propertiesTable.maxValue,
			intValue: devicePropertiesTable.intValue,
			floatValue: devicePropertiesTable.floatValue,
			stringValue: devicePropertiesTable.stringValue,
			booleanValue: devicePropertiesTable.booleanValue,
			createdAt: propertiesTable.createdAt,
			updatedAt: propertiesTable.updatedAt
		})
		.from(propertiesTable)
		.leftJoin(
			devicePropertiesTable,
			and(
				eq(devicePropertiesTable.propertyId, propertiesTable.id),
				eq(devicePropertiesTable.deviceId, deviceId)
			)
		);

	// Get all available variants for the dropdowns
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

	// Initialize form with existing data
	const form = await superValidate(
		{
			name: device.name,
			deviceType: device.deviceType,
			protocol: device.protocol,
			images: device.images,
			variants: variants.map((v) => ({
				variantId: v.variantId,
				value: v.optionValue ?? ''
			})),
			properties: properties.reduce(
				(acc, p) => {
					acc[p.id] = p.intValue ?? p.floatValue ?? p.stringValue ?? p.booleanValue;
					return acc;
				},
				{} as Record<string, string | number | boolean | null>
			)
		},
		zod(schema)
	);

	return {
		form,
		deviceTypes: deviceTypeEnum.enumValues,
		protocols: protocolEnum.enumValues,
		existingVariants,
		properties
	};
};

export const actions = {
	default: async ({ request, params }) => {
		const deviceId = parseInt(params.id);
		if (isNaN(deviceId)) {
			throw error(400, 'Invalid device ID');
		}

		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const deviceRepo = new PostgresDeviceRepository();
		const propertyRepo = new PostgresPropertyRepository();

		try {
			// Update the device
			await deviceRepo.updateDevice(deviceId, {
				name: form.data.name,
				deviceType: form.data.deviceType,
				protocol: form.data.protocol,
				images: form.data.images
			});

			// Update variants
			// First, remove all existing variant options for this device
			await db.delete(deviceVariantsTable).where(eq(deviceVariantsTable.deviceId, deviceId));

			// Then add the new ones
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

			// Update properties
			// First, get all properties to determine their types
			const properties = await propertyRepo.getAllProperties();
			const propertyMap = new Map(properties.map((p) => [p.id, p]));

			// Remove all existing property values for this device
			await db.delete(devicePropertiesTable).where(eq(devicePropertiesTable.deviceId, deviceId));

			// Then add the new ones
			for (const [propertyId, value] of Object.entries(form.data.properties)) {
				if (value === null) continue;

				const property = propertyMap.get(propertyId);
				if (!property) continue;

				const propertyValue: typeof devicePropertiesTable.$inferInsert = {
					deviceId,
					propertyId,
					intValue: null,
					floatValue: null,
					stringValue: null,
					booleanValue: null
				};

				switch (property.type) {
					case 'int':
						propertyValue.intValue = typeof value === 'string' ? parseInt(value) : Number(value);
						break;
					case 'float':
						propertyValue.floatValue =
							typeof value === 'string' ? parseFloat(value) : Number(value);
						break;
					case 'string':
						propertyValue.stringValue = String(value);
						break;
					case 'boolean':
						propertyValue.booleanValue = Boolean(value);
						break;
				}

				await db.insert(devicePropertiesTable).values(propertyValue);
			}

			return { form };
		} catch (error) {
			console.error('Failed to update device:', error);
			return fail(500, {
				form,
				error: 'Failed to update device'
			});
		}
	}
} satisfies Actions;
