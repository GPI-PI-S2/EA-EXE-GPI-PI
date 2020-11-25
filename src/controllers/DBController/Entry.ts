import MD5 from 'crypto-js/md5';
import { DBController, DBEntry } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { Database } from 'sqlite';

export class ServerDBEntry implements DBEntry {
	constructor(
		private readonly db: Database,
		private checkDBError: (res: unknown, info: string) => void,
	) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBEntry.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		entry.content = entry.content ? entry.content : '';
		entry.hash = MD5(entry.content).toString();

		const checkPrev = await this.db.get<{ _id: DBController.id }>(
			'SELECT _id FROM Entry WHERE hash = ?;',
			[entry.hash],
		);

		if (!checkPrev) {
			const res = await this.db.run('INSERT INTO Entry SET ?', [entry]);
			return { _id: res.lastID };
		} else {
			const existingId = checkPrev._id;
			// Indica si realmente fue reemplazado la entry
			let replaced = false;
			if (force) {
				const res = await this.db.run('UPDATE Entry SET ? WHERE _id = ?;', [
					entry,
					existingId,
				]);
				this.checkDBError(res, 'create, update existing Entry');
				replaced = true;
			}
			return { _id: existingId, replaced };
		}
	}
	async read(_id: DBController.id): Promise<DBEntry.Entry> {
		const res = await this.db.get<DBEntry.Entry>(
			'SELECT * FROM Entry WHERE _id = ? AND _deleted = 0;',
			[_id],
		);
		this.checkDBError(res, `Entry read _id: ${_id}`);
		return res;
	}
	async update(_id: DBController.id, entry: DBEntry.Input): Promise<void> {
		this.logger.info('Updating Entry, _id: ', _id);
		const res = await this.db.run('UPDATE Entry SET ? WHERE _id = ?;', [entry, _id]);
		this.checkDBError(res, 'update Entry');
		if (res.changes) {
			this.logger.info('Entry updated');
		} else {
			this.logger.error(`Id ${_id} NOT found, nothing to update`);
			throw `Empty result`;
		}
	}
	async delete(_id: DBController.id): Promise<void> {
		this.logger.info('Deleting Entry, _id: ', _id);
		const res = await this.db.run('UPDATE Entry SET _deleted = 1 WHERE _id = ?;', [_id]);
		this.checkDBError(res, 'Entry delete');
		if (res.changes) {
			this.logger.info('Entry deleted');
		} else {
			this.logger.error(`Id ${_id} NOT found, nothing to delete`);
			throw `Empty result`;
		}
	}
	async list(
		paginator: DBController.Paginator,
		filter: DBEntry.Filter = {},
	): Promise<DBController.PaggedList<DBEntry.Entry>> {
		// ojo, los filtros pueden llegar indefinidos
		const { created, extractor, metaKey } = filter;
		const filterArray = [
			{
				key: 'DATE(created) = DATE(?)',
				value: created,
			},
			{
				key: 'extractor = ?',
				value: extractor,
			},
			{
				key: 'metaKey = ?',
				value: metaKey,
			},
		].filter(({ value }) => value); // seleccionar filtros thruthy

		const SQLFilterKeys =
			(filterArray.length === 0 ? '' : ' AND ') +
			filterArray.map(({ key }) => key).join(' AND ');
		const SQLFilterValues: (boolean | string | number)[] = filterArray.map(
			({ value }) => value,
		);

		const pageOffset = paginator.page * paginator.size;
		const pageSQL = [paginator.size, pageOffset];

		const res = await this.db.all<DBEntry.Entry[]>(
			'SELECT _id, hash, created, extractor, metaKey, content FROM Entry WHERE _deleted = 0' +
				SQLFilterKeys +
				' LIMIT ? OFFSET ?;',
			SQLFilterValues.concat(pageSQL),
		);
		const totalRes = await this.db.get<{ total: number }>(
			'SELECT COUNT(_id) as total from Entry',
		);
		this.checkDBError(res && totalRes, 'list entry');
		return {
			list: res,
			page: paginator.page,
			size: res.length,
			total: totalRes.total,
		};
	}
}
