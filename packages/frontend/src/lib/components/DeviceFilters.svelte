<script lang="ts">
	import { Checkbox } from './ui/checkbox';
	import { Label } from './ui/label';
	import { Slider } from './ui/slider';
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';
	import PropertySlider from './DeviceTable/PropertySlider.svelte';

	type Props = {
		protocolFilter: Record<string, boolean>;
		deviceTypeFilter: Record<string, boolean>;
		sliderPriceRange: [number, number];
		databasePriceRange: [number, number];
		propertiesByDeviceType: Record<string, PropertyJson[]>;
		availableDeviceTypes: DeviceType[];
		sliderValues: Record<string, [number, number]>;
	};

	let {
		protocolFilter,
		deviceTypeFilter,
		sliderPriceRange,
		databasePriceRange,
		propertiesByDeviceType,
		availableDeviceTypes,
		sliderValues
	}: Props = $props();
</script>

<div class="flex w-48 flex-col gap-2">
	<section>
		<h2 class="text-lg font-bold">Protocol</h2>

		<div class="flex items-center gap-2">
			<Checkbox
				id="all-protocols"
				checked={Object.values(protocolFilter).every((value) => !value)}
				onCheckedChange={() => {
					protocolFilter = Object.fromEntries(
						Object.entries(protocolFilter).map(([protocol]) => [protocol, false])
					);
				}}
				aria-labelledby="all-protocols"
			/>
			<Label
				id="all-protocols"
				for="all-protocols"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				All
			</Label>
		</div>

		{#each Object.entries(PROTOCOL_DISPLAY_NAMES) as [protocol, displayName]}
			<div class="flex items-center gap-2">
				<Checkbox
					id={`protocol-${protocol}`}
					bind:checked={protocolFilter[protocol]}
					aria-labelledby={`protocol-${protocol}`}
				/>
				<Label
					id={`protocol-${protocol}`}
					for={`protocol-${protocol}`}
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					{displayName}
				</Label>
			</div>
		{/each}
	</section>

	<section class="mt-4">
		<h2 class="text-lg font-bold">Device Type</h2>

		<div class="flex items-center gap-2">
			<Checkbox
				id="all-device-types"
				checked={Object.values(deviceTypeFilter).every((value) => !value)}
				onCheckedChange={() => {
					deviceTypeFilter = Object.fromEntries(
						Object.entries(deviceTypeFilter).map(([deviceType]) => [deviceType, false])
					);
				}}
				aria-labelledby="all-device-types"
			/>
			<Label
				id="all-device-types"
				for="all-device-types"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				All
			</Label>
		</div>

		{#each Object.entries(DEVICE_TYPES) as [deviceType, displayName]}
			{@const typedDeviceType = deviceType as keyof typeof DEVICE_TYPES}
			<div class="flex items-center gap-2">
				<Checkbox
					id={`device-type-${typedDeviceType}`}
					bind:checked={deviceTypeFilter[typedDeviceType]}
					disabled={!availableDeviceTypes.includes(typedDeviceType)}
					aria-labelledby={`device-type-${typedDeviceType}`}
				/>
				<Label
					id={`device-type-${typedDeviceType}`}
					for={`device-type-${typedDeviceType}`}
					class={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${!availableDeviceTypes.includes(typedDeviceType) ? 'opacity-50' : ''}`}
				>
					{displayName}
				</Label>
			</div>
		{/each}
	</section>

	<section class="mt-4">
		<h2 class="text-lg font-bold">Price</h2>

		<div class="relative pt-4">
			{#each sliderPriceRange as value}
				<span
					class="absolute bottom-3 -translate-x-1/2"
					style="left: {(value / databasePriceRange[1]) * 100}%"
				>
					${value}
				</span>
			{/each}

			<Slider
				value={sliderPriceRange}
				onValueChange={(value) => {
					sliderPriceRange = [value[0], value[1]];
				}}
				min={0}
				max={databasePriceRange[1]}
				step={1}
				class="w-full"
				aria-label="Price"
				type="multiple"
			/>
		</div>
	</section>

	{#if Object.keys(propertiesByDeviceType).length > 0}
		<section class="mt-4">
			<h2 class="text-lg font-bold">Device Properties</h2>

			{#each Object.entries(propertiesByDeviceType) as [deviceType, properties]}
				{@const typedDeviceType = deviceType as keyof typeof DEVICE_TYPES}
				{#if properties.length > 0}
					<div class="mt-2">
						<h3 class="font-medium">{DEVICE_TYPES[typedDeviceType]}</h3>
						<div class="ml-4 flex flex-col gap-2">
							{#each properties as property}
								<div class="flex flex-col gap-1">
									<Label for={`${typedDeviceType}-${property.id}`} class="text-sm font-medium">
										{property.name}
									</Label>
									{#if property.type === 'int' || property.type === 'float'}
										{@const sliderKey = `${property.id}:${typedDeviceType}`}
										{@const currentBounds = sliderValues[sliderKey] ?? [
											property.minValue ?? 0,
											property.maxValue ?? 100
										]}
										<PropertySlider
											{property}
											value={currentBounds}
											onValueChange={(value) => {
												sliderValues = {
													...sliderValues,
													[sliderKey]: value
												};
											}}
										/>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</section>
	{/if}
</div>
