import type { ListingWithPrice, Paginated, DeviceType } from '@smart-home-finder/common/types';
import type { DeviceFilters, IDeviceRepository } from './types';
import type { IPropertyRepository } from '../properties/types';
import type { IListingRepository } from '../listings/types';
import { Device, type DeviceJson } from './device';
import type { Property } from '../properties/property';
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

	async getFilteredDeviceTypes(
		filters: Omit<DeviceFilters, 'propertyFilters'>
	): Promise<DeviceType[]> {
		return await this.deviceRepository.getFilteredDeviceTypes(filters);
	}

	async getAllDevicesWithVariantsAndProperties(
		page: number,
		pageSize: number,
		filters: DeviceFilters = {}
	): Promise<Paginated<DeviceJson>> {
		const paginatedDevices = await this.deviceRepository.getAllDevicesPaginated(
			page,
			pageSize,
			filters
		);

		const devices = paginatedDevices.items.map((device) => new Device(device, this));

		return {
			...paginatedDevices,
			items: await Promise.all(devices.map((device) => device.toJson()))
		};
	}
}
