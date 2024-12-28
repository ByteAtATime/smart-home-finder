<script lang="ts">
	import { getCoreRowModel, getPaginationRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination';
	import { goto } from '$app/navigation';
	import Spinner from './Spinner.svelte';
	import type { DeviceWithDetails } from '@smart-home-finder/common/types';

	type DeviceTableProps = {
		devices: DeviceWithDetails[];
		total: number;
		page: number;
		pageSize: number;
		properties: string[];
	};

	let { devices, total, page, pageSize, properties }: DeviceTableProps = $props();

	let isLoading = $state(false);
	let spinnerPromise: Promise<unknown> | null = $state(null);

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- this makes it reactive
		page;

		isLoading = false;
		spinnerPromise = null;
	});

	const columns = [
		{
			header: 'Name',
			accessorKey: 'name'
		},
		{
			header: 'Device Type',
			accessorKey: 'deviceType'
		},
		{
			header: 'Protocol',
			accessorKey: 'protocol'
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
	<div>
		<div class="rounded-md border">
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
							<Table.Cell colspan={columns.length} class="h-24 text-center">
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
					isLoading = true;
					spinnerPromise = new Promise((resolve) => setTimeout(resolve, 125));
					goto(`?page=${p}&pageSize=${pageSize}`);
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

	{#if isLoading}
		{#await spinnerPromise then _}
			<div
				class="bg-background absolute inset-0 flex items-center justify-center bg-opacity-25 backdrop-blur-sm"
			>
				<Spinner class="stroke-foreground" />
			</div>
		{/await}
	{/if}
</div>
