// src/lib/server/properties/property.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Property } from './property';
import type { IPropertyRepository } from './types';
import type { PropertyData } from '@smart-home-finder/common/types';
import { MockPropertyRepository } from './mock';

const mockPropertyData: PropertyData = {
	id: 'prop1',
	name: 'Test Property',
	type: 'string',
	unit: 'Test Unit',
	description: 'Test Description',
	minValue: 0,
	maxValue: 240,
	createdAt: new Date('2023-10-27T08:00:00Z'),
	updatedAt: new Date('2023-10-27T09:00:00Z')
};

describe('Property', () => {
	let property: Property;

	const mockRepository = new MockPropertyRepository();

	beforeEach(() => {
		vi.clearAllMocks();
		property = new Property(mockPropertyData, mockRepository as unknown as IPropertyRepository);
	});

	it('should initialize correctly', () => {
		expect(property.id).toBe(mockPropertyData.id);
		expect(property.name).toBe(mockPropertyData.name);
		expect(property.type).toBe(mockPropertyData.type);
		expect(property.unit).toBe(mockPropertyData.unit);
		expect(property.description).toBe(mockPropertyData.description);
		expect(property.createdAt).toBe(mockPropertyData.createdAt);
		expect(property.updatedAt).toBe(mockPropertyData.updatedAt);
	});

	it('should get value for device and cache it', async () => {
		const deviceId = 1;
		const mockValue = 'Test Value';
		mockRepository.getPropertyValueForDevice.mockResolvedValue(mockValue);

		const value1 = await property.getValueForDevice(deviceId);
		const value2 = await property.getValueForDevice(deviceId);

		expect(mockRepository.getPropertyValueForDevice).toHaveBeenCalledTimes(1);
		expect(mockRepository.getPropertyValueForDevice).toHaveBeenCalledWith(
			mockPropertyData.id,
			deviceId
		);
		expect(value1).toBe(mockValue);
		expect(value2).toBe(mockValue);
	});

	it('should return null if no value is found for device', async () => {
		const deviceId = 1;
		mockRepository.getPropertyValueForDevice.mockResolvedValue(null);

		const value = await property.getValueForDevice(deviceId);

		expect(mockRepository.getPropertyValueForDevice).toHaveBeenCalledTimes(1);
		expect(value).toBeNull();
	});

	it('should convert to JSON correctly', async () => {
		const deviceId = 1;
		const mockValue = 'Test Value';
		mockRepository.getPropertyValueForDevice.mockResolvedValue(mockValue);

		const json = await property.toJson(deviceId);

		expect(json).toEqual({
			...mockPropertyData,
			value: mockValue
		});
	});

	it('should convert to JSON without device ID', async () => {
		const json = await property.toJson();

		expect(json).toEqual({
			...mockPropertyData,
			value: null
		});
	});

	it('should handle different property types', async () => {
		const intProperty = new Property(
			{ ...mockPropertyData, id: 'intProp', type: 'int' },
			mockRepository as unknown as IPropertyRepository
		);
		const floatProperty = new Property(
			{ ...mockPropertyData, id: 'floatProp', type: 'float' },
			mockRepository as unknown as IPropertyRepository
		);
		const booleanProperty = new Property(
			{ ...mockPropertyData, id: 'boolProp', type: 'boolean' },
			mockRepository as unknown as IPropertyRepository
		);

		mockRepository.getPropertyValueForDevice.mockResolvedValueOnce(123);
		mockRepository.getPropertyValueForDevice.mockResolvedValueOnce(3.14);
		mockRepository.getPropertyValueForDevice.mockResolvedValueOnce(true);

		expect((await intProperty.toJson(1)).value).toBe(123);
		expect((await floatProperty.toJson(1)).value).toBe(3.14);
		expect((await booleanProperty.toJson(1)).value).toBe(true);
	});
});
