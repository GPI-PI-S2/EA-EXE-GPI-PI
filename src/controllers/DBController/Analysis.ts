import { DBAnalysis, DBController } from 'ea-core-gpi-pi';
import { Database } from 'sqlite';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { objectPropSQL, objectPropWildcardSQL, objectWildcardSQL } from './SQLUtils';

export class ExeDBAnalysis implements DBAnalysis {
	constructor(
		private readonly db: Database,
		private checkDBError: (res: unknown, info: string) => void,
	) {}
	private readonly logger = container.resolve<Logger>('logger');
	async create(
		entry: DBAnalysis.Input,
		force: boolean,
	): Promise<{ _id: DBController.id; replaced?: boolean }> {
		if (!entry._entryId) throw new Error('Invalid _entryId');
		if (!this.db) throw new Error('no db instance');

		const checkPrev = await this.db.get<{ _id: DBController.id }>(
			'SELECT _id FROM Analysis WHERE _entryId = ?',
			[entry._entryId],
		);

		const today = new Date();
		entry.completionDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

		if (!checkPrev) {
			const propsSQL = objectPropSQL(entry);
			const wildcards = objectWildcardSQL(entry);
			const res = await this.db.run(
				`INSERT INTO Analysis ${propsSQL} VALUES ${wildcards};`,
				Object.values(entry),
			);

			this.checkDBError(res, 'Analysis create new');
			return { _id: res.lastID };
		} else {
			// Indica si realmente fue reemplazado la entry
			let replaced = false;
			if (force) {
				const newAnalysis = entry;
				delete newAnalysis._entryId;

				const propWildcard = objectPropWildcardSQL(newAnalysis);
				const res = await this.db.run(
					`UPDATE Analysis SET ${propWildcard} WHERE _id = ?;`,
					[...Object.values(newAnalysis), checkPrev._id],
				);

				this.checkDBError(res, 'Analysis force update');
				replaced = true;
			}
			return { _id: checkPrev._id, replaced };
		}
	}
	async read(_id: DBController.id): Promise<DBAnalysis.Analysis> {
		if (!this.db) throw new Error('no db instance');
		const res = await this.db.get<DBAnalysis.Analysis>(
			'SELECT * FROM Analysis WHERE _id = ? AND _deleted = 0;',
			[_id],
		);
		this.checkDBError(res, `Analysis read _id: ${_id}`);
		return res;
	}
	async update(_id: DBController.id, entry: DBAnalysis.Input): Promise<void> {
		if (!this.db) throw new Error('no db instance');
		this.logger.debug(`Updating Analysis, _id ${_id}`);
		const propWildcard = objectPropWildcardSQL(entry);
		const res = await this.db.run(`UPDATE Analysis SET ${propWildcard} WHERE _id = ?;`, [
			...Object.values(entry),
			_id,
		]);
		this.checkDBError(res, 'update Analysis');
		if (res.changes) {
			this.logger.debug('Analysis updated');
		} else {
			this.logger.error(`Id ${_id} NOT found, nothing to update`);
			throw `Empty result`;
		}
	}
	async delete(_id: DBController.id): Promise<void> {
		if (!this.db) throw new Error('no db instance');
		this.logger.debug(`Deleting Analysis, _id: ${_id}`);
		const res = await this.db.run('UPDATE Analysis SET _deleted = 1 WHERE _id = ?;', [_id]);
		this.checkDBError(res, 'Analysis delete');
		if (res.changes) {
			this.logger.debug('Analysis deleted');
		} else {
			this.logger.error(`Id ${_id} NOT found, nothing to delete`);
			throw `Empty result`;
		}
	}
}
