import type { ListingWithPrice, Paginated } from '@smart-home-finder/common/types';
import type { IDeviceRepository } from './types';
import type { IPropertyRepository } from '../properties/types';
import type { IListingRepository } from '../listings/types';
import { Device, type DeviceJson } from './device';
import type { Property, PropertyJson } from '../properties/property';
import type { IVariantRepository } from '../variant/types';
import type { Variant } from '../variant/variant';

export class DeviceService {
	constructor(
		private deviceRepository: IDeviceRepository,
		private propertyRepository: IPropertyRepository,
		private listingRepository: IListingRepository,
		private variantRepository: IVariantRepository
	) {}

	async getAllProperties(): Promise<Property[]> {
		return await this.propertyRepository.getAllProperties();
	}

	async getDeviceListings(id: number): Promise<ListingWithPrice[]> {
		return await this.listingRepository.getDevicePrices(id);
	}

	async getDeviceVariants(id: number): Promise<Variant[]> {
		return await this.variantRepository.getVariantsForDevice(id);
	}

	async getDeviceById(id: number): Promise<Device | null> {
		const baseDevice = await this.deviceRepository.getBaseDeviceById(id);
		if (!baseDevice) return null;

		return new Device(baseDevice, this);
	}

	async getAllDevicesWithVariantsAndProperties(
		page: number,
		pageSize: number,
		filters: { deviceType?: string[]; protocol?: string[] } = {}
	): Promise<Paginated<DeviceJson>> {
		const paginatedDevices = await this.deviceRepository.getAllDevicesPaginated(
			page,
			pageSize,
			filters
		);
		const devicesWithVariantsAndProperties = await Promise.all(
			paginatedDevices.items.map(async (device) => {
				const deviceInstance = new Device(device, this);
				const variants = await deviceInstance.getVariants();
				const properties = await deviceInstance.getProperties();
				const listings = await deviceInstance.getListings();

				const jsonProperties = await Promise.all(
					properties.map((property) => property.toJson(device.id))
				);

				const propertiesById = jsonProperties.reduce(
					(acc, property) => {
						acc[property.id] = property;
						return acc;
					},
					{} as Record<string, PropertyJson>
				);

				return {
					...device,
					variants: await Promise.all(variants.map((variant) => variant.toJson())),
					properties: propertiesById,
					listings: listings
				};
			})
		);

		return { ...paginatedDevices, items: devicesWithVariantsAndProperties };
	}
}
