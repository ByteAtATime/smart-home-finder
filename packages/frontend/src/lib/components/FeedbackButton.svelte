<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();

	const FEEDBACK_URL = 'https://forms.gle/S9XQJmMzQmrCM8hw7';
</script>

<a
	href={FEEDBACK_URL}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		'text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors',
		className
	)}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-5 w-5"
	>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>

	Feedback
</a>
