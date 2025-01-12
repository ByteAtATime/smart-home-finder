<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';

	let { value = $bindable(''), error = '', label = 'JSON Editor' } = $props();
	let rawValue = $state(JSON.stringify(value, null, 2));
	let localError = $state('');

	$effect(() => {
		try {
			const parsed = JSON.parse(rawValue);
			value = parsed;
			localError = '';
		} catch (e) {
			if (e instanceof Error) {
				localError = e.message;
			} else {
				localError = 'Invalid JSON';
			}
		}
	});
</script>

<div class="space-y-2">
	<Label>{label}</Label>
	<Textarea
		bind:value={rawValue}
		placeholder={`{
  "key": "value"
}`}
		rows={10}
		aria-invalid={error || localError ? 'true' : undefined}
	/>
	{#if error || localError}
		<p class="text-destructive text-sm">{error || localError}</p>
	{/if}
</div>
