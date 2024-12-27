import { ClerkAuthProvider } from '../auth/clerk';
import type { IAuthProvider } from '../auth/types';
import { PostgresDeviceRepository } from '../devices/postgres';
import { PostgresPropertyRepository } from '../properties/postgres';
import { PostgresListingRepository } from '../listings/postgres';
import type { IDeviceRepository } from '../devices/types';
import type { IPropertyRepository } from '../properties/types';
import type { IListingRepository } from '../listings/types';
import type { MiddlewareHandler } from './types';
import { DeviceService } from '../devices/service';

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

export const withPropertyRepository = <
	TDeps extends { propertyRepository: IPropertyRepository }
>(): MiddlewareHandler<Omit<TDeps, 'propertyRepository'>> => {
	return async (deps, event, next) => {
		const propertyRepository = new PostgresPropertyRepository();
		return next({ ...deps, propertyRepository } as unknown as TDeps);
	};
};

export const withListingRepository = <
	TDeps extends { listingRepository: IListingRepository }
>(): MiddlewareHandler<Omit<TDeps, 'listingRepository'>> => {
	return async (deps, event, next) => {
		const listingRepository = new PostgresListingRepository();
		return next({ ...deps, listingRepository } as unknown as TDeps);
	};
};

export const withDeviceService = <
	TDeps extends { deviceService: DeviceService }
>(): MiddlewareHandler<Omit<TDeps, 'deviceService'>> => {
	return async (deps, event, next) => {
		const deviceRepository = new PostgresDeviceRepository();
		const propertyRepository = new PostgresPropertyRepository();
		const listingRepository = new PostgresListingRepository();
		const deviceService = new DeviceService(
			deviceRepository,
			propertyRepository,
			listingRepository
		);

		return next({ ...deps, deviceService } as unknown as TDeps);
	};
};
