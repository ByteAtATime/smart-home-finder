<script lang="ts">
	import DeviceTable from '$lib/components/device-table/DeviceTable.svelte';
	import LoadingOverlay from '$lib/components/device-table/LoadingOverlay.svelte';
	import type { DeviceJson } from '$lib/server/devices/device';
	import type { PropertyJson } from '$lib/server/properties/property';
	import type { DeviceType } from '@smart-home-finder/common/types';

	type DeviceData = {
		success: boolean;
		total: number;
		pageSize: number;
		page: number;
		devices: DeviceJson[];
		priceBounds: [number, number];
		propertiesByDeviceType: Record<string, PropertyJson[]>;
		availableDeviceTypes: DeviceType[];
	};

	let { data } = $props();
	let deviceData = $state<DeviceData | null>(null);
	let isStreaming = $state(true);

	$effect(() => {
		isStreaming = true;
		data.streamed.deviceData.then((result) => {
			deviceData = result;
			isStreaming = false;
		});
	});
</script>

<main class="mx-auto max-w-screen-lg p-4 xl:max-w-screen-xl">
	<div class="relative min-h-[400px]">
		{#if deviceData}
			<DeviceTable
				devices={deviceData.devices}
				total={deviceData.total}
				page={deviceData.page}
				pageSize={deviceData.pageSize}
				absolutePriceRange={deviceData.priceBounds}
				propertiesByDeviceType={deviceData.propertiesByDeviceType}
				availableDeviceTypes={deviceData.availableDeviceTypes}
			/>
		{/if}
		<LoadingOverlay isLoading={isStreaming} />
	</div>
</main>
