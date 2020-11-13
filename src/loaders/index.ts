import commander from './commander';
import dependencyInjectorLoader from './dependencyInjector';
import Logger from './logger';
export default async (): Promise<void> => {
	await dependencyInjectorLoader();
	await commander();
	Logger.verbose('✌️ Basic config loaded');
};
