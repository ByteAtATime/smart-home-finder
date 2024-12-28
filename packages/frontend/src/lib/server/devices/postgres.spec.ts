import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresDeviceRepository } from './postgres';
import { db } from '$lib/server/db';
import type { InsertDevice } from '@smart-home-finder/common/types';
import { devicesTable, variantOptionsTable, variantsTable } from '@smart-home-finder/common/schema';

vi.mock('$lib/server/db', () => ({
	db: {
		query: {
			devicesTable: {
				findMany: vi.fn(),
				findFirst: vi.fn()
			}
		},
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		leftJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		offset: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		execute: vi.fn()
	}
}));

describe('PostgresDeviceRepository', () => {
	let repository: PostgresDeviceRepository;

	beforeEach(() => {
		repository = new PostgresDeviceRepository();
	});

	it('should get all devices', async () => {
		const mockDevices = [
			{ id: 1, name: 'Device 1' },
			{ id: 2, name: 'Device 2' }
		];
		db.query.devicesTable.findMany.mockResolvedValue(mockDevices);

		const devices = await repository.getAllDevices();

		expect(db.query.devicesTable.findMany).toHaveBeenCalled();
		expect(devices).toEqual(mockDevices);
	});

	it('should get all devices paginated', async () => {
		const mockDevices = [{ id: 1, name: 'Device 1' }];
		const mockTotal = [{ value: 1 }];

		db.select().from().execute.mockResolvedValue(mockTotal);
		db.select().from().offset().limit.mockResolvedValue(mockDevices);

		const page = 1;
		const pageSize = 10;
		const result = await repository.getAllDevicesPaginated(page, pageSize);

		expect(db.select().from().offset).toHaveBeenCalledWith(0);
		expect(db.select().from().limit).toHaveBeenCalledWith(pageSize);
		expect(db.select().from().execute).toHaveBeenCalled();
		expect(result).toEqual({
			devices: mockDevices,
			total: mockTotal[0].value,
			page,
			pageSize
		});
	});

	it('should get device by ID', async () => {
		const mockDevice = {
			id: 1,
			name: 'Device 1',
			images: [],
			deviceType: 'switch',
			protocol: 'zigbee',
			createdAt: new Date(),
			updatedAt: new Date()
		};
		db.query.devicesTable.findFirst.mockResolvedValue(mockDevice);

		const device = await repository.getDeviceById(1);

		expect(db.query.devicesTable.findFirst).toHaveBeenCalled();
		expect(device).toEqual(mockDevice);
	});

	it('should return null if device not found by ID', async () => {
		db.query.devicesTable.findFirst.mockResolvedValue(undefined);

		const device = await repository.getDeviceById(99);

		expect(device).toBeNull();
	});

	it('should insert a new device', async () => {
		const newDevice: InsertDevice = {
			name: 'New Device',
			deviceType: 'switch',
			protocol: 'zigbee',
			images: []
		};
		const insertedDevice = { insertedId: 1 };
		db.insert().values().returning.mockResolvedValue([insertedDevice]);

		const result = await repository.insertDevice(newDevice);

		expect(db.insert).toHaveBeenCalledWith(devicesTable);
		expect(db.values).toHaveBeenCalledWith(newDevice);
		expect(db.returning).toHaveBeenCalledWith({ insertedId: devicesTable.id });
		expect(result).toBe(insertedDevice.insertedId);
	});

	it('should throw an error if inserting a device fails', async () => {
		const newDevice: InsertDevice = {
			name: 'New Device',
			deviceType: 'switch',
			protocol: 'zigbee',
			images: []
		};
		db.insert().values().returning.mockResolvedValue([]);

		await expect(repository.insertDevice(newDevice)).rejects.toThrow('Failed to insert device');
	});

	it('should get variants for a device', async () => {
		const deviceId = 1;
		const mockVariants = [
			{
				id: 1,
				name: 'Variant 1',
				updatedAt: new Date(),
				createdAt: new Date(),
				deviceId: deviceId,
				optionId: 1,
				optionValue: 'Option 1'
			},
			{
				id: 1,
				name: 'Variant 1',
				updatedAt: new Date(),
				createdAt: new Date(),
				deviceId: deviceId,
				optionId: 2,
				optionValue: 'Option 2'
			},
			{
				id: 2,
				name: 'Variant 2',
				updatedAt: new Date(),
				createdAt: new Date(),
				deviceId: deviceId,
				optionId: 3,
				optionValue: 'Option 3'
			}
		];
		db.select().from.mockReturnThis();
		db.select().from().leftJoin().where.mockResolvedValue(mockVariants);

		const result = await repository.getVariantsForDevice(deviceId);

		expect(db.select).toHaveBeenCalled();
		expect(db.from).toHaveBeenCalledWith(variantsTable);
		expect(db.leftJoin).toHaveBeenCalledWith(variantOptionsTable, expect.anything());
		expect(db.where).toHaveBeenCalled();

		expect(result).toEqual([
			{
				id: 1,
				name: 'Variant 1',
				updatedAt: expect.any(Date),
				createdAt: expect.any(Date),
				deviceId: deviceId,
				options: [
					{
						id: 1,
						value: 'Option 1',
						variantId: 1,
						createdAt: expect.any(Date),
						updatedAt: expect.any(Date),
						deviceId: deviceId
					},
					{
						id: 2,
						value: 'Option 2',
						variantId: 1,
						createdAt: expect.any(Date),
						updatedAt: expect.any(Date),
						deviceId: deviceId
					}
				]
			},
			{
				id: 2,
				name: 'Variant 2',
				updatedAt: expect.any(Date),
				createdAt: expect.any(Date),
				deviceId: deviceId,
				options: [
					{
						id: 3,
						value: 'Option 3',
						variantId: 2,
						createdAt: expect.any(Date),
						updatedAt: expect.any(Date),
						deviceId: deviceId
					}
				]
			}
		]);
	});

	it('should return an empty array if no variants are found for a device', async () => {
		const deviceId = 1;
		db.select().from.mockReturnThis();
		db.select().from().leftJoin().where.mockResolvedValue([]);

		const result = await repository.getVariantsForDevice(deviceId);

		expect(result).toEqual([]);
	});
});
