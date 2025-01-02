<script lang="ts">
	import { getCoreRowModel, getPaginationRowModel, type ColumnDef } from '@tanstack/table-core';
	import {
		createSvelteTable,
		FlexRender,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination';
	import { goto } from '$app/navigation';
	import Spinner from './Spinner.svelte';
	import { createRawSnippet } from 'svelte';
	import Badge from './ui/badge/badge.svelte';
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import { Checkbox } from './ui/checkbox';
	import { Label } from './ui/label';
	import { navigating } from '$app/state';
	import type { DeviceJson } from '$lib/server/devices/device';
	import { Slider } from './ui/slider';

	type DeviceTableProps = {
		devices: DeviceJson[];
		total: number;
		page: number;
		pageSize: number;
		priceBounds: [number, number];
		properties: string[];
	};

	let {
		devices,
		total,
		page,
		pageSize,
		priceBounds: initialPriceBounds
	}: DeviceTableProps = $props();

	let isLoading = $state(false);
	let spinnerPromise: Promise<unknown> | null = $state(null);

	let priceBounds = $state([0, initialPriceBounds[1]]);
	let debouncedPriceBounds = $state(initialPriceBounds);
	let priceDebounceTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(priceDebounceTimeout);
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		priceBounds;
		priceDebounceTimeout = setTimeout(() => {
			debouncedPriceBounds[0] = priceBounds[0];
			debouncedPriceBounds[1] = priceBounds[1];
		}, 500);
	});

	let protocolFilter = $state(
		Object.fromEntries(
			Object.entries(PROTOCOL_DISPLAY_NAMES).map(([protocol]) => [protocol, false])
		)
	);
	let deviceTypeFilter = $state(
		Object.fromEntries(Object.entries(DEVICE_TYPES).map(([deviceType]) => [deviceType, false]))
	);

	$effect(() => {
		isLoading = true;
		spinnerPromise = new Promise((resolve) => setTimeout(resolve, 125));

		const searchParams = new URLSearchParams();
		searchParams.set('page', page.toString());
		searchParams.set('pageSize', pageSize.toString());
		if (Object.values(protocolFilter).some((value) => value)) {
			searchParams.set(
				'protocol',
				Object.entries(protocolFilter)
					.filter(([_, value]) => value)
					.map(([protocol]) => protocol)
					.join(',')
			);
		}
		if (Object.values(deviceTypeFilter).some((value) => value)) {
			searchParams.set(
				'deviceType',
				Object.entries(deviceTypeFilter)
					.filter(([_, value]) => value)
					.map(([deviceType]) => deviceType)
					.join(',')
			);
		}
		if (debouncedPriceBounds[0] !== 0 || debouncedPriceBounds[1] !== initialPriceBounds[1]) {
			searchParams.set('priceBounds', debouncedPriceBounds.join(','));
		}

		goto(`?${searchParams.toString()}`);
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- this makes it reactive
		[devices];

		isLoading = false;
		spinnerPromise = null;
	});

	const columns: ColumnDef<DeviceJson>[] = [
		{
			header: 'Name',
			accessorKey: 'name',
			cell: ({ row }) => {
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<a href="/devices/${row.original.id}" class="font-bold hover:text-blue-700 transition-colors duration-75 dark:hover:text-blue-300">${row.original.name}</a>`
				}));

				return renderSnippet(snippet, []);
			}
		},
		{
			header: 'Device Type',
			accessorKey: 'deviceType',
			cell: ({ row }) => {
				return renderComponent(Badge, {
					variant: 'default',
					children: createRawSnippet(() => ({
						render: () => DEVICE_TYPES[row.original.deviceType] ?? row.original.deviceType
					}))
				});
			}
		},
		{
			header: 'Protocol',
			accessorKey: 'protocol',
			cell: ({ row }) => {
				return renderComponent(Badge, {
					variant: 'secondary',
					children: createRawSnippet(() => ({
						render: () => PROTOCOL_DISPLAY_NAMES[row.original.protocol] ?? row.original.protocol
					}))
				});
			}
		},
		{
			header: 'Price',
			accessorKey: 'price',
			cell: ({ row }) => {
				const lowestPrice = Math.min(...row.original.listings.map((listing) => listing.price));
				if (lowestPrice === Infinity) {
					return '-';
				}

				return `$${lowestPrice}`;
			}
		}
	];

	const table = createSvelteTable({
		get data() {
			return devices;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});
</script>

<div class="relative">
	<div class="flex flex-col items-start gap-4 p-4 lg:flex-row">
		<div class="flex w-40 flex-col gap-2">
			<h2 class="text-lg font-bold">Protocol</h2>

			<div class="flex items-center gap-2">
				<Checkbox
					id="all"
					checked={Object.values(protocolFilter).every((value) => !value)}
					onCheckedChange={() => {
						protocolFilter = Object.fromEntries(
							Object.entries(protocolFilter).map(([protocol]) => [protocol, false])
						);
					}}
					aria-labelledby="all"
				/>
				<Label
					id="all"
					for="all"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					All
				</Label>
			</div>

			{#each Object.entries(PROTOCOL_DISPLAY_NAMES) as [protocol, displayName]}
				<div class="flex items-center gap-2">
					<Checkbox
						id={protocol}
						bind:checked={protocolFilter[protocol]}
						aria-labelledby={protocol}
					/>
					<Label
						id={protocol}
						for={protocol}
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{displayName}
					</Label>
				</div>
			{/each}

			<h2 class="mt-4 text-lg font-bold">Device Type</h2>

			<div class="flex items-center gap-2">
				<Checkbox
					id="all"
					checked={Object.values(deviceTypeFilter).every((value) => !value)}
					onCheckedChange={() => {
						deviceTypeFilter = Object.fromEntries(
							Object.entries(deviceTypeFilter).map(([deviceType]) => [deviceType, false])
						);
					}}
					aria-labelledby="all"
				/>
				<Label
					id="all"
					for="all"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					All
				</Label>
			</div>

			{#each Object.entries(DEVICE_TYPES) as [deviceType, displayName]}
				<div class="flex items-center gap-2">
					<Checkbox
						id={deviceType}
						bind:checked={deviceTypeFilter[deviceType]}
						aria-labelledby={deviceType}
					/>
					<Label
						id={deviceType}
						for={deviceType}
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{displayName}
					</Label>
				</div>
			{/each}

			<h2 class="mt-4 text-lg font-bold">Price</h2>

			<div class="relative pt-4">
				{#each priceBounds as value}
					<span
						class="absolute bottom-3 -translate-x-1/2"
						style="left: {(value / initialPriceBounds[1]) * 100}%"
					>
						{value}
					</span>
				{/each}

				<Slider
					bind:value={priceBounds}
					min={0}
					max={initialPriceBounds[1]}
					step={1}
					class="w-full"
					aria-label="Price"
					type="multiple"
				/>
			</div>
		</div>

		<div class="w-full rounded-md border">
			<Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							<Table.Head />
							{#each headerGroup.headers as header (header.id)}
								<Table.Head>
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row data-state={row.getIsSelected() && 'selected'}>
							<Table.Cell class="h-24 w-24 rounded">
								{#if row.original.images && row.original.images[0]}
									<img
										src={row.original.images[0]}
										alt={row.original.name}
										class="h-full w-full rounded object-cover"
									/>
								{/if}
							</Table.Cell>
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell>
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length + 2} class="h-24 text-center">
								No devices found.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<Pagination.Root
				count={total}
				perPage={pageSize}
				{page}
				onPageChange={(p) => {
					page = p;
				}}
			>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={currentPage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	</div>

	{#if isLoading && navigating.to}
		{#await spinnerPromise then _}
			<div
				class="bg-background absolute inset-0 flex items-center justify-center bg-opacity-25 backdrop-blur-sm"
			>
				<Spinner class="stroke-foreground" />
			</div>
		{/await}
	{/if}
</div>
