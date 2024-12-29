<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ExternalLinkIcon } from 'lucide-svelte';
	import { navigating } from '$app/state';

	const { data } = $props();
	const { device } = $derived(data);

	const relativeTime = (date: Date) => {
		const secondsDiff = Math.round((date.getTime() - Date.now()) / 1000);

		const unitsInSec = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];

		const unitStrings = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'] as const;

		const unitIndex = unitsInSec.findIndex((cutoff) => cutoff > Math.abs(secondsDiff));

		const divisor = unitIndex ? unitsInSec[unitIndex - 1] : 1;

		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

		return rtf.format(Math.floor(secondsDiff / divisor), unitStrings[unitIndex]);
	};
</script>

<div class="container mx-auto max-w-screen-md p-4 {navigating.to ? 'opacity-50' : ''}">
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
				<h2 class="text-xl font-semibold">Variants</h2>
				{#each device.variants as variant}
					<div class="flex items-center gap-2">
						{variant.name}:
						{#each variant.options as option}
							{@const isThisDevice = option.deviceId === device.id}
							<Button
								variant="outline"
								size="sm"
								href={!isThisDevice ? `/devices/${option.deviceId}` : undefined}
								class={isThisDevice ? 'pointer-events-none opacity-50' : ''}
							>
								{option.value}
							</Button>
						{/each}
					</div>
				{/each}
			</div>

			<div class="w-full space-y-4">
				<h2 class="text-xl font-semibold">Prices</h2>
				<div class="grid gap-4">
					{#each device.prices as price}
						<Card.Root>
							<Card.Content class="p-4">
								<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<div class="mb-1 font-medium">{price.sellerName}</div>
										<div class="text-muted-foreground flex items-center gap-2 text-sm">
											<span>{price.inStock ? 'In Stock' : 'Out of Stock'}</span>
											<span>•</span>
											<span>Updated {relativeTime(price.priceUpdatedAt)}</span>
										</div>
									</div>
									<div class="flex items-center gap-3">
										<div class="text-2xl font-bold">${price.price.toFixed(2)}</div>
										<Button
											aria-label={`Buy from ${price.sellerName}`}
											variant="outline"
											size="sm"
											href={price.url}
											target="_blank"
											rel="noopener noreferrer"
											class="gap-1"
										>
											Buy <ExternalLinkIcon class="h-4 w-4" />
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</div>

			<div class="w-full space-y-4">
				<h2 class="text-xl font-semibold">Properties</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each Object.entries(device.properties) as [_, prop]}
						<div class="bg-secondary/20 rounded-lg p-4">
							<div class="text-muted-foreground text-sm">{prop.name}</div>
							<div class="text-lg font-medium">
								{prop.value}
								{prop.unit}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<footer class="text-muted-foreground mt-4 flex flex-col items-center gap-1 text-sm">
				<time datetime={device.createdAt?.toISOString()}>
					Created: {device.createdAt?.toLocaleDateString()}
				</time>
				<time datetime={device.updatedAt?.toISOString()}>
					Last Updated: {device.updatedAt?.toLocaleDateString()}
				</time>
			</footer>
		</Card.Content>
	</Card.Root>
</div>
