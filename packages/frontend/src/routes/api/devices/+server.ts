import { compose } from '$lib/server/endpoints';
import {
	withAuthProvider,
	withDeviceRepository,
	withDeviceService,
	withListingRepository
} from '$lib/server/endpoints/dependencies';
import { withBodySchema, withQuerySchema } from '$lib/server/endpoints/validation';
import { endpoint_GET, endpoint_POST, postBodySchema, querySchema } from './endpoint';

export const GET = compose(
	withDeviceService(),
	withQuerySchema(querySchema),
	withListingRepository()
)(endpoint_GET);

export const POST = compose(
	withAuthProvider(),
	withBodySchema(postBodySchema),
	withDeviceRepository()
)(endpoint_POST);
