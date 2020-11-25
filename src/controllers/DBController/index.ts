import { Analyzer, DBAnalysis, DBController, DBEntry } from 'ea-core-gpi-pi';
import { container } from 'tsyringe';
import { Logger } from 'winston';
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
	private db: unknown;
	private readonly logger = container.resolve<Logger>('logger');
	$entry: DBEntry;
	$analysis: DBAnalysis;
	async calc(metakey: string): Promise<DBController.calcResult> {
		return;
	}
	async stats(): Promise<{ [key: string]: number }> {
		return;
	}
	async insert(analysis: Analyzer.Analysis): Promise<void> {
		return;
	}
	/**
	 * @deprecated Esta función no está disponible en el modo ejecutable
	 */
	async bulkDB(dbPath: string): Promise<DBController.bulkDBResult> {
		return;
	}
}
