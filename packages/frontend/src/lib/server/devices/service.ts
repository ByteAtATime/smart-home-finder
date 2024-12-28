import type {
	DeviceWithDetails,
	PaginatedDevicesWithDetails
} from '@smart-home-finder/common/types';
import type { IDeviceRepository } from './types';
import type { IPropertyRepository } from '../properties/types';
import type { IListingRepository } from '../listings/types';

export class DeviceService {
	constructor(
		private deviceRepository: IDeviceRepository,
		private propertyRepository: IPropertyRepository,
		private listingRepository: IListingRepository
	) {}

	async getDeviceWithVariantsAndProperties(id: number): Promise<DeviceWithDetails | null> {
		const device = await this.deviceRepository.getDeviceById(id);
		if (!device) return null;

		const properties = await this.propertyRepository.getPropertiesForDevice(id);
		const prices = await this.listingRepository.getDevicePrices(id);

		const variants = await this.deviceRepository.getVariantsForDevice(id);

		return { ...device, variants, properties, prices };
	}

	async getAllDevicesWithVariantsAndProperties(
		page: number,
		pageSize: number,
		filters: { deviceType?: string; protocol?: string } = {}
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
				return { ...device, variants, properties, prices };
			})
		);

		return { ...paginatedDevices, devices: devicesWithVariantsAndProperties };
	}
}
