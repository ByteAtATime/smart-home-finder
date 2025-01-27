<script lang="ts">
	import { Checkbox } from '../ui/checkbox';
	import { Label } from '../ui/label';

	type FilterCheckboxGroupProps = {
		title: string;
		items: Record<string, string>;
		selectedItems: Record<string, boolean>;
		disabledItems?: string[];
	};

	let {
		title,
		items,
		selectedItems = $bindable(),
		disabledItems = []
	}: FilterCheckboxGroupProps = $props();

	const idPrefix = $derived(`filter-${title.toLowerCase().replace(/\s+/g, '-')}`);

	function handleSelectAll() {
		selectedItems = Object.fromEntries(Object.keys(items).map((key) => [key, false]));
	}

	let isAllSelected = $derived(Object.values(selectedItems).every((value) => !value));
</script>

<div class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">{title}</h2>

	<div class="flex items-center gap-2">
		<Checkbox
			id={`${idPrefix}-all`}
			bind:checked={() => isAllSelected, handleSelectAll}
			aria-labelledby={`${idPrefix}-all-label`}
		/>
		<Label
			id={`${idPrefix}-all-label`}
			for={`${idPrefix}-all`}
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			All
		</Label>
	</div>

	{#each Object.entries(items) as [key, displayName]}
		<div class="flex items-center gap-2">
			<Checkbox
				id={`${idPrefix}-${key}`}
				bind:checked={selectedItems[key]}
				disabled={disabledItems.includes(key)}
				aria-labelledby={`${idPrefix}-${key}-label`}
			/>
			<Label
				id={`${idPrefix}-${key}-label`}
				for={`${idPrefix}-${key}`}
				class={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabledItems.includes(key) ? 'opacity-50' : ''}`}
			>
				{displayName}
			</Label>
		</div>
	{/each}
</div>
