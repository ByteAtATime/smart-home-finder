import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = 10;

	const response = await fetch(`/api/devices?page=${page}&pageSize=${pageSize}`);
	const data = await response.json();

	if (!data.success) {
		return {
			devices: {
				items: [],
				total: 0
			},
			page,
			pageSize
		};
	}

	return {
		devices: {
			items: data.devices,
			total: data.total
		},
		page,
		pageSize
	};
};

export const actions = {
	delete: async ({ fetch, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const response = await fetch(`/api/devices/${id}`, {
			method: 'DELETE'
		});

		const result = await response.json();

		if (!result.success) {
			return { success: false, error: result.error };
		}

		return { success: true };
	}
};
