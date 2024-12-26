import type { IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { json } from '@sveltejs/kit';

export const endpoint_GET: EndpointHandler<{
	deviceRepository: IDeviceRepository;
	params: {
		id: string;
	};
}> = async ({ deviceRepository, params }) => {
	if (!params.id || !Number.isInteger(Number(params.id))) {
		return json({ success: false, error: 'Invalid device ID' }, { status: 400 });
	}

	const id = parseInt(params.id);

	const device = await deviceRepository.getDeviceById(id);
	const deviceProperties = await deviceRepository.getDeviceProperties(id);

	return json({
		success: true,
		device: { ...device, properties: deviceProperties }
	});
};
