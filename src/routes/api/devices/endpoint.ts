import type { IAuthProvider } from '$lib/server/auth/types';
import { insertDeviceSchema, type IDeviceRepository } from '$lib/server/devices/types';
import type { EndpointHandler } from '$lib/server/endpoints';
import type { z } from 'zod';

export const postBodySchema = insertDeviceSchema;

export const endpoint_POST: EndpointHandler<{
	authProvider: IAuthProvider;
	deviceRepository: IDeviceRepository;
	body: z.infer<typeof postBodySchema>;
}> = async ({ authProvider, deviceRepository, body }) => {
	return new Response('ok');
};
