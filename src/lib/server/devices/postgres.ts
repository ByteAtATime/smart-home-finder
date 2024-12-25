import { eq } from 'drizzle-orm';
import type { Device, IDeviceRepository } from './types';
import { devicesTable } from '../db/schema';
import { db } from '../db';

export class PostgresDeviceRepository implements IDeviceRepository {
	constructor() {}

	async getDeviceById(id: number): Promise<Device | null> {
		const device = await db.query.devicesTable.findFirst({
			where: eq(devicesTable.id, id)
		});

		return device ?? null;
	}
}
