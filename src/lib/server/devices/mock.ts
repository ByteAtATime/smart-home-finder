import { vi } from 'vitest';
import type { IDeviceRepository } from './types';

export class MockDeviceRepository implements IDeviceRepository {
	getAllDevices = vi.fn();
	addDeviceProperty = vi.fn();
	getDeviceProperties = vi.fn();
	getDeviceById = vi.fn();
	insertDevice = vi.fn();
}
