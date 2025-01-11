import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usersTable } from '@smart-home-finder/common/schema';
import { count } from 'drizzle-orm';
import type { DeviceData } from '@smart-home-finder/common/types';
import { PostgresDeviceRepository } from '$lib/server/devices/postgres';
import { PostgresListingRepository } from '$lib/server/listings/postgres';

export const load: PageServerLoad = async () => {
	const deviceRepo = new PostgresDeviceRepository();
	const listingRepo = new PostgresListingRepository();

	if (deviceRepo instanceof Response || listingRepo instanceof Response) {
		return {
			metrics: {
				totalDevices: 0,
				totalUsers: 0,
				priceRange: { min: 0, max: 0 },
				devicesByType: {}
			}
		};
	}

	const devices = await deviceRepo.getAllDevices();
	const [minPrice, maxPrice] = await listingRepo.getPriceBounds();
	const userCount = await db.select({ count: count() }).from(usersTable);

	return {
		metrics: {
			totalDevices: devices.length,
			totalUsers: userCount[0].count,
			priceRange: {
				min: minPrice,
				max: maxPrice
			},
			devicesByType: devices.reduce((acc: Record<string, number>, device: DeviceData) => {
				acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
				return acc;
			}, {})
		}
	};
};
