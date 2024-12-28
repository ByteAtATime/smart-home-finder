import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresPropertyRepository } from './postgres';
import { db } from '$lib/server/db';
import type { InsertProperty } from '@smart-home-finder/common/types';

vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		leftJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis()
	}
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
		db.insert().values().returning.mockResolvedValue([returnedProperty]);

		const result = await repository.insertProperty(newProperty);

		expect(db.insert).toHaveBeenCalled();
		expect(db.values).toHaveBeenCalledWith(newProperty);
		expect(db.returning).toHaveBeenCalled();
		expect(result).toBe(returnedProperty.id);
	});

	it('should get properties for a device', async () => {
		const deviceId = 1;
		const mockProperties = [
			{
				properties: {
					id: 'property1',
					name: 'Property 1',
					type: 'int',
					unit: 'unit',
					description: 'Description 1'
				},
				device_properties: {
					propertyId: 'property1',
					intValue: 123,
					floatValue: null,
					stringValue: null,
					booleanValue: null
				}
			},
			{
				properties: {
					id: 'property2',
					name: 'Property 2',
					type: 'string',
					unit: null,
					description: null
				},
				device_properties: {
					propertyId: 'property2',
					intValue: null,
					floatValue: null,
					stringValue: 'value',
					booleanValue: null
				}
			}
		];
		db.select().from().leftJoin().where.mockResolvedValue(mockProperties);

		const result = await repository.getPropertiesForDevice(deviceId);

		expect(db.select).toHaveBeenCalled();
		expect(db.where).toHaveBeenCalled();
		expect(result).toEqual({
			property1: {
				id: 'property1',
				name: 'Property 1',
				type: 'int',
				unit: 'unit',
				description: 'Description 1',
				value: 123
			},
			property2: {
				id: 'property2',
				name: 'Property 2',
				type: 'string',
				unit: null,
				description: null,
				value: 'value'
			}
		});
	});

	it('should handle properties with null values', async () => {
		const deviceId = 1;
		const mockProperties = [
			{
				properties: {
					id: 'property1',
					name: 'Property 1',
					type: 'int',
					unit: 'unit',
					description: 'Description 1'
				},
				device_properties: {
					propertyId: 'property1',
					intValue: null,
					floatValue: null,
					stringValue: null,
					booleanValue: null
				}
			}
		];
		db.select().from().leftJoin().where.mockResolvedValue(mockProperties);

		const result = await repository.getPropertiesForDevice(deviceId);

		expect(result).toEqual({});
	});

	it('should handle properties with boolean type', async () => {
		const deviceId = 1;
		const mockProperties = [
			{
				properties: {
					id: 'property3',
					name: 'Property 3',
					type: 'boolean',
					unit: null,
					description: null
				},
				device_properties: {
					propertyId: 'property3',
					intValue: null,
					floatValue: null,
					stringValue: null,
					booleanValue: true
				}
			}
		];
		db.select().from().leftJoin().where.mockResolvedValue(mockProperties);

		const result = await repository.getPropertiesForDevice(deviceId);

		expect(result).toEqual({
			property3: {
				id: 'property3',
				name: 'Property 3',
				type: 'boolean',
				unit: null,
				description: null,
				value: true
			}
		});
	});

	it('should return empty object if no properties found', async () => {
		const deviceId = 1;
		db.select().from().leftJoin().where.mockResolvedValue([]);

		const result = await repository.getPropertiesForDevice(deviceId);

		expect(result).toEqual({});
	});
});
