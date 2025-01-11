<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto } from '$app/navigation';
	import { propertyTypeEnum } from '@smart-home-finder/common/schema';

	let { data } = $props();
	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				goto('/admin/properties');
			}
		},
		dataType: 'json'
	});

	$effect(() => {
		// Reset min/max values when type changes
		if ($form.type !== 'int' && $form.type !== 'float') {
			$form.minValue = null;
			$form.maxValue = null;
		}
	});
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Edit Property</h2>
		<p class="text-muted-foreground">Update property details</p>
	</div>

	<div class="mx-auto max-w-2xl">
		<form method="POST" class="space-y-6" use:enhance>
			<!-- Basic Info Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<!-- Property ID (read-only) -->
				<div class="space-y-2">
					<Label for="id">Property ID</Label>
					<Input
						type="text"
						id="id"
						name="id"
						bind:value={$form.id}
						readonly
						disabled
						aria-invalid={$errors.id ? 'true' : undefined}
					/>
					{#if $errors.id}
						<p class="text-destructive text-sm">{$errors.id}</p>
					{/if}
				</div>

				<!-- Name -->
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input
						type="text"
						id="name"
						name="name"
						bind:value={$form.name}
						placeholder="Voltage"
						aria-invalid={$errors.name ? 'true' : undefined}
					/>
					{#if $errors.name}
						<p class="text-destructive text-sm">{$errors.name}</p>
					{/if}
					<p class="text-muted-foreground text-sm">The display name for this property.</p>
				</div>

				<!-- Type -->
				<div class="space-y-2">
					<Label for="type">Type</Label>
					<select
						id="type"
						name="type"
						bind:value={$form.type}
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						aria-invalid={$errors.type ? 'true' : undefined}
					>
						<option value="">Select a type...</option>
						{#each propertyTypeEnum.enumValues as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
					{#if $errors.type}
						<p class="text-destructive text-sm">{$errors.type}</p>
					{/if}
				</div>

				<!-- Unit -->
				<div class="space-y-2">
					<Label for="unit">Unit</Label>
					<Input
						type="text"
						id="unit"
						name="unit"
						bind:value={$form.unit}
						placeholder="V"
						aria-invalid={$errors.unit ? 'true' : undefined}
					/>
					{#if $errors.unit}
						<p class="text-destructive text-sm">{$errors.unit}</p>
					{/if}
					<p class="text-muted-foreground text-sm">
						Optional unit for numeric values (e.g., V, W, °C).
					</p>
				</div>

				<!-- Description -->
				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						bind:value={$form.description}
						placeholder="Enter a description..."
						aria-invalid={$errors.description ? 'true' : undefined}
					/>
					{#if $errors.description}
						<p class="text-destructive text-sm">{$errors.description}</p>
					{/if}
				</div>

				<!-- Min/Max Values -->
				{#if $form.type === 'int' || $form.type === 'float'}
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="minValue">Minimum Value</Label>
							<Input
								type="number"
								id="minValue"
								name="minValue"
								bind:value={$form.minValue}
								step={$form.type === 'float' ? '0.01' : '1'}
								aria-invalid={$errors.minValue ? 'true' : undefined}
							/>
							{#if $errors.minValue}
								<p class="text-destructive text-sm">{$errors.minValue}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="maxValue">Maximum Value</Label>
							<Input
								type="number"
								id="maxValue"
								name="maxValue"
								bind:value={$form.maxValue}
								step={$form.type === 'float' ? '0.01' : '1'}
								aria-invalid={$errors.maxValue ? 'true' : undefined}
							/>
							{#if $errors.maxValue}
								<p class="text-destructive text-sm">{$errors.maxValue}</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<!-- Submit Button -->
			<div class="flex justify-end gap-4">
				<Button variant="outline" href="/admin/properties">Cancel</Button>
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}
						Saving...
					{:else}
						Save Changes
					{/if}
				</Button>
			</div>

			{#if $message}
				<p class="text-destructive text-sm">{$message}</p>
			{/if}
		</form>
	</div>
</div>
