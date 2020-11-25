import { Analyzer, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { ServerDBAnalysis } from './Analysis';
import { ServerDBEntry } from './Entry';

export class ServerDBController implements DBController {
	constructor() {
		/*
				Acá inicializar la db.
				En caso de requerir métodos asíncronos, asignar la referencia acá
				 y crear un método asíncrono que la inicialice.
				 No usar promesas dentro del constructor
				 Cambiar el tipo unknown de la variable DB por el correspondiente
				*/
	}
	async connect(): Promise<void> {
		this.db = await open({
			filename: '../DB/LocalStore.db',
			driver: sqlite3.Database,
		});
		this.$entry = new ServerDBEntry(this.db, this.checkDBError);
		this.$analysis = new ServerDBAnalysis(this.db, this.checkDBError);
		await this.db.exec(`CREATE TABLE IF NOT EXISTS \`Entry\` (
  \`_id\` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  \`hash\` TEXT(256) NOT NULL,
  \`created\` TEXT(128) NOT NULL,
  \`extractor\` TEXT(128)NOT NULL,
  \`metaKey\` TEXT(256) NOT NULL,
  \`content\` TEXT(512) NULL,
  \`_deleted\` BOOLEAN NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS \`Entry_hash_IDX\` ON Entry (\`hash\`);
CREATE INDEX IF NOT EXISTS \`Entry_metaKey_IDX\` ON Entry (\`metaKey\`);

CREATE TABLE IF NOT EXISTS \`Analysis\` (
  \`_id\` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  \`_entryId\` INTEGER NOT NULL,
  \`Asertividad\` REAL NOT NULL DEFAULT 0,
  \`Autoconciencia Emocional\` REAL NOT NULL DEFAULT 0,
  \`Autoestima\` REAL NOT NULL DEFAULT 0,
  \`Colaboración y Cooperación\` REAL NOT NULL DEFAULT 0,
  \`Comprensión Organizativa\` REAL NOT NULL DEFAULT 0,
  \`Conciencia Crítica\` REAL NOT NULL DEFAULT 0,
  \`Desarrollo de las relaciones\` REAL NOT NULL DEFAULT 0,
  \`Empatía\` REAL NOT NULL DEFAULT 0,
  \`Influencia\` REAL NOT NULL DEFAULT 0,
  \`Liderazgo\` REAL NOT NULL DEFAULT 0,
  \`Manejo de conflictos\` REAL NOT NULL DEFAULT 0,
  \`Motivación de logro\` REAL NOT NULL DEFAULT 0,
  \`Percepción y comprensión Emocional\` REAL NOT NULL,
  \`Optimismo\` REAL NOT NULL DEFAULT 0,
  \`Relación Social\` REAL NOT NULL DEFAULT 0,
  \`Tolerancia a la frustración\` REAL NOT NULL DEFAULT 0,
  \`Violencia\` REAL NOT NULL DEFAULT 0,
  \`modelVersion\` TEXT(10) NOT NULL DEFAULT '0',
  \`_deleted\` BOOLEAN NOT NULL DEFAULT 0,
  \`completionDate\` TEXT(128) NOT NULL,
	CONSTRAINT \`Analysis\` FOREIGN KEY (\`_entryId\`) REFERENCES \`Entry\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE
);
`);
	}
	private db: Database;
	private readonly logger = container.resolve<Logger>('logger');
	$entry: DBEntry;
	$analysis: DBAnalysis;

	private readonly sentiments: Analyzer.sentiments = {
		Asertividad: NaN,
		'Autoconciencia Emocional': NaN,
		Autoestima: NaN,
		'Colaboración y Cooperación': NaN,
		'Comprensión Organizativa': NaN,
		'Conciencia Crítica': NaN,
		'Desarrollo de las relaciones': NaN,
		Empatía: NaN,
		Influencia: NaN,
		Liderazgo: NaN,
		'Manejo de conflictos': NaN,
		'Motivación de logro': NaN,
		Optimismo: NaN,
		'Percepción y comprensión Emocional': NaN,
		'Relación Social': NaN,
		'Tolerancia a la frustración': NaN,
		Violencia: NaN,
	};
	private checkDBError(res: unknown, info: string): void {
		if (!res) {
			this.logger.log('Internal DB Error on ', info);
			throw 'Internal DB Error';
		}
	}
	async calc(metakey: string): Promise<DBController.calcResult> {
		const sentimentsAVGSQL =
			'SELECT ' +
			Object.keys(this.sentiments)
				.map((sentiment) => `AVG(a.\`${sentiment}\`) as \`${sentiment}\``)
				.join(', ') +
			', COUNT (e._id) as `total` FROM Entry e, Analysis a WHERE a.`_entryId` = e.`_id` AND e.metaKey = ?;';

		const res = await this.db.get<Analyzer.sentiments & { total: number }>(
			sentimentsAVGSQL,
			metakey,
		);
		this.checkDBError(res, 'calc');
		const sentimentsAVG = { ...res };
		delete sentimentsAVG.total;
		return {
			sentiments: sentimentsAVG,
			total: res.total, // total registros
		};
	}
	async stats(): Promise<{ [key: string]: number }> {
		// cuantos reg hay por cada extractor
		const res = await this.db.all<{ total: number; metaKey: DBEntry.Entry['metaKey'] }[]>(
			'SELECT COUNT(_id) as `total`, metaKey  FROM Entry GROUP BY metaKey',
		);
		this.checkDBError(res, 'stats');
		return res.reduce(
			(stats, { total, metaKey }) => ({
				...stats,
				[metaKey]: total,
			}),
			{},
		);
	}
	async insert(analysis: Analyzer.Analysis): Promise<void> {
		// prioritaria
		const { result, metaKey, extractor, modelVersion } = analysis;

		for (const { input, sentiments } of result) {
			const { _id, replaced } = await this.$entry.create(
				{ metaKey, extractor, content: input.content },
				false,
			);
			if (!replaced) {
				await this.$analysis.create(
					{ ...sentiments, ...{ _entryId: _id, modelVersion } },
					false,
				);
			}
		}
	/**
	 * @deprecated Esta función no está disponible en el modo ejecutable
	 */
	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		return;
	}
}
