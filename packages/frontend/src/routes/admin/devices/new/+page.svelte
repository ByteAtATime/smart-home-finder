<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { DEVICE_TYPES, PROTOCOL_DISPLAY_NAMES } from '@smart-home-finder/common/constants';
	import { goto } from '$app/navigation';
	import { Textarea } from '$lib/components/ui/textarea';

	interface VariantOption {
		variantId: number;
		value: string;
	}

	let { data } = $props();
	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				goto('/admin/devices');
			}
		},
		dataType: 'json'
	});

	// Helper to add a new variant
	function addVariant() {
		$form.variants = [
			...$form.variants,
			{
				variantId: 0,
				value: ''
			}
		];
	}

	// Helper to remove a variant
	function removeVariant(index: number) {
		$form.variants = $form.variants.filter((_, i) => i !== index);
	}

	// Helper to get unique variant names with their context
	const variantOptions = $derived(
		data.existingVariants.map((v) => ({
			id: v.variantId.toString(),
			name: v.variantName,
			deviceName: v.deviceName
		}))
	);

	// Helper to get existing values for a variant
	function getVariantValues(variantId: number) {
		return data.existingVariants
			.filter((v) => v.variantId === variantId && v.optionValue)
			.map((v) => v.optionValue)
			.filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
	}

	// Helper to handle variant selection
	function handleVariantSelect(variant: VariantOption, value: string) {
		variant.variantId = parseInt(value);
		variant.value = ''; // Reset value when variant type changes

		$form.variants = [...$form.variants];
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Add Device</h2>
		<p class="text-muted-foreground">Add a new device to your catalog</p>
	</div>

	<div class="mx-auto max-w-2xl">
		<form method="POST" class="space-y-6" use:enhance>
			<!-- Basic Info Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<!-- Name -->
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						bind:value={$form.name}
						aria-invalid={$errors.name ? 'true' : undefined}
					/>
					{#if $errors.name}
						<p class="text-destructive text-sm">{$errors.name}</p>
					{/if}
				</div>

				<!-- Device Type -->
				<div class="space-y-2">
					<Label for="deviceType">Device Type</Label>
					<Select.Root name="deviceType" type="single" bind:value={$form.deviceType}>
						<Select.Trigger id="deviceType" class="w-full">
							{$form.deviceType ? DEVICE_TYPES[$form.deviceType] : 'Select a device type'}
						</Select.Trigger>
						<Select.Content>
							{#each data.deviceTypes as type}
								<Select.Item value={type}>{DEVICE_TYPES[type]}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if $errors.deviceType}
						<p class="text-destructive text-sm">{$errors.deviceType}</p>
					{/if}
				</div>

				<!-- Protocol -->
				<div class="space-y-2">
					<Label for="protocol">Protocol</Label>
					<Select.Root name="protocol" type="single" bind:value={$form.protocol}>
						<Select.Trigger id="protocol" class="w-full">
							{$form.protocol ? PROTOCOL_DISPLAY_NAMES[$form.protocol] : 'Select a protocol'}
						</Select.Trigger>
						<Select.Content>
							{#each data.protocols as protocol}
								<Select.Item value={protocol}>{PROTOCOL_DISPLAY_NAMES[protocol]}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if $errors.protocol}
						<p class="text-destructive text-sm">{$errors.protocol}</p>
					{/if}
				</div>

				<!-- Images -->
				<div class="space-y-2">
					<Label for="images">Images (URLs, one per line)</Label>
					<Textarea
						id="images"
						name="images"
						placeholder="https://example.com/image.jpg"
						value={$form.images.join('\n')}
						oninput={(e) => {
							$form.images = e.currentTarget.value
								.split('\n')
								.map((url) => url.trim())
								.filter(Boolean);
						}}
						aria-invalid={$errors.images ? 'true' : undefined}
					/>
					{#if $errors.images}
						<p class="text-destructive text-sm">{$errors.images}</p>
					{/if}
				</div>
			</div>

			<!-- Variants Section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-medium">Variants</h3>
					<Button type="button" variant="outline" onclick={addVariant}>Add Variant</Button>
				</div>

				{#if $form.variants.length === 0}
					<p class="text-muted-foreground text-sm">
						No variants added. Click "Add Variant" to create variations of this device.
					</p>
				{:else}
					{#each $form.variants as variant, i}
						<div class="space-y-4 rounded-lg border p-4">
							<div class="flex items-center justify-between">
								<h4 class="font-medium">Variant {i + 1}</h4>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="text-destructive"
									onclick={() => removeVariant(i)}
								>
									Remove
								</Button>
							</div>

							<!-- Variant Type -->
							<div class="space-y-2">
								<Label for={`variants.${i}.variantId`}>Variant Type</Label>
								<Select.Root
									name={`variants.${i}.variantId`}
									type="single"
									value={variant.variantId.toString()}
									onValueChange={(value) => handleVariantSelect(variant, value)}
								>
									<Select.Trigger id={`variants.${i}.variantId`} class="w-full">
										{#if variant.variantId}
											{@const variantOption = variantOptions.find(
												(v) => v.id === variant.variantId.toString()
											)}
											{#if variantOption}
												<span>
													{variantOption.name}
													<span class="text-muted-foreground">
														({variantOption.deviceName})
													</span>
												</span>
											{:else}
												Select a variant type
											{/if}
										{:else}
											Select a variant type
										{/if}
									</Select.Trigger>
									<Select.Content>
										{#each variantOptions as option}
											<Select.Item value={option.id}>
												{option.name}
												<span class="text-muted-foreground ml-2">
													({option.deviceName})
												</span>
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								{#if $errors.variants?.[i]?.variantId}
									<p class="text-destructive text-sm">{$errors.variants[i].variantId}</p>
								{/if}
							</div>

							<!-- Variant Value -->
							<div class="space-y-2">
								<Label for={`variants.${i}.value`}>Value</Label>
								<Input
									name={`variants.${i}.value`}
									bind:value={variant.value}
									placeholder="e.g., Blue, Large"
									list={`values-${i}`}
								/>
								<datalist id={`values-${i}`}>
									{#each getVariantValues(variant.variantId) as value}
										<option {value}></option>
									{/each}
								</datalist>
								{#if $errors.variants?.[i]?.value}
									<p class="text-destructive text-sm">{$errors.variants[i].value}</p>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Submit Button -->
			<div class="flex justify-end gap-4">
				<Button variant="outline" href="/admin/devices">Cancel</Button>
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}
						Creating...
					{:else}
						Create Device
					{/if}
				</Button>
			</div>

			{#if $message}
				<p class="text-destructive text-sm">{$message}</p>
			{/if}
		</form>
	</div>
</div>
