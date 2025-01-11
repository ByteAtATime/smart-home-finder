<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	interface Device {
		id: string;
		name: string;
		deviceType: string;
		protocol: string;
		variants?: Array<unknown>;
		properties?: Record<string, unknown>;
		updatedAt: string | Date;
	}

	let { data } = $props<{ data: PageData }>();

	const formatDate = (date: string | Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	};

	function handlePageChange(newPage: number) {
		goto(`?page=${newPage}`);
	}

	let totalPages = $derived(Math.ceil(data.devices.total / data.pageSize));
	let pageNumbers = $derived(
		Array.from({ length: totalPages }, (_, i) => i + 1).filter(
			(num) => Math.abs(num - data.page) <= 2 || num === 1 || num === totalPages
		)
	);
</script>

{#snippet deviceRow(device: Device)}
	<Table.Row>
		<Table.Cell class="font-medium">{device.name}</Table.Cell>
		<Table.Cell class="capitalize">{device.deviceType}</Table.Cell>
		<Table.Cell class="capitalize">{device.protocol}</Table.Cell>
		<Table.Cell>{device.variants?.length || 0}</Table.Cell>
		<Table.Cell>{Object.keys(device.properties || {}).length}</Table.Cell>
		<Table.Cell>{formatDate(device.updatedAt)}</Table.Cell>
		<Table.Cell>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="icon">
						<span class="sr-only">Open menu</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<circle cx="12" cy="12" r="1" />
							<circle cx="12" cy="5" r="1" />
							<circle cx="12" cy="19" r="1" />
						</svg>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item>
						<a href="/admin/devices/{device.id}">Edit</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<form
							action="?/delete"
							method="POST"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') {
										goto(`?page=${data.page}`, { invalidateAll: true });
									}
								};
							}}
						>
							<input type="hidden" name="id" value={device.id} />
							<button type="submit" class="text-destructive w-full text-left">Delete</button>
						</form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Table.Cell>
	</Table.Row>
{/snippet}

{#snippet pagination(currentPage: number, totalPages: number, pageNumbers: number[])}
	<div class="flex justify-center gap-2">
		<Button
			variant="outline"
			size="sm"
			disabled={currentPage === 1}
			onclick={() => handlePageChange(currentPage - 1)}
		>
			Previous
		</Button>

		{#each pageNumbers as pageNum}
			{#if pageNum !== pageNumbers[0] && pageNum - pageNumbers[pageNumbers.indexOf(pageNum) - 1] > 1}
				<Button variant="outline" size="sm" disabled>...</Button>
			{/if}
			<Button
				variant={pageNum === currentPage ? 'default' : 'outline'}
				size="sm"
				onclick={() => handlePageChange(pageNum)}
			>
				{pageNum}
			</Button>
		{/each}

		<Button
			variant="outline"
			size="sm"
			disabled={currentPage === totalPages}
			onclick={() => handlePageChange(currentPage + 1)}
		>
			Next
		</Button>
	</div>
{/snippet}

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Devices</h2>
			<p class="text-muted-foreground">Manage your smart home devices catalog</p>
		</div>
		<Button href="/admin/devices/new">Add Device</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head>Protocol</Table.Head>
					<Table.Head>Variants</Table.Head>
					<Table.Head>Properties</Table.Head>
					<Table.Head>Updated</Table.Head>
					<Table.Head class="w-[80px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.devices.items as device}
					{@render deviceRow(device)}
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#if totalPages > 1}
		{@render pagination(data.page, totalPages, pageNumbers)}
	{/if}
</div>
