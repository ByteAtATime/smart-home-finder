<script lang="ts">
	import DeviceTable from '$lib/components/DeviceTable.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<ThemeToggle />

<main class="mx-auto max-w-screen-lg p-4 xl:max-w-screen-xl">
	<DeviceTable
		devices={data.devices}
		total={data.total}
		page={data.page}
		pageSize={data.pageSize}
		absolutePriceRange={data.priceBounds}
		propertiesByDeviceType={data.propertiesByDeviceType}
		availableDeviceTypes={data.availableDeviceTypes}
	/>
</main>
