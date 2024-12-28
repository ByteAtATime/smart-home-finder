import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	withAuthProvider,
	withDeviceRepository,
	withPropertyRepository,
	withListingRepository,
	withDeviceService
} from './dependencies';
import { ClerkAuthProvider } from '../auth/clerk';
import { PostgresDeviceRepository } from '../devices/postgres';
import { PostgresPropertyRepository } from '../properties/postgres';
import { PostgresListingRepository } from '../listings/postgres';
import { DeviceService } from '../devices/service';
import type { RequestEvent } from '@sveltejs/kit';

vi.mock('../auth/clerk');
vi.mock('../devices/postgres');
vi.mock('../properties/postgres');
vi.mock('../listings/postgres');
vi.mock('../devices/service');

describe('Dependency Injection Middleware', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('withAuthProvider should inject ClerkAuthProvider', async () => {
		const mockAuth = {};
		const mockEvent = { locals: { auth: mockAuth } } as unknown as RequestEvent;
		const next = vi.fn();

		await withAuthProvider()({}, mockEvent, next);

		expect(ClerkAuthProvider).toHaveBeenCalledWith(mockAuth);
		expect(next).toHaveBeenCalledWith({ auth: expect.any(ClerkAuthProvider) });
	});

	it('withDeviceRepository should inject PostgresDeviceRepository', async () => {
		const next = vi.fn();

		await withDeviceRepository()({}, {} as RequestEvent, next);

		expect(PostgresDeviceRepository).toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith({
			deviceRepository: expect.any(PostgresDeviceRepository)
		});
	});

	it('withPropertyRepository should inject PostgresPropertyRepository', async () => {
		const next = vi.fn();

		await withPropertyRepository()({}, {} as RequestEvent, next);

		expect(PostgresPropertyRepository).toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith({
			propertyRepository: expect.any(PostgresPropertyRepository)
		});
	});

	it('withListingRepository should inject PostgresListingRepository', async () => {
		const next = vi.fn();

		await withListingRepository()({}, {} as RequestEvent, next);

		expect(PostgresListingRepository).toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith({
			listingRepository: expect.any(PostgresListingRepository)
		});
	});

	it('withDeviceService should inject DeviceService', async () => {
		const next = vi.fn();

		await withDeviceService()({}, {} as RequestEvent, next);

		expect(PostgresDeviceRepository).toHaveBeenCalled();
		expect(PostgresPropertyRepository).toHaveBeenCalled();
		expect(PostgresListingRepository).toHaveBeenCalled();
		expect(DeviceService).toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith({ deviceService: expect.any(DeviceService) });
	});
});
