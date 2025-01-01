import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Variant, type VariantJson } from './variant';
import type { IVariantRepository, VariantOption } from './types';

const mockVariantData: VariantJson = {
	id: 1,
	name: 'Color',
	createdAt: new Date('2023-10-26T10:00:00Z'),
	updatedAt: new Date('2023-10-26T11:00:00Z'),
	options: []
};

const mockVariantOptions: VariantOption[] = [
	{
		id: 1,
		variantId: 1,
		value: 'Red',
		deviceId: 1,
		createdAt: new Date('2023-10-26T12:00:00Z'),
		updatedAt: new Date('2023-10-26T13:00:00Z')
	},
	{
		id: 2,
		variantId: 1,
		value: 'Blue',
		deviceId: 2,
		createdAt: new Date('2023-10-26T14:00:00Z'),
		updatedAt: new Date('2023-10-26T15:00:00Z')
	}
];

const mockRepository: IVariantRepository = {
	insertVariant: vi.fn(),
	getVariantById: vi.fn(),
	getVariantsForDevice: vi.fn(),
	getVariantOptions: vi.fn()
};

describe('Variant', () => {
	let variant: Variant;

	beforeEach(() => {
		vi.clearAllMocks();
		variant = new Variant(mockVariantData, mockRepository);
	});

	it('should initialize correctly', () => {
		expect(variant.id).toBe(mockVariantData.id);
		expect(variant.name).toBe(mockVariantData.name);
		expect(variant.createdAt).toBe(mockVariantData.createdAt);
		expect(variant.updatedAt).toBe(mockVariantData.updatedAt);
	});

	it('should get options and cache them', async () => {
		vi.mocked(mockRepository.getVariantOptions).mockResolvedValue(mockVariantOptions);

		const options1 = await variant.getOptions();
		const options2 = await variant.getOptions();

		expect(mockRepository.getVariantOptions).toHaveBeenCalledTimes(1);
		expect(options1).toEqual(mockVariantOptions);
		expect(options2).toEqual(mockVariantOptions);
	});

	it('should get options with prioritized device ID and cache them', async () => {
		vi.mocked(mockRepository.getVariantOptions).mockResolvedValue([mockVariantOptions[1]]);

		const options1 = await variant.getOptions(2);
		const options2 = await variant.getOptions(2);

		expect(mockRepository.getVariantOptions).toHaveBeenCalledTimes(1);
		expect(mockRepository.getVariantOptions).toHaveBeenCalledWith(1, 2);
		expect(options1).toEqual([mockVariantOptions[1]]);
		expect(options2).toEqual([mockVariantOptions[1]]);
	});

	it('should convert to JSON correctly', async () => {
		vi.mocked(mockRepository.getVariantOptions).mockResolvedValue(mockVariantOptions);

		const json = await variant.toJson();

		expect(json).toEqual({
			...mockVariantData,
			options: mockVariantOptions
		});
	});

	it('should convert to JSON with prioritized device ID', async () => {
		vi.mocked(mockRepository.getVariantOptions).mockResolvedValue([mockVariantOptions[1]]);

		const json = await variant.toJson(2);

		expect(json).toEqual({
			...mockVariantData,
			options: [mockVariantOptions[1]]
		});
	});
});
