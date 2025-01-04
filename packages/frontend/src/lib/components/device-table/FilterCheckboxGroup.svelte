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

	function handleSelectAll() {
		selectedItems = Object.fromEntries(Object.keys(items).map((key) => [key, false]));
	}

	let isAllSelected = $derived(Object.values(selectedItems).every((value) => !value));
</script>

<div class="flex flex-col gap-2">
	<h2 class="text-lg font-bold">{title}</h2>

	<div class="flex items-center gap-2">
		<Checkbox
			id="all"
			checked={isAllSelected}
			onCheckedChange={handleSelectAll}
			aria-labelledby="all"
		/>
		<Label
			id="all"
			for="all"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			All
		</Label>
	</div>

	{#each Object.entries(items) as [key, displayName]}
		<div class="flex items-center gap-2">
			<Checkbox
				id={key}
				bind:checked={selectedItems[key]}
				disabled={disabledItems.includes(key)}
				aria-labelledby={key}
			/>
			<Label
				id={key}
				for={key}
				class={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabledItems.includes(key) ? 'opacity-50' : ''}`}
			>
				{displayName}
			</Label>
		</div>
	{/each}
</div>
