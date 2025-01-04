<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import type { DeviceJson } from '$lib/server/devices/device';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import DeviceFilters from '../DeviceFilters.svelte';
	import DeviceList from './DeviceList.svelte';
	import Spinner from '../Spinner.svelte';

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

	let isLoading = $state(false);
	let spinnerPromise: Promise<unknown> | null = $state(null);

	let sliderPriceRange = $state<[number, number]>([0, databasePriceRange[1]]);
	let filterPriceRange = $state<[number, number]>(databasePriceRange);
	let priceDebounceTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(priceDebounceTimeout);
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		sliderPriceRange;
		priceDebounceTimeout = setTimeout(() => {
			filterPriceRange = [sliderPriceRange[0], sliderPriceRange[1]];
		}, 500);
	});

	let protocolFilter = $state(
		Object.fromEntries(
			Object.entries(PROTOCOL_DISPLAY_NAMES).map(([protocol]) => [protocol, false])
		)
	);
	let deviceTypeFilter = $state(
		Object.fromEntries(Object.entries(DEVICE_TYPES).map(([deviceType]) => [deviceType, false]))
	);

	type PropertyFilter = {
		propertyId: string;
		deviceType: keyof typeof DEVICE_TYPES;
		bounds: [number, number];
	};

	let propertyFilters = $state<PropertyFilter[]>([]);
	let sliderValues = $state<Record<string, [number, number]>>({});
	let propertyDebounceTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(propertyDebounceTimeout);
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		sliderValues;
		propertyDebounceTimeout = setTimeout(() => {
			propertyFilters = Object.entries(sliderValues).map(([key, bounds]) => {
				const [propertyId, deviceType] = key.split(':');
				return {
					propertyId,
					deviceType: deviceType as keyof typeof DEVICE_TYPES,
					bounds
				};
			});
		}, 500);
	});

	$effect(() => {
		isLoading = true;
		spinnerPromise = new Promise((resolve) => setTimeout(resolve, 125));

		const searchParams = new URLSearchParams();
		searchParams.set('page', page.toString());
		searchParams.set('pageSize', pageSize.toString());
		if (Object.values(protocolFilter).some((value) => value)) {
			searchParams.set(
				'protocol',
				Object.entries(protocolFilter)
					.filter(([_, value]) => value)
					.map(([protocol]) => protocol)
					.join(',')
			);
		}
		if (Object.values(deviceTypeFilter).some((value) => value)) {
			searchParams.set(
				'deviceType',
				Object.entries(deviceTypeFilter)
					.filter(([_, value]) => value)
					.map(([deviceType]) => deviceType)
					.join(',')
			);
		}
		if (filterPriceRange[0] !== 0 || filterPriceRange[1] !== databasePriceRange[1]) {
			searchParams.set('priceBounds', filterPriceRange.join(','));
		}
		if (propertyFilters.length > 0) {
			const nonDefaultFilters = propertyFilters.filter((filter) => {
				const property = propertiesByDeviceType[filter.deviceType]?.find(
					(p) => p.id === filter.propertyId
				);
				if (!property) return false;

				const defaultMin = property.minValue ?? 0;
				const defaultMax = property.maxValue ?? 100;

				return filter.bounds[0] !== defaultMin || filter.bounds[1] !== defaultMax;
			});

			if (nonDefaultFilters.length > 0) {
				searchParams.set(
					'propertyFilters',
					nonDefaultFilters
						.map(
							(filter) =>
								`${filter.propertyId}:${filter.deviceType}:${filter.bounds[0]}-${filter.bounds[1]}`
						)
						.join(',')
				);
			}
		}

		goto(`?${searchParams.toString()}`);
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- this makes it reactive
		[devices];

		isLoading = false;
		spinnerPromise = null;
	});
</script>

<div class="relative">
	<div class="flex flex-col items-start gap-8 p-4 lg:flex-row xl:gap-12">
		<DeviceFilters
			{protocolFilter}
			{deviceTypeFilter}
			{sliderPriceRange}
			{databasePriceRange}
			{propertiesByDeviceType}
			{availableDeviceTypes}
			{sliderValues}
		/>

		<DeviceList {devices} {total} {page} {pageSize} />
	</div>

	{#if isLoading && navigating.to}
		{#await spinnerPromise then _}
			<div
				class="bg-background absolute inset-0 flex items-center justify-center bg-opacity-25 backdrop-blur-sm"
			>
				<Spinner class="stroke-foreground" />
			</div>
		{/await}
	{/if}
</div>
