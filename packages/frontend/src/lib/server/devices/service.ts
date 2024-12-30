import type {
	DeviceProperties,
	ListingWithPrice,
	PaginatedDevicesWithDetails,
	Variant
} from '@smart-home-finder/common/types';
import type { IDeviceRepository } from './types';
import type { IPropertyRepository } from '../properties/types';
import type { IListingRepository } from '../listings/types';
import { Device } from './device';

export class DeviceService {
	constructor(
		private deviceRepository: IDeviceRepository,
		private propertyRepository: IPropertyRepository,
		private listingRepository: IListingRepository
	) {}

	async getDeviceVariants(id: number): Promise<Variant[]> {
		return await this.deviceRepository.getVariantsForDevice(id);
	}

	async getDeviceProperties(id: number): Promise<DeviceProperties> {
		return await this.propertyRepository.getPropertiesForDevice(id);
	}

	async getDeviceListings(id: number): Promise<ListingWithPrice[]> {
		return await this.listingRepository.getDevicePrices(id);
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
	): Promise<PaginatedDevicesWithDetails> {
		const paginatedDevices = await this.deviceRepository.getAllDevicesPaginated(
			page,
			pageSize,
			filters
		);
		const devicesWithVariantsAndProperties = await Promise.all(
			paginatedDevices.devices.map(async (device) => {
				const variants = await this.deviceRepository.getVariantsForDevice(device.id);
				const properties = await this.propertyRepository.getPropertiesForDevice(device.id);
				const prices = await this.listingRepository.getDevicePrices(device.id);
				return { ...device, variants, properties, listings: prices };
			})
		);

		return { ...paginatedDevices, devices: devicesWithVariantsAndProperties };
	}
}
