import 'reflect-metadata';
import logger from './loaders/logger';

async function main(): Promise<void> {
	try {
		await (await import('./loaders')).default();
		// ACá inicia
		logger.info('🆙 App iniciada!');
		await (await import('./view')).default();
		process.exit(0);
	} catch (error) {
		console.log('critial error');
		return process.exit(1);
	}
}
main();
