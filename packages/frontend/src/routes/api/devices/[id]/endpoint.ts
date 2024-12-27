import type { DeviceService } from '$lib/server/devices/service';
import type { EndpointHandler } from '$lib/server/endpoints';
import { json } from '@sveltejs/kit';

export const endpoint_GET: EndpointHandler<{
	deviceService: DeviceService;
	params: {
		id: string;
	};
}> = async ({ deviceService, params }) => {
	if (!params.id || !Number.isInteger(Number(params.id))) {
		return json({ success: false, error: 'Invalid device ID' }, { status: 400 });
	}

	const id = parseInt(params.id);

	const device = await deviceService.getDeviceWithPropertiesAndPrices(id);

	return json({
		success: true,
		device
	});
};
