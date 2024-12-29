import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceService } from './service';
import { MockDeviceRepository } from './mock';
import { MockPropertyRepository } from '../properties/mock';
import { MockListingRepository } from '../listings/mock';
import type {
	BaseDevice,
	ListingWithPrice,
	PaginatedDevices,
	VariantWithOptions
} from '@smart-home-finder/common/types';

describe('DeviceService', () => {
	let deviceService: DeviceService;
	let mockDeviceRepository: MockDeviceRepository;
	let mockPropertyRepository: MockPropertyRepository;
	let mockListingRepository: MockListingRepository;

	beforeEach(() => {
		mockDeviceRepository = new MockDeviceRepository();
		mockPropertyRepository = new MockPropertyRepository();
		mockListingRepository = new MockListingRepository();
		deviceService = new DeviceService(
			mockDeviceRepository,
			mockPropertyRepository,
			mockListingRepository
		);
	});

	it('should get device with variants and properties', async () => {
		const deviceId = 1;
		const mockDevice: BaseDevice = {
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
				deviceId: deviceId,
				createdAt: new Date(),
				updatedAt: new Date(),
				options: []
			}
		];
		const mockProperties = {
			property1: {
				id: 'property1',
				name: 'Property 1',
				type: 'string',
				value: 'Value 1',
				unit: null,
				description: null
			}
		};

		const mockPrices: ListingWithPrice[] = [];

		mockDeviceRepository.getBaseDeviceById.mockResolvedValue(mockDevice);
		mockDeviceRepository.getVariantsForDevice.mockResolvedValue(mockVariants);
		mockPropertyRepository.getPropertiesForDevice.mockResolvedValue(mockProperties);
		mockListingRepository.getDevicePrices.mockResolvedValue(mockPrices);

		const result = await deviceService.getDeviceWithVariantsAndProperties(deviceId);

		expect(mockDeviceRepository.getBaseDeviceById).toHaveBeenCalledWith(deviceId);
		expect(mockDeviceRepository.getVariantsForDevice).toHaveBeenCalledWith(deviceId);
		expect(mockPropertyRepository.getPropertiesForDevice).toHaveBeenCalledWith(deviceId);
		expect(mockListingRepository.getDevicePrices).toHaveBeenCalledWith(deviceId);
		expect(result).toEqual({
			...mockDevice,
			variants: mockVariants,
			properties: mockProperties,
			prices: mockPrices
		});
	});

	it('should return null if device not found', async () => {
		const deviceId = 99;
		mockDeviceRepository.getBaseDeviceById.mockResolvedValue(null);

		const result = await deviceService.getDeviceWithVariantsAndProperties(deviceId);

		expect(result).toBeNull();
	});

	it('should get all devices with variants and properties', async () => {
		const page = 1;
		const pageSize = 10;
		const mockPaginatedDevices: PaginatedDevices = {
			devices: [
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
		const mockProperties = {};
		const mockPrices: ListingWithPrice[] = [];

		mockDeviceRepository.getAllDevicesPaginated.mockResolvedValue(mockPaginatedDevices);
		mockDeviceRepository.getVariantsForDevice.mockResolvedValue(mockVariants);
		mockPropertyRepository.getPropertiesForDevice.mockResolvedValue(mockProperties);
		mockListingRepository.getDevicePrices.mockResolvedValue(mockPrices);

		const result = await deviceService.getAllDevicesWithVariantsAndProperties(page, pageSize);

		expect(mockDeviceRepository.getAllDevicesPaginated).toHaveBeenCalledWith(page, pageSize, {});
		expect(mockDeviceRepository.getVariantsForDevice).toHaveBeenCalledTimes(
			mockPaginatedDevices.devices.length
		);
		expect(mockPropertyRepository.getPropertiesForDevice).toHaveBeenCalledTimes(
			mockPaginatedDevices.devices.length
		);
		expect(mockListingRepository.getDevicePrices).toHaveBeenCalledTimes(
			mockPaginatedDevices.devices.length
		);

		expect(result).toEqual({
			...mockPaginatedDevices,
			devices: mockPaginatedDevices.devices.map((device) => ({
				...device,
				variants: mockVariants,
				properties: mockProperties,
				prices: mockPrices
			}))
		});
	});
});
