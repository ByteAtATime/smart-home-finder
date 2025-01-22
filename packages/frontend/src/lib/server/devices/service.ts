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
		// Start ALL database queries immediately in parallel
		const [paginatedDevices, _filteredTypes, _allProperties, _priceBounds] = await Promise.all([
			this.deviceRepository.getAllDevicesPaginated(page, pageSize, filters),
			this.deviceRepository.getFilteredDeviceTypes(filters),
			this.propertyRepository.getAllProperties(),
			this.listingRepository.getPriceBounds()
		]);

		const devices = paginatedDevices.items.map((device) => new Device(device, this));
		const deviceIds = devices.map((device) => device.id);

		// Start preloading everything in truly parallel fashion
		await Promise.all([
			// Properties - single query
			(async () => {
				await this.propertyRepository.preloadDeviceProperties(deviceIds);
			})(),
			// Listings - single query
			(async () => {
				await this.listingRepository.preloadDeviceListings(deviceIds);
			})(),
			// Variants - parallel queries
			(async () => {
				await this.variantRepository.preloadDeviceVariants(deviceIds);

				// Get variants and their options in parallel
				const variants = await Promise.all(
					devices.map((device) => this.variantRepository.getCachedDeviceVariants(device.id))
				);
				const variantIds = [...new Set(variants.flat().map((v) => v.id))];

				if (variantIds.length > 0) {
					await this.variantRepository.preloadVariantOptions(variantIds);
				}
			})()
		]);

		// Transform to JSON in parallel with optimized batching
		const BATCH_SIZE = 5; // Smaller batches for better parallelization
		const batches = [];

		// Process in smaller parallel batches
		for (let i = 0; i < devices.length; i += BATCH_SIZE) {
			const batch = devices.slice(i, i + BATCH_SIZE);
			batches.push(Promise.all(batch.map((device) => device.toJson())));
		}

		const items = (await Promise.all(batches)).flat();

		return {
			...paginatedDevices,
			items
		};
	}
}
