import type { IAuthProvider } from './types';
import type { AuthObject } from '@clerk/backend';
import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export class ClerkAuthProvider implements IAuthProvider {
	constructor(private auth: AuthObject) {}

	isAuthenticated() {
		return !!this.auth.userId;
	}

	async getUserId() {
		const clerkUserId = this.auth.userId;

		if (!clerkUserId) {
			return null;
		}

		const ids = await db
			.select({ id: usersTable.id })
			.from(usersTable)
			.where(and(eq(usersTable.authProvider, 'clerk'), eq(usersTable.authProviderId, clerkUserId)))
			.execute();

		if (ids.length === 0) {
			return null;
		}

		return ids[0].id;
	}
}
