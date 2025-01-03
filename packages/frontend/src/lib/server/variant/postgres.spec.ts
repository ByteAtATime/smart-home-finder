import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PostgresVariantRepository } from './postgres';
import { Variant, type VariantJson } from './variant';
import {
	deviceVariantsTable,
	variantOptionsTable,
	variantsTable
} from '@smart-home-finder/common/schema';
import { eq } from 'drizzle-orm';

const mockVariants: VariantJson[] = [
	{
		id: 1,
		name: 'Color',
		createdAt: new Date('2023-10-26T10:00:00Z'),
		updatedAt: new Date('2023-10-26T11:00:00Z'),
		options: []
	},
	{
		id: 2,
		name: 'Size',
		createdAt: new Date('2023-10-27T10:00:00Z'),
		updatedAt: new Date('2023-10-27T11:00:00Z'),
		options: []
	}
];

const mockDb = vi.hoisted(() => ({
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	returning: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	innerJoin: vi.fn().mockReturnThis(),
	groupBy: vi.fn().mockReturnThis(),
	execute: vi.fn()
}));

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

describe('PostgresVariantRepository', () => {
	let repository: PostgresVariantRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new PostgresVariantRepository();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should insert a new variant', async () => {
		const mockVariant = new Variant(mockVariants[0], repository);
		mockDb.returning.mockResolvedValueOnce([mockVariants[0]]);

		const insertedId = await repository.insertVariant(mockVariant);

		expect(mockDb.insert).toHaveBeenCalledWith(variantsTable);
		expect(mockDb.values).toHaveBeenCalledWith({
			name: mockVariant.name
		});
		expect(mockDb.returning).toHaveBeenCalled();
		expect(insertedId).toBe(mockVariants[0].id);
	});

	it('should handle database errors during insert', async () => {
		const mockVariant = new Variant(mockVariants[0], repository);
		mockDb.insert.mockReturnThis();
		mockDb.values.mockReturnThis();
		mockDb.returning.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.insertVariant(mockVariant)).rejects.toThrow('Database error');
	});

	it('should get a variant by ID', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockResolvedValueOnce([mockVariants[0]]);

		const variant = await repository.getVariantById(mockVariants[0].id);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(variantsTable);
		expect(mockDb.where).toHaveBeenCalledWith(eq(variantsTable.id, mockVariants[0].id));
		expect(variant).toEqual(new Variant(mockVariants[0], repository));
	});

	it('should return null if variant by ID is not found', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockResolvedValueOnce([]);

		const variant = await repository.getVariantById(999);

		expect(mockDb.select).toHaveBeenCalled();
		expect(variant).toBeNull();
	});

	it('should handle database errors during get by ID', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.select().from().where.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.getVariantById(1)).rejects.toThrow('Database error');
	});

	it('should get variants for a device', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockResolvedValue([mockVariants[0], mockVariants[1]]);

		const variants = await repository.getVariantsForDevice(1);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(variantsTable);
		expect(mockDb.where).toHaveBeenCalled();
		expect(variants.length).toBe(2);
		expect(variants[0]).toBeInstanceOf(Variant);
		expect(variants[1]).toBeInstanceOf(Variant);
	});

	it('should handle database errors during get variants for device', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.select().from().where.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.getVariantsForDevice(1)).resolves.toEqual([]);
	});

	it('should get variant options for a variant', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.innerJoin.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.groupBy.mockResolvedValueOnce([
			{
				id: 1,
				variantId: 1,
				value: 'Blue',
				createdAt: new Date(),
				updatedAt: new Date(),
				deviceId: 1
			},
			{
				id: 2,
				variantId: 1,
				value: 'Red',
				createdAt: new Date(),
				updatedAt: new Date(),
				deviceId: 2
			}
		]);

		const options = await repository.getVariantOptions(1);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(variantOptionsTable);
		expect(mockDb.innerJoin).toHaveBeenCalledWith(
			deviceVariantsTable,
			eq(variantOptionsTable.id, deviceVariantsTable.variantOptionId)
		);
		expect(mockDb.where).toHaveBeenCalledWith(eq(variantOptionsTable.variantId, 1));
		expect(mockDb.groupBy).toHaveBeenCalled();
		expect(options.length).toBe(2);
		expect(options[0].value).toBe('Blue');
		expect(options[1].value).toBe('Red');
	});

	it('should handle database errors during get variant options', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.innerJoin.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb
			.select()
			.from()
			.innerJoin()
			.where()
			.groupBy.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.getVariantOptions(1)).rejects.toThrow('Database error');
	});

	it('should prioritize variant options from a specific device', async () => {
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.innerJoin.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.groupBy.mockResolvedValueOnce([
			{
				id: 1,
				variantId: 1,
				value: 'Blue',
				createdAt: new Date(),
				updatedAt: new Date(),
				deviceId: 1 // Prioritized device ID
			},
			{
				id: 2,
				variantId: 1,
				value: 'Red',
				createdAt: new Date(),
				updatedAt: new Date(),
				deviceId: 2
			}
		]);

		const options = await repository.getVariantOptions(1, 1);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(variantOptionsTable);
		expect(mockDb.innerJoin).toHaveBeenCalledWith(
			deviceVariantsTable,
			eq(variantOptionsTable.id, deviceVariantsTable.variantOptionId)
		);
		expect(mockDb.where).toHaveBeenCalledWith(eq(variantOptionsTable.variantId, 1));
		expect(mockDb.groupBy).toHaveBeenCalled();
		expect(options.length).toBe(2);
		expect(options[0].deviceId).toBe(1);
		expect(options[1].deviceId).toBe(2);
	});
});
