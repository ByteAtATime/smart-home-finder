import type { DeviceWithProperties, InsertProperty } from '@smart-home-finder/common/types';

export interface IPropertyRepository {
	insertProperty(property: InsertProperty): Promise<string>;
	getPropertiesForDevice(
		deviceId: number
	): Promise<Record<string, DeviceWithProperties['properties'][number]>>;
}
