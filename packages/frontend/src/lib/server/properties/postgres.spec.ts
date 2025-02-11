import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresPropertyRepository } from './postgres';
import { Property } from './property';
import type { PropertyData } from '@smart-home-finder/common/types';
import { and, eq } from 'drizzle-orm';
import { devicePropertiesTable } from '@smart-home-finder/common/schema';

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
	limit: vi.fn().mockReturnThis(),
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
		const newProperty = {
			id: 'new-property',
			name: 'New Property',
			type: 'string',
			unit: null,
			description: null,
			minValue: null,
			maxValue: null,
			createdAt: new Date(),
			updatedAt: new Date()
		} satisfies PropertyData;
		const returnedProperty = { id: 'new-property' }; // Simplified for mocking
		mockDb.insert().values().returning.mockResolvedValue([returnedProperty]);

		const result = await repository.insertProperty(new Property(newProperty, repository));

		expect(mockDb.insert).toHaveBeenCalled();
		expect(mockDb.values).toHaveBeenCalledWith({
			id: newProperty.id,
			name: newProperty.name,
			type: newProperty.type,
			unit: newProperty.unit,
			description: newProperty.description,
			minValue: newProperty.minValue,
			maxValue: newProperty.maxValue
		});
		expect(mockDb.returning).toHaveBeenCalled();
		expect(result).toBe(returnedProperty.id);
	});

	it('should handle database errors during insert', async () => {
		const newProperty = {
			id: 'new-property',
			name: 'New Property',
			type: 'string',
			unit: null,
			description: null,
			minValue: null,
			maxValue: null,
			createdAt: new Date(),
			updatedAt: new Date()
		} satisfies PropertyData;
		mockDb.insert().values().returning.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.insertProperty(new Property(newProperty, repository))).rejects.toThrow(
			'Database error'
		);
	});

	it('should get all properties', async () => {
		const mockProperties = [
			{
				id: 'property1',
				name: 'Property 1',
				type: 'int',
				unit: 'unit',
				description: 'Description 1',
				minValue: null,
				maxValue: null,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: 'property2',
				name: 'Property 2',
				type: 'string',
				unit: null,
				description: null,
				minValue: null,
				maxValue: null,
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

	it('should handle database errors during get all properties', async () => {
		mockDb.query.propertiesTable.findMany.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.getAllProperties()).rejects.toThrow('Database error');
	});

	it('should get property by id', async () => {
		const propertyId = 'property1';
		const mockProperty = {
			id: propertyId,
			name: 'Property 1',
			type: 'int',
			unit: 'unit',
			description: 'Description 1',
			minValue: null,
			maxValue: null,
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

	it('should handle database errors during get property by id', async () => {
		const propertyId = 'property1';
		mockDb.select().from().where().execute.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.getPropertyById(propertyId)).rejects.toThrow('Database error');
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
			minValue: null,
			maxValue: null,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		mockDb.update().set().where().returning.mockResolvedValue([updatedProperty]);

		const result = await repository.updateProperty(propertyId, updateData);

		expect(mockDb.update).toHaveBeenCalled();
		expect(mockDb.set).toHaveBeenCalled();
		expect(mockDb.where).toHaveBeenCalled();
		expect(mockDb.returning).toHaveBeenCalled();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(result).toEqual(new Property(updatedProperty as any, repository));
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

	it('should handle database errors during update', async () => {
		const propertyId = 'property1';
		const updateData = { name: 'Updated Property' };
		mockDb.update().set().where().returning.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.updateProperty(propertyId, updateData)).rejects.toThrow(
			'Database error'
		);
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

	it('should handle database errors during delete', async () => {
		const propertyId = 'property1';
		mockDb.delete.mockReturnThis();
		mockDb.where.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.deleteProperty(propertyId)).rejects.toThrow('Database error');
	});

	it('should get property value for a device', async () => {
		const propertyId = 'property1';
		const deviceId = 1;
		const mockValue = { intValue: 123 };
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.limit.mockReturnThis();
		mockDb.execute.mockResolvedValue([mockValue]);

		const result = await repository.getPropertyValueForDevice(propertyId, deviceId);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(devicePropertiesTable);
		expect(mockDb.where).toHaveBeenCalledWith(
			and(
				eq(devicePropertiesTable.propertyId, propertyId),
				eq(devicePropertiesTable.deviceId, deviceId)
			)
		);
		expect(mockDb.limit).toHaveBeenCalledWith(1);
		expect(result).toBe(mockValue.intValue);
	});

	it('should return null if property value for a device is not found', async () => {
		const propertyId = 'property1';
		const deviceId = 1;
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.limit.mockReturnThis();
		mockDb.execute.mockResolvedValue([]);

		const result = await repository.getPropertyValueForDevice(propertyId, deviceId);

		expect(result).toBeNull();
	});

	it('should handle database errors during get property value for device', async () => {
		const propertyId = 'property1';
		const deviceId = 1;
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.limit.mockReturnThis();
		mockDb.execute.mockRejectedValueOnce(new Error('Database error'));

		await expect(repository.getPropertyValueForDevice(propertyId, deviceId)).rejects.toThrow(
			'Database error'
		);
	});
});
