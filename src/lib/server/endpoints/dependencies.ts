import type { IAuthProvider } from '$lib/server/auth/types';
import { ClerkAuthProvider } from '$lib/server/auth/clerk';
import type { MiddlewareHandler } from './types';

export const withAuthProvider = <TDeps extends { auth: IAuthProvider }>(): MiddlewareHandler<
	Omit<TDeps, 'auth'>
> => {
	return async (deps, event, next) => {
		const auth = new ClerkAuthProvider(event.locals.auth);
		return next({ ...deps, auth } as unknown as TDeps, event);
	};
};
