<script lang="ts">
	import { Input } from '../ui/input';

	type SearchBarProps = {
		onSearch: (query: string) => void;
	};

	let { onSearch }: SearchBarProps = $props();
	let searchQuery = $state('');
	let timeoutId: number | undefined;

	$effect(() => {
		clearTimeout(timeoutId);

		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		searchQuery;

		timeoutId = setTimeout(() => {
			onSearch(searchQuery);
		}, 300) as unknown as number;
	});
</script>

<div class="relative">
	<Input placeholder="Search devices..." bind:value={searchQuery} />
	{#if searchQuery}
		<button
			onclick={() => {
				searchQuery = '';
			}}
			class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
		>
			✕
		</button>
	{/if}
</div>
