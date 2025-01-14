<script lang="ts">
	import '../app.css';
	import ClerkProvider from 'clerk-sveltekit/client/ClerkProvider.svelte';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
	import { ModeWatcher } from 'mode-watcher';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import FeedbackButton from '$lib/components/FeedbackButton.svelte';

	let { children } = $props();
</script>

<ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}>
	<ModeWatcher />
	<div class="min-h-screen">
		<div class="fixed right-4 top-4 z-50 flex items-center gap-4">
			<FeedbackButton />
			<ThemeToggle />
		</div>
		{@render children?.()}
	</div>
</ClerkProvider>
