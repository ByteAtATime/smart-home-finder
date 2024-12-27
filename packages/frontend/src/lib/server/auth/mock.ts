import { vi } from 'vitest';
import type { IAuthProvider } from './types';

export class MockAuthProvider implements IAuthProvider {
	isAuthenticated = vi.fn();
	getUserId = vi.fn();
	isAdmin = vi.fn();

	public mockSignedIn() {
		this.isAuthenticated.mockResolvedValue(true);
		this.getUserId.mockResolvedValue('1');
		this.isAdmin.mockResolvedValue(false);

		return this;
	}

	public mockSignedOut() {
		this.isAuthenticated.mockResolvedValue(false);
		this.getUserId.mockResolvedValue(null);
		this.isAdmin.mockResolvedValue(false);

		return this;
	}

	public mockAdmin() {
		this.mockSignedIn();
		this.isAdmin.mockResolvedValue(true);

		return this;
	}
}
