<script lang="ts">
	import DeviceTable from '$lib/components/device-table/DeviceTable.svelte';

	let { data } = $props();
</script>

<main class="mx-auto max-w-screen-lg p-4 xl:max-w-screen-xl">
	{#await data.devices}
		<DeviceTable
			devices={[]}
			total={0}
			page={1}
			pageSize={10}
			absolutePriceRange={[0, 0]}
			propertiesByDeviceType={{}}
			availableDeviceTypes={[]}
			isLoading={true}
		/>
	{:then devices}
		{#await Promise.all( [data.total, data.page, data.pageSize, data.priceBounds, data.propertiesByDeviceType, data.availableDeviceTypes] )}
			<DeviceTable
				{devices}
				total={0}
				page={1}
				pageSize={10}
				absolutePriceRange={[0, 0]}
				propertiesByDeviceType={{}}
				availableDeviceTypes={[]}
				isLoading={true}
			/>
		{:then [total, page, pageSize, priceBounds, propertiesByDeviceType, availableDeviceTypes]}
			<DeviceTable
				{devices}
				{total}
				{page}
				{pageSize}
				absolutePriceRange={priceBounds}
				{propertiesByDeviceType}
				{availableDeviceTypes}
				isLoading={false}
			/>
		{/await}
	{/await}
</main>
