<script>
	import DeviceTable from '$lib/components/DeviceTable.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();
	const devices = $derived(data.devices.devices);

	const properties = ['voltage'];
</script>

<ThemeToggle />

<DeviceTable {devices} {properties} />
