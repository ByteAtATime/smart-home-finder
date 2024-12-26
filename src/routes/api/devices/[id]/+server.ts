import { compose, withRouteParams } from '$lib/server/endpoints';
import { withDeviceRepository } from '$lib/server/endpoints/dependencies';
import { endpoint_GET } from './endpoint';

export const GET = compose(withDeviceRepository(), withRouteParams())(endpoint_GET);
