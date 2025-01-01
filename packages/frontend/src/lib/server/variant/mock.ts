import type { IVariantRepository } from './types';
import { vi } from 'vitest';

export class MockVariantRepository implements IVariantRepository {
	insertVariant = vi.fn();
	getVariantById = vi.fn();
	getVariantsForDevice = vi.fn();
	getVariantOptions = vi.fn();
}
