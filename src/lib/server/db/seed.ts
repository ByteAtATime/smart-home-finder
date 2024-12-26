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
			protocol: 'zigbee'
		})
		.returning();

	console.log('Inserting property');
	const [property] = await db
		.insert(schema.propertiesTable)
		.values({
			id: 'voltage',
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
