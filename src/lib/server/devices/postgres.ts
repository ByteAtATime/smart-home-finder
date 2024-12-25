import { eq } from 'drizzle-orm';
import type { InsertDeviceSchema, SelectDeviceSchema, IDeviceRepository } from './types';
import { devicesTable } from '../db/schema';
import { db } from '../db';

export class PostgresDeviceRepository implements IDeviceRepository {
	async getDeviceById(id: number): Promise<SelectDeviceSchema | null> {
		const device = await db.query.devicesTable.findFirst({
			where: eq(devicesTable.id, id)
		});

		return device ?? null;
	}

	async insertDevice(device: InsertDeviceSchema): Promise<number> {
		const [newDevice] = await db.insert(devicesTable).values(device).returning();

		if (!newDevice) {
			throw new Error('Failed to insert device');
		}

		return newDevice.id;
	}
}
