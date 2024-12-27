import type { DeviceWithProperties, InsertProperty } from '$lib/types/db';

export interface IPropertyRepository {
	insertProperty(property: InsertProperty): Promise<string>;
	getPropertiesForDevice(
		deviceId: number
	): Promise<Record<string, DeviceWithProperties['properties'][number]>>;
}
