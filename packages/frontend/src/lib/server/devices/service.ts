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

	async getAllDevices(): Promise<Device[]> {
		const deviceData = await this.deviceRepository.getAllDevices();
		return deviceData.map((device) => new Device(device, this));
	}

	async getAllProperties(): Promise<Property[]> {
		return await this.propertyRepository.getAllProperties();
	}

	async getDeviceProperties(id: number): Promise<Property[]> {
		return await this.propertyRepository.getCachedDeviceProperties(id);
	}

	async getDeviceListings(id: number): Promise<ListingWithPrice[]> {
		return await this.listingRepository.getCachedDevicePrices(id);
	}

	async getDeviceVariants(id: number): Promise<Variant[]> {
		return await this.variantRepository.getCachedDeviceVariants(id);
	}

	async getDeviceById(id: number): Promise<Device | null> {
		const baseDevice = await this.deviceRepository.getBaseDeviceById(id);
		if (!baseDevice) return null;

		// Pre-fetch data for this device
		await Promise.all([
			this.propertyRepository.preloadDeviceProperties([id]),
			this.variantRepository.preloadDeviceVariants([id]),
			this.listingRepository.preloadDeviceListings([id])
		]);

		// Pre-fetch variant options
		const variants = await this.variantRepository.getCachedDeviceVariants(id);
		if (variants.length > 0) {
			await this.variantRepository.preloadVariantOptions(
				variants.map((v) => v.id),
				id
			);
		}

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
		const deviceIds = devices.map((device) => device.id);

		await Promise.all([
			this.propertyRepository.preloadDeviceProperties(deviceIds),
			this.variantRepository.preloadDeviceVariants(deviceIds),
			this.listingRepository.preloadDeviceListings(deviceIds)
		]);

		const variants = await Promise.all(
			devices.map((device) => this.variantRepository.getCachedDeviceVariants(device.id))
		);
		const variantIds = [...new Set(variants.flat().map((variant) => variant.id))];
		await this.variantRepository.preloadVariantOptions(variantIds);

		return {
			...paginatedDevices,
			items: await Promise.all(devices.map((device) => device.toJson()))
		};
	}
}
