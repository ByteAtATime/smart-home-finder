<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import FeedbackButton from '$lib/components/FeedbackButton.svelte';

	interface NavItem {
		href: string;
		label: string;
		exact?: boolean;
	}

	let { data, children } = $props();

	const navItems = $state<NavItem[]>([
		{ href: '/admin', label: 'Dashboard', exact: true },
		{ href: '/admin/devices', label: 'Devices' },
		{ href: '/admin/listings', label: 'Listings' },
		{ href: '/admin/properties', label: 'Properties' },
		{ href: '/admin/users', label: 'Users' }
	]);

	$effect(() => {
		if (!data.user?.isAdmin) {
			throw new Error('Unauthorized');
		}
	});

	function isActive(href: string, exact = false): boolean {
		return exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

{#snippet navLink(item: NavItem)}
	<a
		href={item.href}
		class={cn(
			'hover:text-foreground/80 transition-colors',
			isActive(item.href, item.exact) ? 'text-foreground' : 'text-foreground/60'
		)}
	>
		{item.label}
	</a>
{/snippet}

<div class="bg-background min-h-screen">
	<header
		class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
	>
		<div class="container flex h-14 items-center">
			<div class="mr-4 flex">
				<a href="/admin" class="mr-6 flex items-center space-x-2">
					<span class="font-bold">Admin Dashboard</span>
				</a>
				<nav class="flex items-center space-x-6 text-sm font-medium">
					{#each navItems as item}
						{@render navLink(item)}
					{/each}
				</nav>
			</div>
			<div class="ml-auto flex items-center gap-4">
				<FeedbackButton />
				<Button variant="outline" href="/">Exit Admin</Button>
			</div>
		</div>
	</header>

	<main class="container py-6">
		{@render children?.()}
	</main>
</div>
