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
	getDeviceProperties(deviceId: number): Promise<Property[]>;
	getPropertyById(id: string): Promise<Property | null>;
	getPropertyValueForDevice(
		propertyId: string,
		deviceId: number
	): Promise<string | number | boolean | null>;

	/**
	 * Pre-fetches properties and their values for multiple devices.
	 * This allows batch loading of properties to avoid N+1 queries.
	 * @param deviceIds - Array of device IDs to pre-fetch properties for
	 */
	preloadDeviceProperties(deviceIds: number[]): Promise<void>;

	/**
	 * Gets property values for a device from the cache if available, otherwise fetches from DB.
	 * Should be called after preloadDeviceProperties for optimal performance.
	 */
	getCachedDeviceProperties(deviceId: number): Promise<Property[]>;
}
