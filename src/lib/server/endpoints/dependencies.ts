import type { IAuthProvider } from '$lib/server/auth/types';
import { ClerkAuthProvider } from '$lib/server/auth/clerk';
import type { MiddlewareHandler } from './types';
import type { IDeviceRepository } from '$lib/server/devices/types';
import { PostgresDeviceRepository } from '$lib/server/devices/postgres';

export const withAuthProvider = <TDeps extends { auth: IAuthProvider }>(): MiddlewareHandler<
	Omit<TDeps, 'auth'>
> => {
	return async (deps, event, next) => {
		const auth = new ClerkAuthProvider(event.locals.auth);
		return next({ ...deps, auth } as unknown as TDeps, event);
	};
};

export const withDeviceRepository = <
	TDeps extends { deviceRepository: IDeviceRepository }
>(): MiddlewareHandler<Omit<TDeps, 'deviceRepository'>> => {
	return async (deps, event, next) => {
		const deviceRepository = new PostgresDeviceRepository();
		return next({ ...deps, deviceRepository } as unknown as TDeps, event);
	};
};
