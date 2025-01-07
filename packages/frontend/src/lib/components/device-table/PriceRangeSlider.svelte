<script lang="ts">
	import { Slider } from '../ui/slider';

	type PriceRangeSliderProps = {
		maxPrice: number;
		onPriceChange: (range: [number, number]) => void;
	};

	let { maxPrice, onPriceChange }: PriceRangeSliderProps = $props();

	let sliderPriceRange = $state<[number, number]>([0, maxPrice]);
	let debounceTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(debounceTimeout);

		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		sliderPriceRange;

		debounceTimeout = setTimeout(() => {
			onPriceChange(sliderPriceRange);
		}, 500);
	});
</script>

<div class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">Price</h2>

	<div class="relative pt-6">
		{#each sliderPriceRange as value}
			<span
				class="absolute bottom-4 -translate-x-1/2 text-sm"
				style="left: {(value / maxPrice) * 100}%"
			>
				${value}
			</span>
		{/each}

		<Slider
			value={sliderPriceRange}
			onValueChange={(value) => {
				sliderPriceRange = value as [number, number];
			}}
			min={0}
			max={maxPrice}
			step={1}
			class="w-full"
			aria-label="Price"
			type="multiple"
		/>
	</div>
</div>
