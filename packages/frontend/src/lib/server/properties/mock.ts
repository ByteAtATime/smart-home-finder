import { vi } from 'vitest';
import type { IPropertyRepository } from './types';

export class MockPropertyRepository implements IPropertyRepository {
	insertProperty = vi.fn();
	getPropertiesForDevice = vi.fn();
	getAllProperties = vi.fn();
	updateProperty = vi.fn();
	deleteProperty = vi.fn();
}
