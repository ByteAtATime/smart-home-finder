import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClerkAuthProvider } from './clerk';
import type { AuthObject } from '@clerk/backend';

const mockDb = vi.hoisted(() => ({
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	execute: vi.fn(),
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	query: {
		usersTable: {
			findFirst: vi.fn()
		}
	}
}));

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

describe('ClerkAuthProvider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('isAuthenticated', () => {
		it('should return true if auth.userId is set', () => {
			const auth = { userId: 'user123' } as AuthObject;
			const provider = new ClerkAuthProvider(auth);
			expect(provider.isAuthenticated()).toBe(true);
		});

		it('should return false if auth.userId is null', () => {
			const auth = { userId: null } as AuthObject;
			const provider = new ClerkAuthProvider(auth);
			expect(provider.isAuthenticated()).toBe(false);
		});
	});

	describe('getUserId', () => {
		it('should return user ID if user exists in DB', async () => {
			const auth = { userId: 'clerkId1' } as AuthObject;
			const provider = new ClerkAuthProvider(auth);
			mockDb
				.select()
				.from()
				.where()
				.execute.mockResolvedValue([{ id: 'userId1' }]);

			const userId = await provider.getUserId();
			expect(userId).toBe('userId1');
		});

		it('should insert user and return null if user does not exist in DB', async () => {
			const auth = { userId: 'clerkId2' } as AuthObject;
			const provider = new ClerkAuthProvider(auth);
			mockDb.select().from().where().execute.mockResolvedValue([]);

			const userId = await provider.getUserId();
			expect(mockDb.insert).toHaveBeenCalled();
			expect(userId).toBeNull();
		});

		it('should return null if auth.userId is null', async () => {
			const auth = { userId: null } as AuthObject;
			const provider = new ClerkAuthProvider(auth);

			const userId = await provider.getUserId();
			expect(userId).toBeNull();
		});
	});

	describe('isAdmin', () => {
		it('should return true if user is admin', async () => {
			const auth = { userId: 'clerkId3' } as AuthObject;
			const provider = new ClerkAuthProvider(auth);
			mockDb.query.usersTable.findFirst.mockResolvedValue({ isAdmin: true });

			const isAdmin = await provider.isAdmin();
			expect(isAdmin).toBe(true);
		});

		it('should return false if user is not admin', async () => {
			const auth = { userId: 'clerkId4' } as AuthObject;
			const provider = new ClerkAuthProvider(auth);
			mockDb.query.usersTable.findFirst.mockResolvedValue({ isAdmin: false });

			const isAdmin = await provider.isAdmin();
			expect(isAdmin).toBe(false);
		});

		it('should return false if auth.userId is null', async () => {
			const auth = { userId: null } as AuthObject;
			const provider = new ClerkAuthProvider(auth);

			const isAdmin = await provider.isAdmin();
			expect(isAdmin).toBe(false);
		});
	});
});
