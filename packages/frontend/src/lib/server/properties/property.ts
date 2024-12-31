import type { IPropertyRepository } from './types';
import type { PropertyData } from '@smart-home-finder/common/types';

export class Property {
	private _value: string | number | boolean | null = null;

	public constructor(
		private data: PropertyData,
		private repository: IPropertyRepository
	) {}

	public async getValueForDevice(deviceId: number): Promise<string | number | boolean | null> {
		if (this._value === null) {
			this._value = await this.repository.getPropertyValueForDevice(this.data.id, deviceId);
		}

		return this._value;
	}

	public get id(): string {
		return this.data.id;
	}

	public get name(): string {
		return this.data.name;
	}

	public get type(): 'string' | 'int' | 'float' | 'boolean' {
		return this.data.type;
	}

	public get unit(): string | null {
		return this.data.unit;
	}

	public get description(): string | null {
		return this.data.description;
	}

	public get createdAt(): Date {
		return this.data.createdAt;
	}

	public get updatedAt(): Date {
		return this.data.updatedAt;
	}

	public async toJson(deviceId?: number) {
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			unit: this.unit,
			description: this.description,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			value: deviceId ? await this.getValueForDevice(deviceId) : null
		};
	}
}
