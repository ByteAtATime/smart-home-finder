<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PropertyData } from '@smart-home-finder/common/types';
	import type { ActionResult } from '@sveltejs/kit';

	let { data } = $props<{ properties: PropertyData[] }>();

	// Format date
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	};
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Properties</h2>
			<p class="text-muted-foreground">Manage device properties</p>
		</div>
		<Button href="/admin/properties/new">Add Property</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head>Unit</Table.Head>
					<Table.Head>Range</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Updated</Table.Head>
					<Table.Head class="w-[80px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.properties as property}
					<Table.Row>
						<Table.Cell class="font-medium">{property.name}</Table.Cell>
						<Table.Cell>
							<Badge variant="secondary">{property.type}</Badge>
						</Table.Cell>
						<Table.Cell>{property.unit || '—'}</Table.Cell>
						<Table.Cell>
							{#if property.type === 'int' || property.type === 'float'}
								{property.minValue ?? '—'} to {property.maxValue ?? '—'}
							{:else}
								—
							{/if}
						</Table.Cell>
						<Table.Cell class="max-w-[300px] truncate">
							{property.description || '—'}
						</Table.Cell>
						<Table.Cell>{formatDate(property.updatedAt)}</Table.Cell>
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
										<a href="/admin/properties/{property.id}">Edit</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<form
											action="?/delete"
											method="POST"
											use:enhance={() => {
												return async ({ result }: { result: ActionResult }) => {
													if (result.type === 'success') {
														// Refresh the page to show updated data
														goto('?', { invalidateAll: true });
													}
												};
											}}
										>
											<input type="hidden" name="id" value={property.id} />
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
</div>
