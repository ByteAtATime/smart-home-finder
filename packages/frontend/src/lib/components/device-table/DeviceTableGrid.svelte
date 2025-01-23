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
	import { createRawSnippet } from 'svelte';
	import Badge from '../ui/badge/badge.svelte';
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import type { DeviceJson } from '$lib/server/devices/device';

	type DeviceTableGridProps = {
		devices: DeviceJson[];
		total: number;
		page: number;
		pageSize: number;
		onPageChange: (page: number) => void;
	};

	let { devices, total, page, pageSize, onPageChange }: DeviceTableGridProps = $props();

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
				return `$${lowestPrice.toFixed(2)}`;
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

<div class="flex w-full flex-col items-center gap-4">
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
									loading="lazy"
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
	</div>
	<Pagination.Root count={total} perPage={pageSize} {page} {onPageChange}>
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
