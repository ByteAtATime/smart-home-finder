import { vi } from 'vitest';
import type { IPropertyRepository } from './types';

export class MockPropertyRepository implements IPropertyRepository {
	insertProperty = vi.fn();
	updateProperty = vi.fn();
	deleteProperty = vi.fn();
	getAllProperties = vi.fn();
	getPropertyById = vi.fn();
	getPropertyValueForDevice = vi.fn();
}
