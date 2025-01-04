import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceService } from './service';
import { MockDeviceRepository } from './mock';
import { MockPropertyRepository } from '../properties/mock';
import { MockListingRepository } from '../listings/mock';
import type {
	DeviceData,
	ListingWithPrice,
	Paginated,
	VariantWithOptions
} from '@smart-home-finder/common/types';
import { Property } from '../properties/property';
import { MockVariantRepository } from '../variant/mock';

describe('DeviceService', () => {
	let deviceService: DeviceService;
	let mockDeviceRepository: MockDeviceRepository;
	let mockPropertyRepository: MockPropertyRepository;
	let mockListingRepository: MockListingRepository;
	let mockVariantRepository: MockVariantRepository;
	beforeEach(() => {
		mockDeviceRepository = new MockDeviceRepository();
		mockPropertyRepository = new MockPropertyRepository();
		mockListingRepository = new MockListingRepository();
		mockVariantRepository = new MockVariantRepository();
		deviceService = new DeviceService(
			mockDeviceRepository,
			mockPropertyRepository,
			mockListingRepository,
			mockVariantRepository
		);
	});

	it('should get device with variants and properties', async () => {
		const deviceId = 1;
		const mockDevice: DeviceData = {
			id: deviceId,
			name: 'Test Device',
			deviceType: 'light',
			protocol: 'zwave',
			createdAt: new Date(),
			updatedAt: new Date(),
			images: []
		};
		const mockVariants: VariantWithOptions[] = [
			{
				id: 1,
				name: 'Variant 1',
				createdAt: new Date(),
				updatedAt: new Date(),
				options: []
			}
		];
		const mockProperties = [
			new Property(
				{
					id: 'property1',
					name: 'Property 1',
					type: 'string',
					unit: null,
					description: null,
					minValue: null,
					maxValue: null,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				mockPropertyRepository
			)
		];

		const mockPrices: ListingWithPrice[] = [];

		mockDeviceRepository.getBaseDeviceById.mockResolvedValue(mockDevice);
		mockPropertyRepository.getAllProperties.mockResolvedValue(mockProperties);
		mockListingRepository.getDevicePrices.mockResolvedValue(mockPrices);
		mockVariantRepository.getVariantsForDevice.mockResolvedValue(mockVariants);

		const result = await deviceService.getDeviceById(deviceId);

		expect(result).toBeDefined();

		expect(await result!.getListings()).toEqual(mockPrices);
		expect(await result!.getVariants()).toEqual(mockVariants);
		expect(await result!.getProperties()).toEqual(mockProperties);
	});

	it('should return null if device not found', async () => {
		const deviceId = 99;
		mockDeviceRepository.getBaseDeviceById.mockResolvedValue(null);

		const result = await deviceService.getDeviceById(deviceId);

		expect(result).toBeNull();
	});

	it('should get all devices with variants and properties', async () => {
		const page = 1;
		const pageSize = 10;
		const mockPaginatedDevices: Paginated<DeviceData> = {
			items: [
				{
					id: 1,
					name: 'Device 1',
					deviceType: 'light',
					protocol: 'zwave',
					createdAt: new Date(),
					updatedAt: new Date(),
					images: []
				},
				{
					id: 2,
					name: 'Device 2',
					deviceType: 'switch',
					protocol: 'zigbee',
					createdAt: new Date(),
					updatedAt: new Date(),
					images: []
				}
			],
			total: 2,
			page,
			pageSize
		};
		const mockVariants: VariantWithOptions[] = [];
		const mockProperties: Property[] = [];
		const mockPrices: ListingWithPrice[] = [];

		mockDeviceRepository.getAllDevicesPaginated.mockResolvedValue(mockPaginatedDevices);
		mockPropertyRepository.getAllProperties.mockResolvedValue(mockProperties);
		mockListingRepository.getDevicePrices.mockResolvedValue(mockPrices);
		mockVariantRepository.getVariantsForDevice.mockResolvedValue(mockVariants);

		const result = await deviceService.getAllDevicesWithVariantsAndProperties(page, pageSize);

		expect(mockDeviceRepository.getAllDevicesPaginated).toHaveBeenCalledWith(page, pageSize, {});
		expect(mockPropertyRepository.getAllProperties).toHaveBeenCalledTimes(
			mockPaginatedDevices.items.length
		);
		expect(mockListingRepository.getDevicePrices).toHaveBeenCalledTimes(
			mockPaginatedDevices.items.length
		);

		expect(result).toEqual({
			...mockPaginatedDevices,
			items: mockPaginatedDevices.items.map((device) => ({
				...device,
				variants: mockVariants,
				properties: {},
				listings: mockPrices
			}))
		});
	});
});
