import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresDeviceRepository } from './postgres';
import type { DeviceData } from '@smart-home-finder/common/types';
import { and, between, eq, inArray, isNull } from 'drizzle-orm';
import { devicesTable, priceHistoryTable } from '@smart-home-finder/common/schema';

const createMockDevice = (id: number) => ({
	id,
	name: `Device ${id}`,
	images: [],
	deviceType: 'switch',
	protocol: 'zigbee',
	createdAt: new Date(),
	updatedAt: new Date()
});

const mockDb = vi.hoisted(() => ({
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
	innerJoin: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	offset: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
	groupBy: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	execute: vi.fn()
}));

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

describe('PostgresDeviceRepository', () => {
	let repository: PostgresDeviceRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new PostgresDeviceRepository();
	});

	describe('getAllDevices', () => {
		it('should return all devices', async () => {
			const mockDevices = [createMockDevice(1), createMockDevice(2)];
			mockDb.query.devicesTable.findMany.mockResolvedValue(mockDevices);

			const devices = await repository.getAllDevices();

			expect(devices).toEqual(mockDevices);
		});
	});

	describe('getAllDevicesPaginated', () => {
		it.skip('should return paginated devices with total count', async () => {
			const mockDevices = [createMockDevice(1)];
			const mockTotal = [{ value: 1 }];

			mockDb
				.select()
				.from()
				.offset()
				.limit()
				.leftJoin()
				.leftJoin()
				.where.mockResolvedValue(mockDevices);
			mockDb.select().from().execute.mockResolvedValue(mockTotal);

			const result = await repository.getAllDevicesPaginated(1, 10);

			expect(result).toEqual({
				items: mockDevices,
				total: mockTotal[0].value,
				page: 1,
				pageSize: 10
			});
		});

		it.skip('should apply filters correctly', async () => {
			const mockDevices = [createMockDevice(1)];
			const mockTotal = [{ value: 1 }];

			mockDb.where.mockResolvedValue(mockDevices);
			mockDb.leftJoin.mockReturnValue({
				leftJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(mockDevices)
				})
			});

			const result = await repository.getAllDevicesPaginated(1, 10, {
				deviceType: ['light'],
				protocol: ['zigbee'],
				priceBounds: [10, 50]
			});

			expect(mockDb.where).toHaveBeenCalledWith(
				and(
					inArray(devicesTable.deviceType, ['light']),
					inArray(devicesTable.protocol, ['zigbee']),
					between(priceHistoryTable.price, 10, 50),
					isNull(priceHistoryTable.validTo)
				)
			);
			expect(result).toEqual({
				items: mockDevices,
				total: mockTotal[0].value,
				page: 1,
				pageSize: 10
			});
		});
	});

	describe('getBaseDeviceById', () => {
		it('should return device when found', async () => {
			const mockDevice = createMockDevice(1);
			mockDb.query.devicesTable.findFirst.mockResolvedValue(mockDevice);

			const device = await repository.getBaseDeviceById(1);

			expect(device).toEqual(mockDevice);
		});

		it('should return null when device not found', async () => {
			mockDb.query.devicesTable.findFirst.mockResolvedValue(undefined);

			const device = await repository.getBaseDeviceById(99);

			expect(device).toBeNull();
		});
	});

	describe('insertDevice', () => {
		it('should insert device and return id', async () => {
			const newDevice: DeviceData = {
				id: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: 'New Device',
				deviceType: 'switch',
				protocol: 'zigbee',
				images: []
			};
			mockDb
				.insert()
				.values()
				.returning.mockResolvedValue([{ insertedId: 1 }]);

			const result = await repository.insertDevice(newDevice);

			expect(result).toBe(1);
		});

		it('should throw error when insert fails', async () => {
			const newDevice: DeviceData = {
				id: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: 'New Device',
				deviceType: 'switch',
				protocol: 'zigbee',
				images: []
			};
			mockDb.insert().values().returning.mockResolvedValue([]);

			await expect(repository.insertDevice(newDevice)).rejects.toThrow('Failed to insert device');
		});
	});

	describe('updateDevice', () => {
		it('should update a device and return the updated device', async () => {
			const deviceId = 1;
			const updateData = { name: 'Updated Device Name' };
			const updatedDevice = { ...createMockDevice(deviceId), ...updateData };

			mockDb.update.mockReturnThis();
			mockDb.set.mockReturnThis();
			mockDb.where.mockReturnThis();
			mockDb.returning.mockResolvedValue([updatedDevice]);

			const result = await repository.updateDevice(deviceId, updateData);

			expect(mockDb.update).toHaveBeenCalledWith(devicesTable);
			expect(mockDb.set).toHaveBeenCalledWith({
				...updateData,
				updatedAt: expect.any(Object)
			});
			expect(mockDb.where).toHaveBeenCalledWith(eq(devicesTable.id, deviceId));
			expect(mockDb.returning).toHaveBeenCalled();
			expect(result).toEqual(updatedDevice);
		});

		it('should return null if device to update is not found', async () => {
			const deviceId = 99;
			const updateData = { name: 'Updated Device Name' };

			mockDb.update.mockReturnThis();
			mockDb.set.mockReturnThis();
			mockDb.where.mockReturnThis();
			mockDb.returning.mockResolvedValue([]);

			const result = await repository.updateDevice(deviceId, updateData);

			expect(result).toBeNull();
		});

		it('should handle database errors during update', async () => {
			const deviceId = 1;
			const updateData = { name: 'Updated Device Name' };

			mockDb.update.mockReturnThis();
			mockDb.set.mockReturnThis();
			mockDb.where.mockReturnThis();
			mockDb.returning.mockRejectedValueOnce(new Error('Database error'));

			await expect(repository.updateDevice(deviceId, updateData)).rejects.toThrow('Database error');
		});
	});

	describe('deleteDevice', () => {
		it('should delete a device and return true', async () => {
			const deviceId = 1;

			mockDb.delete().where.mockResolvedValue([{}]);

			const result = await repository.deleteDevice(deviceId);

			expect(mockDb.delete).toHaveBeenCalledWith(devicesTable);
			expect(mockDb.where).toHaveBeenCalledWith(eq(devicesTable.id, deviceId));
			expect(result).toBe(true);
		});

		it('should return false if device to delete is not found', async () => {
			const deviceId = 99;

			mockDb.delete().where.mockResolvedValue([]);

			const result = await repository.deleteDevice(deviceId);

			expect(result).toBe(false);
		});

		it('should handle database errors during delete', async () => {
			const deviceId = 1;

			mockDb.delete.mockReturnThis();
			mockDb.where.mockRejectedValueOnce(new Error('Database error'));

			await expect(repository.deleteDevice(deviceId)).rejects.toThrow('Database error');
		});
	});
});
