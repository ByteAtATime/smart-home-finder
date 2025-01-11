<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';

	let { data } = $props();

	// Format currency
	const formatCurrency = (value: number | null) => {
		if (value === null) return 'N/A';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
	};

	// Format date
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	};

	// Handle pagination
	const handlePageChange = (newPage: number) => {
		goto(`?page=${newPage}`);
	};

	// Calculate pagination info
	let totalPages = $derived(Math.ceil(data.listings.total / data.listings.pageSize));
	let pageNumbers = $derived(
		Array.from({ length: totalPages }, (_, i) => i + 1).filter(
			(num) => Math.abs(num - data.listings.page) <= 2 || num === 1 || num === totalPages
		)
	);
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Listings</h2>
			<p class="text-muted-foreground">Manage your device listings</p>
		</div>
		<Button href="/admin/listings/new">Add Listing</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Device</Table.Head>
					<Table.Head>Seller</Table.Head>
					<Table.Head>Price</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Stock</Table.Head>
					<Table.Head>Updated</Table.Head>
					<Table.Head class="w-[80px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.listings.items as listing}
					<Table.Row>
						<Table.Cell class="font-medium">{listing.deviceName}</Table.Cell>
						<Table.Cell>
							<a
								href={listing.url}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:underline"
							>
								{listing.sellerName}
							</a>
						</Table.Cell>
						<Table.Cell>{formatCurrency(listing.currentPrice)}</Table.Cell>
						<Table.Cell>
							<Badge variant={listing.isActive ? 'default' : 'secondary'}>
								{listing.isActive ? 'Active' : 'Inactive'}
							</Badge>
						</Table.Cell>
						<Table.Cell>
							<Badge variant={listing.inStock ? 'default' : 'destructive'}>
								{listing.inStock ? 'In Stock' : 'Out of Stock'}
							</Badge>
						</Table.Cell>
						<Table.Cell>{formatDate(listing.updatedAt)}</Table.Cell>
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
										<a href="/admin/listings/{listing.id}">Edit</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<a href="/admin/listings/{listing.id}/price">Update Price</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<form
											action="?/delete"
											method="POST"
											use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														// Refresh the page to show updated data
														goto(`?page=${data.listings.page}`, { invalidateAll: true });
													}
												};
											}}
										>
											<input type="hidden" name="id" value={listing.id} />
											<button type="submit" class="text-destructive w-full text-left">Delete</button
											>
										</form>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={data.listings.page === 1}
				onclick={() => handlePageChange(data.listings.page - 1)}
			>
				Previous
			</Button>

			{#each pageNumbers as pageNum}
				{#if pageNum !== pageNumbers[0] && pageNum - pageNumbers[pageNumbers.indexOf(pageNum) - 1] > 1}
					<Button variant="outline" size="sm" disabled>...</Button>
				{/if}
				<Button
					variant={pageNum === data.listings.page ? 'default' : 'outline'}
					size="sm"
					onclick={() => handlePageChange(pageNum)}
				>
					{pageNum}
				</Button>
			{/each}

			<Button
				variant="outline"
				size="sm"
				disabled={data.listings.page === totalPages}
				onclick={() => handlePageChange(data.listings.page + 1)}
			>
				Next
			</Button>
		</div>
	{/if}
</div>
