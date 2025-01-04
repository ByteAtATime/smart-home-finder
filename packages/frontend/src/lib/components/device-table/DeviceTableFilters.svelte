<script lang="ts">
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';
	import FilterCheckboxGroup from './FilterCheckboxGroup.svelte';
	import PriceRangeSlider from './PriceRangeSlider.svelte';
	import PropertyFilters from './PropertyFilters.svelte';

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

	$effect(() => {
		onFiltersChange({
			protocols: Object.entries(protocolFilter)
				.filter(([_, value]) => value)
				.map(([protocol]) => protocol),
			deviceTypes: Object.entries(deviceTypeFilter)
				.filter(([_, value]) => value)
				.map(([deviceType]) => deviceType),
			priceRange,
			propertyFilters
		});
	});
</script>

<div class="flex w-48 flex-col gap-2">
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
