import { DBController, DBEntry } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
export class ExeDBEntry implements DBEntry {
	constructor(private readonly db: unknown) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBEntry.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		return;
	}
	async read(_id: DBController.id): Promise<DBEntry.Entry> {
		return;
	}
	async update(_id: DBController.id, entry: DBEntry.Input): Promise<void> {
		return;
	}
	async delete(_id: DBController.id): Promise<void> {
		return;
	}
	async list(
		paginator: DBController.Paginator,
		filter: DBEntry.Filter = {},
	): Promise<DBController.PaggedList<DBEntry.Entry>> {
		return;
	}
}
