import { compose, withRouteParams } from '$lib/server/endpoints';
import { withDeviceService } from '$lib/server/endpoints/dependencies';
import { endpoint_GET } from './endpoint';

export const GET = compose(withDeviceService(), withRouteParams())(endpoint_GET);
