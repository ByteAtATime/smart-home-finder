<script lang="ts">
	import { Label } from '../ui/label';
	import { Slider } from '../ui/slider';
	import { DEVICE_TYPES } from '@smart-home-finder/common/constants';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';

	type PropertyFiltersProps = {
		propertiesByDeviceType: Record<string, PropertyJson[]>;
		onPropertyChange: (
			filters: Array<{
				propertyId: string;
				deviceType: DeviceType;
				bounds: [number, number];
			}>
		) => void;
	};

	let { propertiesByDeviceType, onPropertyChange }: PropertyFiltersProps = $props();

	let sliderValues = $state<Record<string, [number, number]>>({});
	let debounceTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- this makes it reactive
		sliderValues;

		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			const filters = Object.entries(sliderValues).map(([key, bounds]) => {
				const [propertyId, deviceType] = key.split(':');
				return {
					propertyId,
					deviceType: deviceType as DeviceType,
					bounds
				};
			});
			onPropertyChange(filters);
		}, 500);
	});
</script>

{#if Object.keys(propertiesByDeviceType).length > 0}
	<div class="flex flex-col gap-2">
		<h2 class="text-lg font-bold">Device Properties</h2>

		{#each Object.entries(propertiesByDeviceType) as [deviceType, properties]}
			{@const typedDeviceType = deviceType as DeviceType}
			{#if properties.length > 0}
				<div class="mt-2">
					<h3 class="font-medium">{DEVICE_TYPES[typedDeviceType]}</h3>
					<div class="ml-4 flex flex-col gap-2">
						{#each properties as property}
							{#if property.type === 'int' || property.type === 'float'}
								{@const sliderKey = `${property.id}:${typedDeviceType}`}
								{@const currentBounds = sliderValues[sliderKey] ?? [
									property.minValue ?? 0,
									property.maxValue ?? 100
								]}
								<div class="flex flex-col gap-1">
									<Label for={`${typedDeviceType}-${property.id}`} class="text-sm font-medium">
										{property.name}
									</Label>
									<div class="relative pt-4">
										{#each currentBounds as value}
											<span
												class="absolute bottom-3 -translate-x-1/2"
												style="left: {((value - (property.minValue ?? 0)) /
													((property.maxValue ?? 100) - (property.minValue ?? 0))) *
													100}%"
											>
												{value}{property.unit ? ` ${property.unit}` : ''}
											</span>
										{/each}

										<Slider
											value={currentBounds}
											onValueChange={(value) => {
												sliderValues = {
													...sliderValues,
													[sliderKey]: [value[0], value[1]]
												};
											}}
											min={property.minValue ?? 0}
											max={property.maxValue ?? 100}
											step={property.type === 'int' ? 1 : 0.1}
											class="w-full"
											aria-label={property.name}
											type="multiple"
										/>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}
