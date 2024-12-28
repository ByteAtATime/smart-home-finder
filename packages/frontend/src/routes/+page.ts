import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') ?? 1;
	const pageSize = url.searchParams.get('pageSize') ?? 3;
	const deviceType = url.searchParams.get('deviceType') ?? undefined;
	const protocol = url.searchParams.get('protocol') ?? undefined;

	const filterQuery = new URLSearchParams();
	if (deviceType) filterQuery.set('deviceType', deviceType);
	if (protocol) filterQuery.set('protocol', protocol);

	const devices = await fetch(
		`/api/devices?page=${page}&pageSize=${pageSize}&${filterQuery.toString()}`
	).then((res) => res.json());

	return devices;
};
