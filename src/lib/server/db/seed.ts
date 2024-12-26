import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { reset } from 'drizzle-seed';

async function main() {
	const db = drizzle(process.env.DATABASE_URL!);

	console.log('Resetting database');
	await reset(db, schema);

	console.log('Inserting device');
	const [device] = await db
		.insert(schema.devicesTable)
		.values({
			name: 'Inovelli Smart Dimmer (Blue)',
			deviceType: 'switch',
			protocol: 'zigbee',
			images: [
				'https://inovelli.com/cdn/shop/files/Blue2-1-White_105d8571-c711-4ce3-9bea-a9eada21b052.jpg?v=1712609857&width=600',
				'https://inovelli.com/cdn/shop/products/Inovelli2-1SwitchBlueSeriesHero-VZM31-SN.png?v=1712609857&width=600',
				'https://inovelli.com/cdn/shop/products/Inovelli2-1SwitchBlueSeries-VZM31-SN.png?v=1712609857&width=600'
			]
		})
		.returning();

	console.log('Inserting property');
	const [property] = await db
		.insert(schema.propertiesTable)
		.values({
			id: 'voltage',
			name: 'Voltage',
			type: 'float',
			unit: 'V'
		})
		.returning();

	console.log('Inserting device property');
	await db.insert(schema.devicePropertiesTable).values({
		deviceId: device.id,
		propertyId: property.id,
		floatValue: 120
	});

	console.log('Done');
}

main();
