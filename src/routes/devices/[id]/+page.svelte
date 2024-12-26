<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { PROTOCOL_DISPLAY_NAMES } from '$lib/constants.js';

	const { data } = $props();
	const { device } = $derived(data);
</script>

<div class="container mx-auto max-w-3xl p-4">
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="text-2xl font-bold">{device.name}</Card.Title>
				<div class="flex gap-2">
					<Badge variant="outline" class="capitalize">
						{device.deviceType}
					</Badge>
					<Badge variant="outline">
						{PROTOCOL_DISPLAY_NAMES[device.protocol]}
					</Badge>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div>
				<h3 class="mb-2 text-lg font-semibold">Properties</h3>
				<div class="grid grid-cols-2 gap-4">
					{#each Object.entries(device.properties) as [key, property]}
						<div class="flex justify-between rounded-lg bg-muted p-2">
							<span class="font-medium">{property.name}</span>
							<span>{property.value}</span>
						</div>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
