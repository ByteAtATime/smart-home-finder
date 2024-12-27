import type { DeviceWithProperties, PaginatedDevicesWithProperties } from '$lib/types/db';
import type { IDeviceRepository } from './types';
import type { IPropertyRepository } from '../properties/types';
import type { IListingRepository } from '../listings/types';

export class DeviceService {
	constructor(
		private deviceRepository: IDeviceRepository,
		private propertyRepository: IPropertyRepository,
		private listingRepository: IListingRepository
	) {}

	async getDeviceWithPropertiesAndPrices(
		id: number
	): Promise<(DeviceWithProperties & { prices: unknown }) | null> {
		const device = await this.deviceRepository.getDeviceById(id);
		if (!device) return null;

		const properties = await this.propertyRepository.getPropertiesForDevice(id);
		const prices = await this.listingRepository.getDevicePrices(id);

		return { ...device, properties, prices };
	}

	async getAllDevicesWithProperties(
		page: number,
		pageSize: number
	): Promise<PaginatedDevicesWithProperties> {
		const paginatedDevices = await this.deviceRepository.getAllDevicesPaginated(page, pageSize);
		const devicesWithProperties = await Promise.all(
			paginatedDevices.devices.map(async (device) => {
				const properties = await this.propertyRepository.getPropertiesForDevice(device.id);
				return { ...device, properties };
			})
		);

		return { ...paginatedDevices, devices: devicesWithProperties };
	}
}
