import { DBAnalysis, DBController } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
export class ExeDBAnalysis implements DBAnalysis {
	constructor(private readonly db: unknown) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBAnalysis.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		return;
	}
	async read(_id: DBController.id): Promise<DBAnalysis.Analysis> {
		return;
	}
	async update(_id: DBController.id, entry: DBAnalysis.Input): Promise<void> {
		return;
	}
	async delete(_id: DBController.id): Promise<void> {
		return;
	}
}
