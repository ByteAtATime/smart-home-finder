<script lang="ts">
	import { goto } from '$app/navigation';
	import type { DeviceJson } from '$lib/server/devices/device';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';
	import DeviceTableFilters from './DeviceTableFilters.svelte';
	import DeviceTableGrid from './DeviceTableGrid.svelte';
	import LoadingOverlay from './LoadingOverlay.svelte';

	type DeviceTableProps = {
		devices: DeviceJson[];
		total: number;
		page: number;
		pageSize: number;
		absolutePriceRange: [number, number];
		propertiesByDeviceType: Record<string, PropertyJson[]>;
		availableDeviceTypes: DeviceType[];
	};

	let {
		devices,
		total,
		page,
		pageSize,
		absolutePriceRange: databasePriceRange,
		propertiesByDeviceType,
		availableDeviceTypes
	}: DeviceTableProps = $props();

	function handleFiltersChange(filters: {
		protocols: string[];
		deviceTypes: string[];
		priceRange: [number, number];
		propertyFilters: Array<{
			propertyId: string;
			deviceType: DeviceType;
			bounds?: [number, number];
			booleanValue?: boolean;
		}>;
		searchQuery: string;
	}) {
		const searchParams = new URLSearchParams();

		if (page !== 1) {
			searchParams.set('page', page.toString());
		}
		if (pageSize !== 10) {
			searchParams.set('pageSize', pageSize.toString());
		}

		if (filters.protocols.length > 0) {
			searchParams.set('protocol', filters.protocols.join(','));
		}
		if (filters.deviceTypes.length > 0) {
			searchParams.set('deviceType', filters.deviceTypes.join(','));
		}
		if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== Math.ceil(databasePriceRange[1])) {
			searchParams.set('minPrice', filters.priceRange[0].toString());
			searchParams.set('maxPrice', filters.priceRange[1].toString());
		}
		if (filters.searchQuery) {
			searchParams.set('search', filters.searchQuery);
		}

		const nonDefaultFilters = filters.propertyFilters.filter((filter) => {
			const property = propertiesByDeviceType[filter.deviceType]?.find(
				(p) => p.id === filter.propertyId
			);
			if (!property) return false;

			if (filter.bounds) {
				const defaultMin = property.minValue ?? 0;
				const defaultMax = property.maxValue ?? 100;
				return filter.bounds[0] !== defaultMin || filter.bounds[1] !== defaultMax;
			}

			if (filter.booleanValue !== undefined) {
				return true; // Always include boolean filters when they are set
			}

			return false;
		});

		if (nonDefaultFilters.length > 0) {
			searchParams.set(
				'propertyFilters',
				nonDefaultFilters
					.map((filter) => {
						if (filter.bounds) {
							return `${filter.propertyId}:${filter.deviceType}:${filter.bounds[0]}-${filter.bounds[1]}`;
						}
						if (filter.booleanValue !== undefined) {
							return `${filter.propertyId}:${filter.deviceType}:boolean-${filter.booleanValue}`;
						}
						return '';
					})
					.filter(Boolean)
					.join(',')
			);
		}

		if (searchParams.toString()) {
			goto(`?${searchParams.toString()}`, { keepFocus: true });
		}
	}

	function handlePageChange(newPage: number) {
		page = newPage;
	}
</script>

<div class="relative">
	<div class="flex flex-col items-start gap-8 p-4 lg:flex-row xl:gap-12">
		<DeviceTableFilters
			{propertiesByDeviceType}
			{availableDeviceTypes}
			maxPrice={Math.ceil(databasePriceRange[1])}
			onFiltersChange={handleFiltersChange}
		/>

		<DeviceTableGrid {devices} {total} {page} {pageSize} onPageChange={handlePageChange} />
	</div>

	<LoadingOverlay />
</div>
