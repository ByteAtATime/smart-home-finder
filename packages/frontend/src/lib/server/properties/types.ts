import type { UpdateProperty } from '@smart-home-finder/common/types';
import type { Property } from './property';

export interface IPropertyRepository {
	/**
	 * Inserts a new {@link Property} into the database.
	 *
	 * @param property - The property to insert. The fields `createdAt`, `updatedAt` are ignored.
	 * @returns The ID of the inserted property.
	 */
	insertProperty(property: Property): Promise<string>;
	updateProperty(id: string, propertyData: UpdateProperty): Promise<Property | null>;
	deleteProperty(id: string): Promise<boolean>;
	getAllProperties(): Promise<Property[]>;
	getPropertyById(id: string): Promise<Property | null>;
	getPropertyValueForDevice(
		propertyId: string,
		deviceId: number
	): Promise<string | number | boolean | null>;
}
