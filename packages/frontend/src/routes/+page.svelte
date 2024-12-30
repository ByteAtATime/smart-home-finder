<script>
	import DeviceTable from '$lib/components/DeviceTable.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();
	const { devices, total, pageSize, page } = $derived(data);
</script>

<ThemeToggle />

<main class="mx-auto max-w-screen-lg p-4">
	<DeviceTable {devices} {total} {pageSize} {page} properties={[]} />
</main>
