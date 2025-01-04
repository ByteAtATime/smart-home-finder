<script>
	import DeviceTable from '$lib/components/DeviceTable.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();
	const { devices, total, pageSize, page, priceBounds } = $derived(data);
</script>

<ThemeToggle />

<main class="mx-auto max-w-screen-lg p-4 xl:max-w-screen-xl">
	<DeviceTable
		{devices}
		{total}
		{pageSize}
		{page}
		absolutePriceRange={priceBounds}
		properties={[]}
	/>
</main>
