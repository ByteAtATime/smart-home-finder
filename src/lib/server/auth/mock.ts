import { vi } from 'vitest';
import type { IAuthProvider } from './types';

export class MockAuthProvider implements IAuthProvider {
	isAuthenticated = vi.fn();
	getUserId = vi.fn();
	isAdmin = vi.fn();
}
