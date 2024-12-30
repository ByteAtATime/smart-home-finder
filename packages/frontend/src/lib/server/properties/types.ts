import type { InsertProperty, UpdateProperty } from '@smart-home-finder/common/types';
import type { Property } from './property';

export interface IPropertyRepository {
	insertProperty(property: InsertProperty): Promise<string>;
	updateProperty(id: string, propertyData: UpdateProperty): Promise<Property | null>;
	deleteProperty(id: string): Promise<boolean>;
	getAllProperties(): Promise<Property[]>;
	getPropertyById(id: string): Promise<Property | null>;
	getPropertyValueForDevice(
		propertyId: string,
		deviceId: number
	): Promise<string | number | boolean | null>;
}
