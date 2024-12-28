import { compose, withBodySchema, withRouteParams } from '$lib/server/endpoints';
import {
	withAuthProvider,
	withDeviceRepository,
	withDeviceService
} from '$lib/server/endpoints/dependencies';
import { endpoint_DELETE, endpoint_GET, endpoint_PATCH, patchBodySchema } from './endpoint';

export const GET = compose(withDeviceService(), withRouteParams())(endpoint_GET);

export const PATCH = compose(
	withAuthProvider(),
	withDeviceRepository(),
	withRouteParams(),
	withBodySchema(patchBodySchema)
)(endpoint_PATCH);

export const DELETE = compose(
	withAuthProvider(),
	withDeviceRepository(),
	withRouteParams()
)(endpoint_DELETE);
