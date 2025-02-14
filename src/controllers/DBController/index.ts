import axios from 'axios';
import { Anal, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import { list } from 'ea-ieom2-gpi-pi/dist/barrer';
import FormData from 'form-data';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { ConfigFile } from '../ConfigFile';
import { ExeDBAnalysis } from './Analysis';
import { ExeDBEntry } from './Entry';

export class ExeDBController implements DBController {
	constructor() {
		/*
				Acá inicializar la db.
				En caso de requerir métodos asíncronos, asignar la referencia acá
	y crear un método asíncrono que la inicialice.
				 No usar promesas dentro del constructor
				 Cambiar el tipo unknown de la variable DB por el correspondiente
				*/
	}
	async disconnect(): Promise<void> {
		if (!this.db) throw new Error('no db instance');
		await this.db.close();
	}
	async connect(): Promise<void> {
		this.db = await open({
			filename: 'LocalStore.db',
			driver: sqlite3.Database,
		});
		this.$entry = new ExeDBEntry(this.db, this.checkDBError);
		this.$analysis = new ExeDBAnalysis(this.db, this.checkDBError);
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
  \`asertividad\` REAL NOT NULL DEFAULT 0,
  \`autoconciencia emocional\` REAL NOT NULL DEFAULT 0,
  \`autoestima\` REAL NOT NULL DEFAULT 0,
  \`desarrollar y estimular a los demás\` REAL NOT NULL DEFAULT 0,
  \`empatía\` REAL NOT NULL DEFAULT 0,
  \`autocontrol emocional\` REAL NOT NULL DEFAULT 0,
  \`influencia\` REAL NOT NULL DEFAULT 0,
  \`liderazgo\` REAL NOT NULL DEFAULT 0,
  \`optimismo\` REAL NOT NULL DEFAULT 0,
  \`relación social\` REAL NOT NULL DEFAULT 0,
  \`colaboración y cooperación\` REAL NOT NULL DEFAULT 0,
  \`comprensión organizativa\` REAL NOT NULL DEFAULT 0,
  \`conciencia crítica\` REAL NOT NULL DEFAULT 0,
  \`desarrollo de las relaciones\` REAL NOT NULL DEFAULT 0,
  \`tolerancia a la frustración\` REAL NOT NULL DEFAULT 0,
  \`comunicacion asertiva\` REAL NOT NULL DEFAULT 0,
  \`manejo de conflictos\` REAL NOT NULL DEFAULT 0,
  \`motivación de logro\` REAL NOT NULL DEFAULT 0,
  \`percepción y comprensión emocional\` REAL NOT NULL DEFAULT 0,
  \`violencia\` REAL NOT NULL DEFAULT 0,
  \`modelVersion\` TEXT(10) NOT NULL DEFAULT '0',
  \`_deleted\` BOOLEAN NOT NULL DEFAULT 0,
  \`completionDate\` TEXT(128) NOT NULL,
	CONSTRAINT \`Analysis\` FOREIGN KEY (\`_entryId\`) REFERENCES \`Entry\`(\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE
);
`);
		this.logger.debug('DB ready');
	}
	private db: Database;
	private readonly logger = container.resolve<Logger>('logger');
	$entry: DBEntry;
	$analysis: DBAnalysis;

	private readonly sentiments: list = {
		asertividad: 0,
		'autoconciencia emocional': 0,
		autoestima: 0,
		'desarrollar y estimular a los demás': 0,
		empatía: 0,
		'autocontrol emocional': 0,
		influencia: 0,
		liderazgo: 0,
		optimismo: 0,
		'relación social': 0,
		'colaboración y cooperación': 0,
		'comprensión organizativa': 0,
		'conciencia crítica': 0,
		'desarrollo de las relaciones': 0,
		'tolerancia a la frustración': 0,
		'comunicacion asertiva': 0,
		'manejo de conflictos': 0,
		'motivación de logro': 0,
		'percepción y comprensión emocional': 0,
		violencia: 0,
	};
	private checkDBError(res: unknown, info: string): void {
		if (!res) {
			this.logger.error(`Internal DB Error on ${info}`);
			throw 'Internal DB Error';
		}
	}
	async calc(metakey: string): Promise<DBController.calcResult> {
		if (!this.db) throw new Error('no db instance');
		const sentimentsAVGSQL =
			'SELECT ' +
			Object.keys(this.sentiments)
				.map((sentiment) => `AVG(a.\`${sentiment}\`) as \`${sentiment}\``)
				.join(', ') +
			', COUNT (e._id) as `total` FROM Entry e, Analysis a WHERE a.`_entryId` = e.`_id` AND e.metaKey = ?;';

		const res = await this.db.get<list & { total: number }>(sentimentsAVGSQL, metakey);
		this.checkDBError(res, 'calc');
		const sentimentsAVG = { ...res };
		delete sentimentsAVG.total;
		return {
			sentiments: sentimentsAVG,
			total: res.total, // total registros
		};
	}
	async stats(): Promise<{ [key: string]: number }> {
		if (!this.db) throw new Error('no db instance');
		// cuantos reg hay por cada extractor
		const res = await this.db.all<{ total: number; extractor: DBEntry.Entry['extractor'] }[]>(
			'SELECT COUNT(_id) as `total`, extractor  FROM Entry GROUP BY extractor',
		);
		this.checkDBError(res, 'stats');
		return res.reduce(
			(stats, { total, extractor }) => ({
				...stats,
				[extractor]: total,
			}),
			{},
		);
	}
	async insert(analysis: Anal.Analysis): Promise<void> {
		if (!this.db) throw new Error('no db instance');
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
	}

	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		if (!this.db) throw new Error('no db instance');
		const { email } = await ConfigFile.get();
		if (!email) {
			throw new Error('Debe ingresar su correo en configuraciones');
		}
		const dbExists = existsSync(dbPath);
		if (!dbExists) throw new Error('No existe base de datos local');
		const formData = new FormData();
		const stream = createReadStream(dbPath);
		formData.append('db', stream);
		try {
			const response = await axios.post<{ data: DBController.bulkDBResult }>(
				'https://www.gpi.valdomero.live/dbcontroller/v1/bulk',
				formData,
				{
					params: { by: email },
					headers: {
						'X-API-KEY': 'prendalacamara',
						...formData.getHeaders(),
					},
					maxContentLength: Infinity,
					maxBodyLength: Infinity,
				},
			);
			if (response.status !== 200) throw new Error('problemas al subir la base de datos');
			const responseData = response.data;
			stream.unpipe();
			stream.destroy();
			stream.close();
			if (!process.platform.startsWith('win')) unlinkSync(dbPath);
			return responseData.data;
		} catch (error) {
			throw new Error(error);
		}
	}
}
