<script lang="ts">
	import DeviceTable from '$lib/components/device-table/DeviceTable.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

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
