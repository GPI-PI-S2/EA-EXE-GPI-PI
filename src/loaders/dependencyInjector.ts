import { ExeDBController } from '@/controllers/DBController';
import { container } from 'tsyringe';
import LoggerInstance from './logger';

export default async (): Promise<void> => {
	container.register('logger', { useValue: LoggerInstance });
	container.register('DBController', { useValue: new ExeDBController() });
	return;
};
