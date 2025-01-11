import type { IAuthProvider } from './types';
import type { AuthObject } from '@clerk/backend';
import { db } from '$lib/server/db';
import { usersTable } from '@smart-home-finder/common/schema';
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
			await db.insert(usersTable).values({
				authProvider: 'clerk',
				authProviderId: clerkUserId
			});
			return null;
		}

		return ids[0].id;
	}

	async isAdmin() {
		const clerkUserId = this.auth.userId;

		if (!clerkUserId) {
			return false;
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.authProviderId, clerkUserId)
		});

		if (!user) {
			await db.insert(usersTable).values({
				authProvider: 'clerk',
				authProviderId: clerkUserId
			});
			return false;
		}

		return user.isAdmin ?? false;
	}
}
