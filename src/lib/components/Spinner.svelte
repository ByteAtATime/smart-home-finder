<script lang="ts">
	const props = $props();
</script>

<svg
	width="24"
	height="24"
	stroke="#000"
	viewBox="0 0 24 24"
	xmlns="http://www.w3.org/2000/svg"
	{...props}
>
	<style>
		.spinner {
			transform-origin: center;
			animation: spinner_rotate 2s linear infinite;
		}
		.spinner circle {
			stroke-linecap: round;
			animation: spinner_dash 1.5s ease-in-out infinite;
		}
		@keyframes spinner_rotate {
			100% {
				transform: rotate(360deg);
			}
		}
		@keyframes spinner_dash {
			0% {
				stroke-dasharray: 0 150;
				stroke-dashoffset: 0;
			}
			47.5% {
				stroke-dasharray: 42 150;
				stroke-dashoffset: -16;
			}
			95%,
			100% {
				stroke-dasharray: 42 150;
				stroke-dashoffset: -59;
			}
		}
	</style>
	<g class="spinner">
		<circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3" />
	</g>
</svg>
