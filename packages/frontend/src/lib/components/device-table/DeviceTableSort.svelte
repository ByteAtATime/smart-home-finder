<script lang="ts">
	import { page } from '$app/state';

	type SortField = 'price' | 'name' | 'createdAt';
	type SortDirection = 'asc' | 'desc';

	const sortOptions = $state([
		{ label: 'Price (low to high)', field: 'price', direction: 'asc' },
		{ label: 'Price (high to low)', field: 'price', direction: 'desc' },
		{ label: 'Name (A to Z)', field: 'name', direction: 'asc' },
		{ label: 'Name (Z to A)', field: 'name', direction: 'desc' },
		{ label: 'Newest first', field: 'createdAt', direction: 'desc' },
		{ label: 'Oldest first', field: 'createdAt', direction: 'asc' }
	] as const);

	let { onSortChange }: { onSortChange: (field: SortField, direction: SortDirection) => void } =
		$props();
	const selectedSort = $derived.by(() => {
		const field = page.url.searchParams.get('sortField');
		const direction = page.url.searchParams.get('sortDirection');

		if (!field || !direction) return '';

		return `${field}:${direction}`;
	});

	function handleSortChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		if (!value) return;

		const option = sortOptions.find((opt) => `${opt.field}:${opt.direction}` === value);
		if (option) {
			onSortChange(option.field, option.direction);
		}
	}
</script>

<select
	class="border-input bg-background ring-offset-background focus:ring-ring h-10 w-[200px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
	value={selectedSort}
	onchange={handleSortChange}
>
	<option value="">Sort by...</option>
	{#each sortOptions as option}
		<option value={`${option.field}:${option.direction}`}>{option.label}</option>
	{/each}
</select>
