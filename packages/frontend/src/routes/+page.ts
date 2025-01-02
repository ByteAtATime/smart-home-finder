import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') ?? 1;
	const pageSize = url.searchParams.get('pageSize') ?? 3;
	const deviceType = url.searchParams.get('deviceType') ?? undefined;
	const protocol = url.searchParams.get('protocol') ?? undefined;
	const priceBounds = url.searchParams.get('priceBounds') ?? undefined;

	const filterQuery = new URLSearchParams();
	filterQuery.set('page', page.toString());
	filterQuery.set('pageSize', pageSize.toString());
	if (deviceType) filterQuery.set('deviceType', deviceType);
	if (protocol) filterQuery.set('protocol', protocol);
	if (priceBounds) filterQuery.set('priceBounds', priceBounds);

	const devices = await fetch(`/api/devices?${filterQuery.toString()}`).then((res) => res.json());

	return devices;
};
