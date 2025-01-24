import type { PageLoad } from './$types';
import type { DeviceJson } from '$lib/server/devices/device';
import type { PropertyJson } from '$lib/server/properties/property';
import type { DeviceType } from '@smart-home-finder/common/types';

export const load: PageLoad = async ({ fetch, url }) => {
	const searchParams = new URLSearchParams();
	searchParams.set('page', url.searchParams.get('page') ?? '1');
	searchParams.set('pageSize', url.searchParams.get('pageSize') ?? '10');

	const deviceType = url.searchParams.get('deviceType');
	if (deviceType) {
		searchParams.set('deviceType', deviceType);
	}

	const protocol = url.searchParams.get('protocol');
	if (protocol) {
		searchParams.set('protocol', protocol);
	}

	const minPrice = url.searchParams.get('minPrice');
	if (minPrice) {
		searchParams.set('minPrice', minPrice);
	}

	const maxPrice = url.searchParams.get('maxPrice');
	if (maxPrice) {
		searchParams.set('maxPrice', maxPrice);
	}

	const propertyFilters = url.searchParams.get('propertyFilters');
	if (propertyFilters) {
		searchParams.set('propertyFilters', propertyFilters);
	}

	const search = url.searchParams.get('search');
	if (search) {
		searchParams.set('search', search);
	}

	const sortField = url.searchParams.get('sortField');
	if (sortField) {
		searchParams.set('sortField', sortField);
	}

	const sortDirection = url.searchParams.get('sortDirection');
	if (sortDirection) {
		searchParams.set('sortDirection', sortDirection);
	}

	return {
		streamed: {
			deviceData: (async () => {
				const response = await fetch(`/api/devices?${searchParams.toString()}`);
				const data = (await response.json()) as {
					success: boolean;
					total: number;
					pageSize: number;
					page: number;
					devices: DeviceJson[];
					priceBounds: [number, number];
					propertiesByDeviceType: Record<string, PropertyJson[]>;
					availableDeviceTypes: DeviceType[];
				};

				if (!data.success) {
					throw new Error('Failed to load devices', { cause: data });
				}

				return data;
			})()
		}
	};
};
