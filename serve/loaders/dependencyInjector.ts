import { container } from 'tsyringe';
import { ExeDBController } from '../../src/controllers/DBController';
import LoggerInstance from '../../src/loaders/logger';
export default async () => {
	container.register('logger', { useValue: LoggerInstance });
	container.register('DBController', { useValue: new ExeDBController() });
	return;
};
