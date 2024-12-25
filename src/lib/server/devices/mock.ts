import { vi } from 'vitest';
import type { IDeviceRepository } from './types';

export class MockDeviceRepository implements IDeviceRepository {
	getDeviceById = vi.fn();
	insertDevice = vi.fn();
}
