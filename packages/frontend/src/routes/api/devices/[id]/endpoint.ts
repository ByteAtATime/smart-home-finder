import type { IAuthProvider } from '$lib/server/auth/types';
import type { DeviceService } from '$lib/server/devices/service';
import type { IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import { updateDeviceSchema } from '@smart-home-finder/common/types';
import { json } from '@sveltejs/kit';
import type { z } from 'zod';

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

	const device = await deviceService.getDeviceWithVariantsAndProperties(id);

	if (!device) {
		return json({ success: false, error: 'Device not found' }, { status: 404 });
	}

	return json({
		success: true,
		device
	});
};

export const patchBodySchema = updateDeviceSchema;

export const endpoint_PATCH: EndpointHandler<{
	authProvider: IAuthProvider;
	deviceRepository: IDeviceRepository;
	params: { id: string };
	body: z.infer<typeof patchBodySchema>;
}> = async ({ authProvider, deviceRepository, params, body }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = Number(params.id);
	if (isNaN(deviceId)) {
		return json({ success: false, error: 'Invalid device ID' }, { status: 400 });
	}

	try {
		const updatedDevice = await deviceRepository.updateDevice(deviceId, body);
		if (!updatedDevice) {
			return json({ success: false, error: 'Device not found' }, { status: 404 });
		}

		return json({ success: true, device: updatedDevice });
	} catch (error) {
		console.error('Failed to update device:', error);
		return json({ success: false, error: 'Failed to update device' }, { status: 500 });
	}
};

export const endpoint_DELETE: EndpointHandler<{
	authProvider: IAuthProvider;
	deviceRepository: IDeviceRepository;
	params: { id: string };
}> = async ({ authProvider, deviceRepository, params }) => {
	if (!(await authProvider.isAdmin())) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = Number(params.id);
	if (isNaN(deviceId)) {
		return json({ success: false, error: 'Invalid device ID' }, { status: 400 });
	}

	try {
		const success = await deviceRepository.deleteDevice(deviceId);
		if (!success) {
			return json({ success: false, error: 'Device not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete device:', error);
		return json({ success: false, error: 'Failed to delete device' }, { status: 500 });
	}
};
