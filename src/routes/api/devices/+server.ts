import { compose } from '$lib/server/endpoints';
import { withAuthProvider, withDeviceRepository } from '$lib/server/endpoints/dependencies';
import { withBodySchema } from '$lib/server/endpoints/validation';
import { endpoint_POST, postBodySchema } from './endpoint';

export const POST = compose(
	withAuthProvider(),
	withBodySchema(postBodySchema),
	withDeviceRepository(),
	endpoint_POST
);
