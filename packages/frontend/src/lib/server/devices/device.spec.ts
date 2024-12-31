import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Device } from './device';
import type { DeviceService } from './service';
import type { DeviceData, ListingWithPrice, Variant } from '@smart-home-finder/common/types';
import type { Property } from '../properties/property';

const mockDeviceService = {
	getDeviceVariants: vi.fn(),
	getAllProperties: vi.fn(),
	getDeviceListings: vi.fn()
} as unknown as DeviceService;

const mockDeviceData: DeviceData = {
	id: 1,
	name: 'Test Device',
	images: ['image1.jpg', 'image2.png'],
	deviceType: 'switch',
	protocol: 'zigbee',
	createdAt: new Date('2023-10-27T10:00:00Z'),
	updatedAt: new Date('2023-10-27T12:30:00Z')
};

const mockVariants: Variant[] = [
	{
		id: 1,
		name: 'Color',
		createdAt: new Date('2023-10-26T10:00:00Z'),
		updatedAt: new Date('2023-10-26T11:00:00Z')
	}
];

const mockProperties: Property[] = [
	{
		id: 'prop1',
		name: 'Voltage',
		type: 'float',
		unit: 'V',
		description: 'Voltage of the device',
		createdAt: new Date('2023-10-25T08:00:00Z'),
		updatedAt: new Date('2023-10-25T09:00:00Z'),
		getValueForDevice: vi.fn().mockResolvedValue(120),
		toJson: vi.fn().mockResolvedValue({
			id: 'prop1',
			name: 'Voltage',
			type: 'float',
			unit: 'V',
			description: 'Voltage of the device',
			createdAt: new Date('2023-10-25T08:00:00Z'),
			updatedAt: new Date('2023-10-25T09:00:00Z'),
			value: 120
		})
	} as unknown as Property
];

const mockListings: ListingWithPrice[] = [
	{
		listingId: 1,
		deviceId: 1,
		sellerId: 1,
		sellerName: 'Test Seller',
		url: 'https://test-seller.com/device',
		isActive: true,
		listingCreatedAt: new Date('2023-10-27T08:00:00Z'),
		listingUpdatedAt: new Date('2023-10-27T09:30:00Z'),
		priceId: 1,
		price: 99.99,
		inStock: true,
		validFrom: new Date('2023-10-27T09:00:00Z'),
		validTo: null,
		priceCreatedAt: new Date('2023-10-27T09:00:00Z'),
		priceUpdatedAt: new Date('2023-10-27T09:30:00Z')
	}
];

describe('Device', () => {
	let device: Device;

	beforeEach(() => {
		vi.clearAllMocks();
		device = new Device(mockDeviceData, mockDeviceService);
	});

	it('should correctly initialize with DeviceData', () => {
		expect(device.id).toBe(mockDeviceData.id);
		expect(device.name).toBe(mockDeviceData.name);
		expect(device.images).toEqual(mockDeviceData.images);
		expect(device.deviceType).toBe(mockDeviceData.deviceType);
		expect(device.protocol).toBe(mockDeviceData.protocol);
		expect(device.createdAt).toBe(mockDeviceData.createdAt);
		expect(device.updatedAt).toBe(mockDeviceData.updatedAt);
	});

	it('getVariants should fetch and return variants', async () => {
		vi.mocked(mockDeviceService.getDeviceVariants).mockResolvedValue(mockVariants);

		const variants = await device.getVariants();

		expect(mockDeviceService.getDeviceVariants).toHaveBeenCalledWith(mockDeviceData.id);
		expect(variants).toEqual(mockVariants);
	});

	it('getProperties should fetch and return properties', async () => {
		vi.mocked(mockDeviceService.getAllProperties).mockResolvedValue(mockProperties);

		const properties = await device.getProperties();

		expect(mockDeviceService.getAllProperties).toHaveBeenCalled();
		expect(properties).toEqual(mockProperties);
	});

	it('getListings should fetch and return listings', async () => {
		vi.mocked(mockDeviceService.getDeviceListings).mockResolvedValue(mockListings);

		const listings = await device.getListings();

		expect(mockDeviceService.getDeviceListings).toHaveBeenCalledWith(mockDeviceData.id);
		expect(listings).toEqual(mockListings);
	});

	it('toJson should return correct DeviceJson', async () => {
		vi.mocked(mockDeviceService.getDeviceVariants).mockResolvedValue(mockVariants);
		vi.mocked(mockDeviceService.getAllProperties).mockResolvedValue(mockProperties);
		vi.mocked(mockDeviceService.getDeviceListings).mockResolvedValue(mockListings);

		const expectedJson = {
			...mockDeviceData,
			variants: mockVariants,
			properties: {
				prop1: {
					id: 'prop1',
					name: 'Voltage',
					type: 'float',
					unit: 'V',
					description: 'Voltage of the device',
					createdAt: new Date('2023-10-25T08:00:00Z'),
					updatedAt: new Date('2023-10-25T09:00:00Z'),
					value: 120
				}
			},
			listings: mockListings
		};

		const json = await device.toJson();
		expect(json).toEqual(expectedJson);
	});
	it('should only fetch variants once', async () => {
		vi.mocked(mockDeviceService.getDeviceVariants).mockResolvedValue(mockVariants);

		await device.getVariants();
		await device.getVariants();
		await device.getVariants();

		expect(mockDeviceService.getDeviceVariants).toHaveBeenCalledTimes(1);
	});

	it('should only fetch properties once', async () => {
		vi.mocked(mockDeviceService.getAllProperties).mockResolvedValue(mockProperties);

		await device.getProperties();
		await device.getProperties();
		await device.getProperties();

		expect(mockDeviceService.getAllProperties).toHaveBeenCalledTimes(1);
	});

	it('should only fetch listings once', async () => {
		vi.mocked(mockDeviceService.getDeviceListings).mockResolvedValue(mockListings);

		await device.getListings();
		await device.getListings();
		await device.getListings();

		expect(mockDeviceService.getDeviceListings).toHaveBeenCalledTimes(1);
	});
});
