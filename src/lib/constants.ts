import type { protocolEnum } from './server/db/schema';

export const PROTOCOL_DISPLAY_NAMES: Record<(typeof protocolEnum.enumValues)[number], string> = {
	zwave: 'Z-Wave',
	zigbee: 'Zigbee',
	bluetooth: 'Bluetooth',
	wifi: 'WiFi'
};
