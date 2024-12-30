import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresPropertyRepository } from './postgres';
import type { InsertProperty } from '@smart-home-finder/common/types';
import { Property } from './property';

const mockDb = vi.hoisted(() => ({
	query: {
		propertiesTable: {
			findMany: vi.fn()
		}
	},
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	returning: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	leftJoin: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
	execute: vi.fn().mockReturnThis()
}));

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

describe('PostgresPropertyRepository', () => {
	let repository: PostgresPropertyRepository;

	beforeEach(() => {
		vi.clearAllMocks();
		repository = new PostgresPropertyRepository();
	});

	it('should insert a new property', async () => {
		const newProperty: InsertProperty = {
			id: 'new-property',
			name: 'New Property',
			type: 'string',
			unit: null,
			description: null
		};
		const returnedProperty = { id: 'new-property' }; // Simplified for mocking
		mockDb.insert().values().returning.mockResolvedValue([returnedProperty]);

		const result = await repository.insertProperty(newProperty);

		expect(mockDb.insert).toHaveBeenCalled();
		expect(mockDb.values).toHaveBeenCalledWith(newProperty);
		expect(mockDb.returning).toHaveBeenCalled();
		expect(result).toBe(returnedProperty.id);
	});

	it('should get all properties', async () => {
		const mockProperties = [
			{
				id: 'property1',
				name: 'Property 1',
				type: 'int',
				unit: 'unit',
				description: 'Description 1',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: 'property2',
				name: 'Property 2',
				type: 'string',
				unit: null,
				description: null,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
		mockDb.query.propertiesTable.findMany.mockResolvedValue(mockProperties);

		const result = await repository.getAllProperties();

		expect(mockDb.query.propertiesTable.findMany).toHaveBeenCalled();
		expect(result).toEqual(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockProperties.map((p) => new Property(p as any, repository))
		);
	});

	it('should get property by id', async () => {
		const propertyId = 'property1';
		const mockProperty = {
			id: propertyId,
			name: 'Property 1',
			type: 'int',
			unit: 'unit',
			description: 'Description 1',
			createdAt: new Date(),
			updatedAt: new Date()
		};
		mockDb.select.mockReturnThis();
		mockDb.select().from.mockReturnThis();
		mockDb.select().from().where().execute.mockResolvedValue([mockProperty]);

		const result = await repository.getPropertyById(propertyId);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(result).toEqual(new Property(mockProperty as any, repository));
	});

	it('should return null if property by id not found', async () => {
		const propertyId = 'nonexistent';
		mockDb.select.mockReturnThis();
		mockDb.select().from.mockReturnThis();
		mockDb.select().from().where.mockReturnThis();
		mockDb.select().from().where().execute.mockResolvedValue([]);

		const result = await repository.getPropertyById(propertyId);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		expect(result).toBeNull();
	});

	it('should update a property', async () => {
		const propertyId = 'property1';
		const updateData = { name: 'Updated Property' };
		const updatedProperty = {
			id: propertyId,
			name: 'Updated Property',
			type: 'int',
			unit: 'unit',
			description: 'Description 1',
			createdAt: new Date(),
			updatedAt: new Date()
		};
		mockDb.update().set().where().returning.mockResolvedValue([updatedProperty]);

		const result = await repository.updateProperty(propertyId, updateData);

		expect(mockDb.update).toHaveBeenCalled();
		expect(mockDb.set).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		expect(mockDb.returning).toHaveBeenCalled();
		expect(result).toEqual(new Property(updatedProperty as any, repository)); // Cast to any for simplicity
	});

	it('should return null if property to update is not found', async () => {
		const propertyId = 'nonexistent';
		const updateData = { name: 'Updated Property' };
		mockDb.update().set().where().returning.mockResolvedValue([]);

		const result = await repository.updateProperty(propertyId, updateData);

		expect(mockDb.update).toHaveBeenCalled();
		expect(mockDb.set).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		expect(mockDb.returning).toHaveBeenCalled();
		expect(result).toBeNull();
	});

	it('should delete a property', async () => {
		const propertyId = 'property1';
		mockDb.delete().where.mockResolvedValue([{}]);

		const result = await repository.deleteProperty(propertyId);

		expect(mockDb.delete).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should return false if property to delete is not found', async () => {
		const propertyId = 'nonexistent';
		mockDb.delete().where.mockResolvedValue([]);

		const result = await repository.deleteProperty(propertyId);

		expect(mockDb.delete).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		expect(result).toBe(false);
	});
});
