import { ClerkAuthProvider } from '../auth/clerk';
import type { IAuthProvider } from '../auth/types';
import { PostgresDeviceRepository } from '../devices/postgres';
import type { IDeviceRepository } from '../devices/types';
import type { MiddlewareHandler } from './types';

export const withAuthProvider = <TDeps extends { auth: IAuthProvider }>(): MiddlewareHandler<
	Omit<TDeps, 'auth'>
> => {
	return async (deps, event, next) => {
		const auth = new ClerkAuthProvider(event.locals.auth);
		return next({ ...deps, auth } as unknown as TDeps);
	};
};

export const withDeviceRepository = <
	TDeps extends { deviceRepository: IDeviceRepository }
>(): MiddlewareHandler<Omit<TDeps, 'deviceRepository'>> => {
	return async (deps, event, next) => {
		const deviceRepository = new PostgresDeviceRepository();
		return next({ ...deps, deviceRepository } as unknown as TDeps);
	};
};
