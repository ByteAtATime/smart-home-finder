import { vi } from 'vitest';
import type { IDeviceRepository } from './types';

export class MockDeviceRepository implements IDeviceRepository {
	getAllDevices = vi.fn();
	getDeviceById = vi.fn();
	insertDevice = vi.fn();
}
