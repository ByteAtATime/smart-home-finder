import { deviceTypeEnum, protocolEnum } from './schema';

export const PROTOCOL_DISPLAY_NAMES: Record<(typeof protocolEnum.enumValues)[number], string> = {
	zwave: 'Z-Wave',
	zigbee: 'Zigbee',
	bluetooth: 'Bluetooth',
	wifi: 'WiFi'
};

export const DEVICE_TYPES: Record<(typeof deviceTypeEnum.enumValues)[number], string> = {
	light: 'Light',
	switch: 'Switch',
	plug: 'Plug'
};
