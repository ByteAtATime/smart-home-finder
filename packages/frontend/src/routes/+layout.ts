import { browser } from '$app/environment';
import posthog from 'posthog-js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (browser) {
		posthog.init('phc_Ck45ppHPayXUh3KaCz7dvTNqoDQVn7o9xjJRdovZTgO', {
			api_host: 'https://us.i.posthog.com',
			capture_pageview: false,
			capture_pageleave: false
		});
	}
};
