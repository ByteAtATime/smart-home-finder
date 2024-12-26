<script>
	import DeviceTable from '$lib/components/DeviceTable.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();
	const { devices, total, pageSize, page } = $derived(data);

	const properties = ['voltage'];
</script>

<ThemeToggle />

<DeviceTable {devices} {total} {pageSize} {page} {properties} />
