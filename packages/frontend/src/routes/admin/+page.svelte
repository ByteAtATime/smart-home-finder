<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';

	interface DeviceTypeDistribution {
		type: string;
		count: number;
		percentage: number;
	}

	let { data } = $props<{ data: PageData }>();

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
	};

	let deviceTypeDistribution = $derived(
		Object.entries(data.metrics.devicesByType).map(([type, count]) => ({
			type,
			count: count as number,
			percentage: ((count as number) / data.metrics.totalDevices) * 100
		})) as DeviceTypeDistribution[]
	);
</script>

{#snippet statsCard(title: string, value: string | number, subtitle: string)}
	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">{title}</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{value}</div>
			<p class="text-muted-foreground text-xs">{subtitle}</p>
		</CardContent>
	</Card>
{/snippet}

{#snippet distributionBar(type: string, count: number, percentage: number)}
	<div class="flex items-center">
		<div class="w-40">
			<p class="capitalize">{type}</p>
			<p class="text-muted-foreground text-xs">{count} devices</p>
		</div>
		<div class="flex-1">
			<div class="bg-secondary h-2 w-full rounded-full">
				<div class="bg-primary h-2 rounded-full" style="width: {percentage}%"></div>
			</div>
		</div>
		<div class="w-12 text-right text-sm">{percentage.toFixed(1)}%</div>
	</div>
{/snippet}

<div class="space-y-8">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
		<p class="text-muted-foreground">Overview of your smart home device catalog</p>
	</div>

	<Separator />

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{@render statsCard(
			'Total Devices',
			data.metrics.totalDevices,
			`Across ${Object.keys(data.metrics.devicesByType).length} categories`
		)}

		{@render statsCard('Total Users', data.metrics.totalUsers, 'Registered users')}

		{@render statsCard(
			'Price Range',
			`${formatCurrency(data.metrics.priceRange.min)} - ${formatCurrency(data.metrics.priceRange.max)}`,
			'Device price range'
		)}

		{@render statsCard(
			'Most Common Type',
			deviceTypeDistribution[0]?.type || 'N/A',
			`${deviceTypeDistribution[0]?.percentage.toFixed(1) || 0}% of devices`
		)}
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Device Type Distribution</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each deviceTypeDistribution as { type, count, percentage }}
					{@render distributionBar(type, count, percentage)}
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
