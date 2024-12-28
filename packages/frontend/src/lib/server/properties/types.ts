import type {
	DeviceWithDetails,
	InsertProperty,
	Property,
	UpdateProperty
} from '@smart-home-finder/common/types';

export interface IPropertyRepository {
	insertProperty(property: InsertProperty): Promise<string>;
	updateProperty(id: string, propertyData: UpdateProperty): Promise<Property | null>;
	deleteProperty(id: string): Promise<boolean>;
	getPropertiesForDevice(
		deviceId: number
	): Promise<Record<string, DeviceWithDetails['properties'][number]>>;
	getAllProperties(): Promise<Property[]>;
}
