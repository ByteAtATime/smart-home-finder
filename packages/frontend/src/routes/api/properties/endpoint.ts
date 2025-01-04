import { type IAuthProvider } from '$lib/server/auth/types';
import type { IPropertyRepository } from '$lib/server/properties/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import {
	insertPropertySchema,
	updatePropertySchema,
	type PropertyData
} from '@smart-home-finder/common/types';
import { Property } from '$lib/server/properties/property';

export const postBodySchema = insertPropertySchema;

export const endpoint_POST: EndpointHandler<{
	authProvider: IAuthProvider;
	propertyRepository: IPropertyRepository;
	body: z.infer<typeof postBodySchema>;
}> = async ({ authProvider, propertyRepository, body }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const propertyData = {
		id: body.id,
		name: body.name,
		type: body.type,
		unit: body.unit ?? null,
		description: body.description ?? null,
		minValue: body.minValue ?? null,
		maxValue: body.maxValue ?? null,
		createdAt: new Date(),
		updatedAt: new Date()
	} satisfies PropertyData;

	try {
		const newPropertyId = await propertyRepository.insertProperty(
			new Property(propertyData, propertyRepository)
		);
		return json({ success: true, id: newPropertyId }, { status: 201 });
	} catch (error) {
		console.error('Failed to create property:', error);
		return json({ success: false, error: 'Failed to create property' }, { status: 500 });
	}
};

export const endpoint_GET: EndpointHandler<{
	propertyRepository: IPropertyRepository;
}> = async ({ propertyRepository }) => {
	try {
		const properties = await propertyRepository.getAllProperties();
		const propertiesJson = await Promise.all(properties.map((property) => property.toJson()));
		return json({ success: true, properties: propertiesJson });
	} catch (error) {
		console.error('Failed to get properties:', error);
		return json({ success: false, error: 'Failed to get properties' }, { status: 500 });
	}
};

export const patchBodySchema = updatePropertySchema;

export const endpoint_PATCH: EndpointHandler<{
	authProvider: IAuthProvider;
	propertyRepository: IPropertyRepository;
	params: { id: string };
	body: z.infer<typeof patchBodySchema>;
}> = async ({ authProvider, propertyRepository, params, body }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const propertyId = params.id;

	try {
		const updatedProperty = await propertyRepository.updateProperty(propertyId, body);
		if (!updatedProperty) {
			return json({ success: false, error: 'Property not found' }, { status: 404 });
		}

		return json({ success: true, property: await updatedProperty.toJson() });
	} catch (error) {
		console.error('Failed to update property:', error);
		return json({ success: false, error: 'Failed to update property' }, { status: 500 });
	}
};

export const endpoint_DELETE: EndpointHandler<{
	authProvider: IAuthProvider;
	propertyRepository: IPropertyRepository;
	params: { id: string };
}> = async ({ authProvider, propertyRepository, params }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const propertyId = params.id;

	try {
		const success = await propertyRepository.deleteProperty(propertyId);
		if (!success) {
			return json({ success: false, error: 'Property not found or in use' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete property:', error);
		return json({ success: false, error: 'Failed to delete property' }, { status: 500 });
	}
};
