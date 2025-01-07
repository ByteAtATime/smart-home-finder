<script lang="ts">
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';
	import FilterCheckboxGroup from './FilterCheckboxGroup.svelte';
	import PriceRangeSlider from './PriceRangeSlider.svelte';
	import PropertyFilters from './PropertyFilters.svelte';
	import SearchBar from './SearchBar.svelte';

	type DeviceTableFiltersProps = {
		propertiesByDeviceType: Record<string, PropertyJson[]>;
		availableDeviceTypes: DeviceType[];
		maxPrice: number;
		onFiltersChange: (filters: {
			protocols: string[];
			deviceTypes: string[];
			priceRange: [number, number];
			propertyFilters: Array<{
				propertyId: string;
				deviceType: DeviceType;
				bounds: [number, number];
			}>;
			searchQuery: string;
		}) => void;
	};

	let {
		propertiesByDeviceType,
		availableDeviceTypes,
		maxPrice,
		onFiltersChange
	}: DeviceTableFiltersProps = $props();

	let protocolFilter = $state(
		Object.fromEntries(
			Object.entries(PROTOCOL_DISPLAY_NAMES).map(([protocol]) => [protocol, false])
		)
	);
	let deviceTypeFilter = $state(
		Object.fromEntries(Object.entries(DEVICE_TYPES).map(([deviceType]) => [deviceType, false]))
	);
	let priceRange = $state<[number, number]>([0, maxPrice]);
	let propertyFilters = $state<
		Array<{
			propertyId: string;
			deviceType: DeviceType;
			bounds: [number, number];
		}>
	>([]);
	let searchQuery = $state('');

	$effect(() => {
		onFiltersChange({
			protocols: Object.entries(protocolFilter)
				.filter(([_, checked]) => checked)
				.map(([protocol]) => protocol),
			deviceTypes: Object.entries(deviceTypeFilter)
				.filter(([_, checked]) => checked)
				.map(([deviceType]) => deviceType),
			priceRange,
			propertyFilters,
			searchQuery
		});
	});

	function handleSearch(query: string) {
		searchQuery = query;
	}
</script>

<div class="flex w-full flex-col gap-8 sm:w-56">
	<SearchBar onSearch={handleSearch} />

	<FilterCheckboxGroup
		title="Protocol"
		items={PROTOCOL_DISPLAY_NAMES}
		bind:selectedItems={protocolFilter}
	/>

	<FilterCheckboxGroup
		title="Device Type"
		items={DEVICE_TYPES}
		bind:selectedItems={deviceTypeFilter}
		disabledItems={Object.keys(DEVICE_TYPES).filter(
			(type) => !availableDeviceTypes.includes(type as DeviceType)
		)}
	/>

	<PriceRangeSlider
		{maxPrice}
		onPriceChange={(range) => {
			priceRange = range;
		}}
	/>

	<PropertyFilters
		{propertiesByDeviceType}
		onPropertyChange={(filters) => {
			propertyFilters = filters;
		}}
	/>
</div>
