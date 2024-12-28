import { reset } from 'drizzle-seed';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@smart-home-finder/common/schema';
import { variantsTable, variantOptionsTable, devicesTable } from '@smart-home-finder/common/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
	console.log('Resetting database');
	await reset(db, schema);

	console.log('Inserting device');
	const [device] = await db
		.insert(devicesTable)
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

	console.log('Inserting variant: Color');
	const [colorVariant] = await db
		.insert(variantsTable)
		.values({
			deviceId: device.id,
			name: 'Color'
		})
		.returning();

	console.log('Inserting variant options for Color');
	await db.insert(variantOptionsTable).values([
		{
			variantId: colorVariant.id,
			deviceId: device.id,
			value: 'Blue'
		},
		{
			variantId: colorVariant.id,
			deviceId: device.id,
			value: 'Red'
		}
	]);

	console.log('Inserting variant: Form Factor');
	const [formFactorVariant] = await db
		.insert(variantsTable)
		.values({
			deviceId: device.id,
			name: 'Form Factor'
		})
		.returning();

	console.log('Inserting variant options for Form Factor');
	await db.insert(variantOptionsTable).values([
		{
			variantId: formFactorVariant.id,
			deviceId: device.id,
			value: 'Compact'
		},
		{
			variantId: formFactorVariant.id,
			deviceId: device.id,
			value: 'Normal'
		}
	]);

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

	console.log('Inserting seller');
	const [seller] = await db
		.insert(schema.sellersTable)
		.values({
			name: 'Inovelli',
			website: 'https://inovelli.com'
		})
		.returning();

	console.log('Inserting device listing');
	await db.insert(schema.deviceListingsTable).values({
		deviceId: device.id,
		sellerId: seller.id,
		url: 'https://inovelli.com/collections/inovelli-blue-series/products/zigbee-matter-blue-series-smart-2-1-on-off-dimmer-switch'
	});

	console.log('Done');
}

main();
