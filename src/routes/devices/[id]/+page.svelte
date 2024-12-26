<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import { Badge } from '$lib/components/ui/badge';

	const { data } = $props();
	const { device } = $derived(data);
</script>

<div class="container mx-auto max-w-screen-md p-4">
	<Card.Root class="p-6">
		<Card.Header class="flex items-center justify-between">
			<Card.Title>{device.name}</Card.Title>
			<div class="space-x-2">
				<Badge variant="secondary">{device.deviceType}</Badge>
				<Badge variant="outline">{device.protocol}</Badge>
			</div>
		</Card.Header>

		<Card.Content class="flex flex-col items-center gap-4">
			<Carousel.Root class="w-full max-w-sm">
				<Carousel.Content>
					{#each device.images as image}
						<Carousel.Item>
							<div class="p-1">
								<img
									src={image}
									alt={device.name}
									class="h-[300px] w-full rounded-lg object-contain"
								/>
							</div>
						</Carousel.Item>
					{/each}
				</Carousel.Content>
				<Carousel.Previous class="left-0" />
				<Carousel.Next class="right-0" />
			</Carousel.Root>

			<div class="w-full space-y-4">
				<h2 class="text-xl font-semibold">Properties</h2>
				<div class="grid grid-cols-2 gap-4">
					{#each Object.entries(device.properties) as [_, prop]}
						<div class="rounded-lg bg-secondary/20 p-4">
							<div class="text-sm text-muted-foreground">{prop.name}</div>
							<div class="text-lg font-medium">
								{prop.value}
								{prop.unit}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-col items-center text-sm text-muted-foreground">
				<div>Created: {device.createdAt?.toLocaleDateString()}</div>
				<div>Last Updated: {device.updatedAt?.toLocaleDateString()}</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
