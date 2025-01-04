<script lang="ts">
	import { Slider } from '../ui/slider';
	import type { PropertyJson } from '$lib/server/properties/property';

	let { property, value, onValueChange } = $props<{
		property: PropertyJson;
		value: [number, number];
		onValueChange: (value: [number, number]) => void;
	}>();

	let minValue = $state(property.minValue ?? 0);
	let maxValue = $state(property.maxValue ?? 100);

	$effect(() => {
		minValue = property.minValue ?? 0;
		maxValue = property.maxValue ?? 100;
	});
</script>

<div class="flex flex-col gap-2">
	<div class="relative pt-4">
		{#each value as boundValue}
			<span
				class="absolute bottom-3 -translate-x-1/2"
				style="left: {((boundValue - minValue) / (maxValue - minValue)) * 100}%"
			>
				{boundValue}{property.unit ? ` ${property.unit}` : ''}
			</span>
		{/each}

		<Slider
			{value}
			onValueChange={(value) => onValueChange([value[0], value[1]])}
			min={minValue}
			max={maxValue}
			step={property.type === 'int' ? 1 : 0.1}
			class="w-full"
			aria-label={property.name}
			type="multiple"
		/>
	</div>
</div>
