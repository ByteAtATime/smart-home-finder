import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresDeviceRepository } from './postgres';
import type { DeviceData } from '@smart-home-finder/common/types';

const createMockDevice = (id: number) => ({
	id,
	name: `Device ${id}`,
	images: [],
	deviceType: 'switch',
	protocol: 'zigbee',
	createdAt: new Date(),
	updatedAt: new Date()
});

const createMockVariant = (variantId: number, optionId: number, deviceId: number) => ({
	variantId,
	variantName: `Variant ${variantId}`,
	variantCreatedAt: new Date(),
	variantUpdatedAt: new Date(),
	optionId,
	optionDeviceId: deviceId,
	optionValue: `Option ${optionId}`,
	optionCreatedAt: new Date(),
	optionUpdatedAt: new Date()
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
		it('should return paginated devices with total count', async () => {
			const mockDevices = [createMockDevice(1)];
			const mockTotal = [{ value: 1 }];

			mockDb.select().from().offset().limit.mockResolvedValue(mockDevices);
			mockDb.select().from().execute.mockResolvedValue(mockTotal);

			const result = await repository.getAllDevicesPaginated(1, 10);

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

	describe('getVariantsForDevice', () => {
		it('should return variants with options', async () => {
			const mockVariants = [
				createMockVariant(1, 1, 1),
				createMockVariant(1, 2, 2),
				createMockVariant(2, 3, 1)
			];

			mockDb.select.mockReturnThis();
			mockDb.from.mockReturnThis();
			mockDb.innerJoin.mockReturnThis();
			mockDb.where.mockReturnThis();
			mockDb.groupBy.mockResolvedValue(mockVariants);

			const result = await repository.getVariantsForDevice(1);

			expect(result).toMatchObject([
				{
					id: 1,
					name: 'Variant 1',
					options: [
						{ id: 1, value: 'Option 1', deviceId: 1 },
						{ id: 2, value: 'Option 2', deviceId: 2 }
					]
				},
				{
					id: 2,
					name: 'Variant 2',
					options: [{ id: 3, value: 'Option 3', deviceId: 1 }]
				}
			]);
		});

		it('should return empty array when no variants found', async () => {
			mockDb.select.mockReturnThis();
			mockDb.from.mockReturnThis();
			mockDb.innerJoin.mockReturnThis();
			mockDb.where.mockReturnThis();
			mockDb.groupBy.mockResolvedValue([]);

			const result = await repository.getVariantsForDevice(1);

			expect(result).toEqual([]);
		});
	});
});
