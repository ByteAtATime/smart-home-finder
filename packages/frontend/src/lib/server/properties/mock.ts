import { vi } from 'vitest';
import type { IPropertyRepository } from './types';

export class MockPropertyRepository implements IPropertyRepository {
	insertProperty = vi.fn();
	getPropertiesForDevice = vi.fn();
}
