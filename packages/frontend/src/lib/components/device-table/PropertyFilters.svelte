<script lang="ts">
	import { Label } from '../ui/label';
	import { Slider } from '../ui/slider';
	import { DEVICE_TYPES } from '@smart-home-finder/common/constants';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';
	import * as Accordion from '../ui/accordion';

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
		<Accordion.Root type="multiple" class="flex w-full flex-col gap-4">
			{#each Object.entries(propertiesByDeviceType) as [deviceType, properties]}
				{@const typedDeviceType = deviceType as DeviceType}
				{#if properties.length > 0}
					<Accordion.Item value={deviceType} class="bg-muted -mx-4 rounded-2xl border-b-0 px-4">
						<Accordion.Trigger class="text-lg font-bold">
							{DEVICE_TYPES[typedDeviceType]}
						</Accordion.Trigger>
						<Accordion.Content>
							<div class="pb-4">
								{#each properties as property}
									{#if property.type === 'int' || property.type === 'float'}
										{@const sliderKey = `${property.id}:${typedDeviceType}`}
										{@const currentBounds = sliderValues[sliderKey] ?? [
											property.minValue ?? 0,
											property.maxValue ?? 100
										]}
										<div class="flex flex-col gap-1">
											<Label
												for={`${typedDeviceType}-${property.id}`}
												class="text-foreground/80 flex items-center gap-2 text-sm font-semibold"
											>
												{property.name}
												{#if property.unit}
													<span class="text-muted-foreground text-xs">({property.unit})</span>
												{/if}
											</Label>
											<div class="relative mx-4 pt-6">
												{#each currentBounds as value}
													<span
														class="absolute bottom-4 -translate-x-1/2 whitespace-nowrap text-sm"
														style={`left: ${(value / (property.maxValue ?? 100 - (property.minValue ?? 0))) * 100}%`}
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
						</Accordion.Content>
					</Accordion.Item>
				{/if}
			{/each}
		</Accordion.Root>
	</div>
{/if}
