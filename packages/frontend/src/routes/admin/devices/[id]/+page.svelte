<script lang="ts">
	import { superForm, type ValidationErrors } from 'sveltekit-superforms/client';
	import { schema } from './schema';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card } from '$lib/components/ui/card';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Check, ChevronsUpDown, Plus, X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import type { Snippet } from 'svelte';
	import type { PropertyData } from '@smart-home-finder/common/types';
	import { z } from 'zod';

	interface Variant {
		variantId: number;
		variantName: string;
		deviceId: number;
		deviceName: string;
		optionValue: string | null;
	}

	let { data } = $props();
	const { form, errors, enhance, delayed } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				goto('/admin/devices');
			}
		},
		dataType: 'json'
	});

	let variantPopoverOpen = $state(false);
	let variantTriggerRef = $state<HTMLButtonElement>(null!);
	let selectedVariant = $state<Variant | null>(null);

	function onSelect(variant: Variant | null) {
		if (!variant) return;
		selectedVariant = variant;
		closeVariantPopover();
	}

	function closeVariantPopover() {
		variantPopoverOpen = false;
		variantTriggerRef?.focus();
	}

	function addVariant() {
		if (!selectedVariant) return;

		const existingVariant = $form.variants.find((v) => v.variantId === selectedVariant!.variantId);
		if (existingVariant) return;

		$form.variants = [
			...$form.variants,
			{
				variantId: selectedVariant.variantId,
				value: selectedVariant.optionValue ?? ''
			}
		];

		selectedVariant = null;
		closeVariantPopover();
	}

	function removeVariant(variantId: number) {
		$form.variants = $form.variants.filter((v) => v.variantId !== variantId);
	}

	function removeImage(index: number) {
		$form.images = $form.images.filter((_, i) => i !== index);
	}

	function addImage() {
		$form.images = [...$form.images, ''];
	}
</script>

{#snippet formField(
	id: string,
	label: string,
	errors: ValidationErrors<z.infer<typeof schema>>['_errors'],
	children: Snippet
)}
	<div class="space-y-2">
		<Label for={id}>{label}</Label>
		{@render children()}
		{#if errors}
			{#each errors as error}
				<p class="text-destructive text-sm">{error}</p>
			{/each}
		{/if}
	</div>
{/snippet}

{#snippet imageField(index: number)}
	<div class="flex gap-2">
		<Input type="url" bind:value={$form.images[index]} placeholder="Enter image URL" />
		<Button type="button" variant="destructive" size="icon" onclick={() => removeImage(index)}>
			<X class="h-4 w-4" />
		</Button>
	</div>
{/snippet}

{#snippet variantSelector()}
	<Popover.Root bind:open={variantPopoverOpen}>
		<Popover.Trigger bind:ref={variantTriggerRef}>
			{#snippet child({ props }: { props: Record<string, unknown> })}
				<Button
					variant="outline"
					class="w-full justify-between"
					{...props}
					role="combobox"
					aria-expanded={variantPopoverOpen}
				>
					{selectedVariant?.variantName || 'Select a variant...'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-full p-0">
			<Command.Root>
				<Command.Input placeholder="Search variants..." />
				<Command.List>
					<Command.Empty>No variant found.</Command.Empty>
					<Command.Group>
						{#each data.existingVariants as variant}
							<Command.Item value={variant.variantName} onSelect={() => onSelect(variant)}>
								<Check
									class={cn(
										'mr-2 h-4 w-4',
										selectedVariant && selectedVariant.variantId === variant.variantId
											? 'opacity-100'
											: 'opacity-0'
									)}
								/>
								{variant.variantName}
								{#if variant.deviceId && variant.deviceName}
									<span class="text-muted-foreground ml-2">(from {variant.deviceName})</span>
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
{/snippet}

{#snippet propertyField(property: PropertyData)}
	<div class="space-y-2">
		<Label for={property.id}>{property.name}</Label>
		{#if property.type === 'boolean'}
			<Select.Root
				bind:value={() => $form.properties[property.id]?.toString() ?? 'undefined',
				(newVal) => {
					$form.properties[property.id] = newVal == 'undefined' ? undefined : newVal === 'true';
				}}
				type="single"
			>
				<Select.Trigger class="w-full">
					{#if $form.properties[property.id] == undefined}
						<span class="text-muted-foreground">Not set</span>
					{:else}
						{$form.properties[property.id] ? 'True' : 'False'}
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="undefined" class="text-muted-foreground">Not set</Select.Item>
					<Select.Item value="true">True</Select.Item>
					<Select.Item value="false">False</Select.Item>
				</Select.Content>
			</Select.Root>
		{:else if property.type === 'int' || property.type === 'float'}
			<Input
				id={property.id}
				type="number"
				bind:value={$form.properties[property.id]}
				min={property.minValue}
				max={property.maxValue}
				step={property.type === 'int' ? 1 : 0.01}
			/>
		{:else}
			<Input id={property.id} type="text" bind:value={$form.properties[property.id]} />
		{/if}
		{#if property.unit}
			<p class="text-muted-foreground text-sm">Unit: {property.unit}</p>
		{/if}
		{#if property.description}
			<p class="text-muted-foreground text-sm">{property.description}</p>
		{/if}
	</div>
{/snippet}

<div class="container mx-auto max-w-screen-md p-4">
	<Card class="p-6">
		<div class="mb-6">
			<h2 class="text-2xl font-bold">Edit Device</h2>
			<p class="text-muted-foreground">Update device information, variants, and properties.</p>
		</div>

		<form method="POST" class="space-y-8" use:enhance>
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<div>
					{#snippet nameField()}
						<Input id="name" type="text" bind:value={$form.name} />
					{/snippet}
					{@render formField('name', 'Name', $errors.name, nameField)}
				</div>

				<div>
					{#snippet deviceTypeField()}
						<Select.Root bind:value={$form.deviceType} type="single">
							<Select.Trigger>
								{$form.deviceType ? DEVICE_TYPES[$form.deviceType] : 'Select a device type...'}
							</Select.Trigger>
							<Select.Content>
								{#each data.deviceTypes as type}
									<Select.Item value={type}>{DEVICE_TYPES[type]}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
					{@render formField('deviceType', 'Device Type', $errors.deviceType, deviceTypeField)}
				</div>

				<div>
					{#snippet protocolField()}
						<Select.Root bind:value={$form.protocol} type="single">
							<Select.Trigger>
								{$form.protocol ? PROTOCOL_DISPLAY_NAMES[$form.protocol] : 'Select a protocol...'}
							</Select.Trigger>
							<Select.Content>
								{#each data.protocols as protocol}
									<Select.Item value={protocol}>{PROTOCOL_DISPLAY_NAMES[protocol]}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
					{@render formField('protocol', 'Protocol', $errors.protocol, protocolField)}
				</div>

				<div>
					{#snippet imagesField()}
						<div class="space-y-2">
							{#each $form.images as _, i}
								{@render imageField(i)}
							{/each}
							<Button type="button" variant="outline" onclick={addImage}>
								<Plus class="mr-2 h-4 w-4" />
								Add Image
							</Button>
						</div>
					{/snippet}
					{@render formField('images', 'Images', $errors.images?._errors, imagesField)}
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-lg font-medium">Variants</h3>

				<div class="space-y-2">
					<Label>Add Variant</Label>
					{@render variantSelector()}
					<Button type="button" variant="secondary" onclick={addVariant}>Add Variant</Button>
				</div>

				<div class="space-y-2">
					{#each $form.variants as variant}
						{@const selectedVariant = data.existingVariants.find(
							(v) => v.variantId === variant.variantId
						)}
						{#if selectedVariant}
							<div class="flex items-center gap-2">
								<Input
									type="text"
									bind:value={variant.value}
									placeholder={`Enter value for ${selectedVariant.variantName}`}
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									onclick={() => removeVariant(variant.variantId)}
								>
									<X class="h-4 w-4" />
								</Button>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-lg font-medium">Properties</h3>
				<div class="grid gap-4">
					{#each data.properties as property}
						{@render propertyField(property)}
					{/each}
				</div>
			</div>

			<Button type="submit" disabled={$delayed}>
				{$delayed ? 'Saving...' : 'Save Changes'}
			</Button>
		</form>
	</Card>
</div>
