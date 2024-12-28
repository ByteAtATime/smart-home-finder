import { compose } from '$lib/server/endpoints';
import { withAuthProvider, withPropertyRepository } from '$lib/server/endpoints/dependencies';
import { withBodySchema, withRouteParams } from '$lib/server/endpoints/validation';
import {
	endpoint_DELETE,
	endpoint_GET,
	endpoint_PATCH,
	endpoint_POST,
	patchBodySchema,
	postBodySchema
} from './endpoint';

export const GET = compose(withPropertyRepository())(endpoint_GET);

export const POST = compose(
	withAuthProvider(),
	withBodySchema(postBodySchema),
	withPropertyRepository()
)(endpoint_POST);

export const PATCH = compose(
	withAuthProvider(),
	withPropertyRepository(),
	withRouteParams(),
	withBodySchema(patchBodySchema)
)(endpoint_PATCH);

export const DELETE = compose(
	withAuthProvider(),
	withPropertyRepository(),
	withRouteParams()
)(endpoint_DELETE);
