// @ts-nocheck
import type { PageLoad } from './$types';

export const load = async ({ fetch, url }: Parameters<PageLoad>[0]) => {
	const page = url.searchParams.get('page') ?? 1;
	const pageSize = url.searchParams.get('pageSize') ?? 3;
	const devices = await fetch(`/api/devices?page=${page}&pageSize=${pageSize}`).then((res) =>
		res.json()
	);

	return devices;
};
