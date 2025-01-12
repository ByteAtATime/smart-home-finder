<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { JsonEditor } from '$lib/components/ui/json-editor';

	interface Device {
		id: number;
		name: string;
	}

	interface Seller {
		id: number;
		name: string;
	}

	let { data } = $props();
	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				goto('/admin/listings');
			}
		},
		dataType: 'json'
	});

	let devicePopoverOpen = $state(false);
	let sellerPopoverOpen = $state(false);
	let deviceTriggerRef = $state<HTMLButtonElement>(null!);
	let sellerTriggerRef = $state<HTMLButtonElement>(null!);

	let selectedDevice = $derived(data.devices.find((d: Device) => d.id === $form.deviceId));
	let selectedSeller = $derived(data.sellers.find((s: Seller) => s.id === $form.sellerId));

	function closeDevicePopover() {
		devicePopoverOpen = false;
		deviceTriggerRef?.focus();
	}

	function closeSellerPopover() {
		sellerPopoverOpen = false;
		sellerTriggerRef?.focus();
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Add Listing</h2>
		<p class="text-muted-foreground">Add a new device listing to your catalog</p>
	</div>

	<div class="mx-auto max-w-2xl">
		<form method="POST" class="space-y-6" use:enhance>
			<!-- Basic Info Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<!-- Device Selection -->
				<div class="space-y-2">
					<Label for="device">Device</Label>
					<Popover.Root bind:open={devicePopoverOpen}>
						<Popover.Trigger bind:ref={deviceTriggerRef}>
							{#snippet child({ props }: { props: Record<string, unknown> })}
								<Button
									variant="outline"
									class="w-full justify-between"
									{...props}
									role="combobox"
									aria-expanded={devicePopoverOpen}
									aria-invalid={$errors.deviceId ? 'true' : undefined}
								>
									{selectedDevice?.name || 'Select a device...'}
									<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-full p-0">
							<Command.Root>
								<Command.Input placeholder="Search devices..." />
								<Command.List>
									<Command.Empty>No device found.</Command.Empty>
									<Command.Group>
										{#each data.devices as device}
											<Command.Item
												value={device.name}
												onSelect={() => {
													$form.deviceId = device.id;
													closeDevicePopover();
												}}
											>
												<Check
													class={cn(
														'mr-2 h-4 w-4',
														device.id === $form.deviceId ? 'opacity-100' : 'opacity-0'
													)}
												/>
												{device.name}
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					{#if $errors.deviceId}
						<p class="text-destructive text-sm">{$errors.deviceId}</p>
					{/if}
				</div>

				<!-- Seller Selection -->
				<div class="space-y-2">
					<Label for="seller">Seller</Label>
					<Popover.Root bind:open={sellerPopoverOpen}>
						<Popover.Trigger bind:ref={sellerTriggerRef}>
							{#snippet child({ props }: { props: Record<string, unknown> })}
								<Button
									variant="outline"
									class="w-full justify-between"
									{...props}
									role="combobox"
									aria-expanded={sellerPopoverOpen}
									aria-invalid={$errors.sellerId ? 'true' : undefined}
								>
									{selectedSeller?.name || 'Select a seller...'}
									<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-full p-0">
							<Command.Root>
								<Command.Input placeholder="Search sellers..." />
								<Command.List>
									<Command.Empty>No seller found.</Command.Empty>
									<Command.Group>
										{#each data.sellers as seller}
											<Command.Item
												value={seller.name}
												onSelect={() => {
													$form.sellerId = seller.id;
													closeSellerPopover();
												}}
											>
												<Check
													class={cn(
														'mr-2 h-4 w-4',
														seller.id === $form.sellerId ? 'opacity-100' : 'opacity-0'
													)}
												/>
												{seller.name}
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					{#if $errors.sellerId}
						<p class="text-destructive text-sm">{$errors.sellerId}</p>
					{/if}
				</div>

				<!-- URL Input -->
				<div class="space-y-2">
					<Label for="url">Listing URL</Label>
					<Input
						type="url"
						id="url"
						name="url"
						bind:value={$form.url}
						placeholder="https://example.com/product"
						aria-invalid={$errors.url ? 'true' : undefined}
					/>
					{#if $errors.url}
						<p class="text-destructive text-sm">{$errors.url}</p>
					{/if}
				</div>

				<!-- Initial Price -->
				<div class="space-y-2">
					<Label for="price">Initial Price</Label>
					<Input
						type="number"
						id="price"
						name="price"
						bind:value={$form.price}
						placeholder="0.00"
						step="0.01"
						min="0"
						aria-invalid={$errors.price ? 'true' : undefined}
					/>
					{#if $errors.price}
						<p class="text-destructive text-sm">{$errors.price}</p>
					{/if}
				</div>

				<!-- Stock Status -->
				<div class="space-y-2">
					<Label>Stock Status</Label>
					<div class="space-y-2">
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								name="inStock"
								value="true"
								id="in-stock"
								bind:group={$form.inStock}
							/>
							<Label for="in-stock">In Stock</Label>
						</div>
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								name="inStock"
								value="false"
								id="out-of-stock"
								bind:group={$form.inStock}
							/>
							<Label for="out-of-stock">Out of Stock</Label>
						</div>
					</div>
					{#if $errors.inStock}
						<p class="text-destructive text-sm">{$errors.inStock}</p>
					{/if}
				</div>

				<!-- Metadata Editor -->
				<div class="space-y-2">
					<JsonEditor
						bind:value={$form.metadata}
						error={$errors.metadata}
						label="Metadata (for scrapers)"
					/>
				</div>
			</div>

			<!-- Submit Button -->
			<div class="flex justify-end gap-4">
				<Button variant="outline" href="/admin/listings">Cancel</Button>
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}
						Creating...
					{:else}
						Create Listing
					{/if}
				</Button>
			</div>

			{#if $message}
				<p class="text-destructive text-sm">{$message}</p>
			{/if}
		</form>
	</div>
</div>
