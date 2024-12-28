import type { DeviceWithDetails, InsertProperty } from '@smart-home-finder/common/types';

export interface IPropertyRepository {
	insertProperty(property: InsertProperty): Promise<string>;
	getPropertiesForDevice(
		deviceId: number
	): Promise<Record<string, DeviceWithDetails['properties'][number]>>;
}
