<script lang="ts">
	import Spinner from '../Spinner.svelte';
	import { navigating } from '$app/state';

	let isLoading = $state(false);
	let spinnerPromise: Promise<unknown> | null = $state(null);

	$effect(() => {
		if (navigating.to) {
			isLoading = true;
			spinnerPromise = new Promise((resolve) => setTimeout(resolve, 125));
		} else {
			isLoading = false;
			spinnerPromise = null;
		}
	});
</script>

{#if isLoading && navigating.to}
	{#await spinnerPromise then _}
		<div
			class="bg-background absolute inset-0 flex items-center justify-center bg-opacity-25 backdrop-blur-sm"
		>
			<Spinner class="stroke-foreground" />
		</div>
	{/await}
{/if}
