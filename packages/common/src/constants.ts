import type { protocolEnum } from '../../frontend/src/lib/server/db/schema';

export const PROTOCOL_DISPLAY_NAMES: Record<(typeof protocolEnum.enumValues)[number], string> = {
	zwave: 'Z-Wave',
	zigbee: 'Zigbee',
	bluetooth: 'Bluetooth',
	wifi: 'WiFi'
};
