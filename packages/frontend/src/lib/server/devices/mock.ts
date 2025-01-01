import { vi } from 'vitest';
import type { IDeviceRepository } from './types';

export class MockDeviceRepository implements IDeviceRepository {
	getAllDevices = vi.fn();
	getBaseDeviceById = vi.fn();
	insertDevice = vi.fn();
	getDeviceWithProperties = vi.fn();
	getAllDevicesPaginated = vi.fn();
	getDeviceListings = vi.fn();
	getDevicePrices = vi.fn();
	updateDevice = vi.fn();
	deleteDevice = vi.fn();
}
