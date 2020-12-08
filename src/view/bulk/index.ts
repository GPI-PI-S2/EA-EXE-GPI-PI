import { backOrExit } from '@/helpers/input';
import { container } from 'tsyringe';
import { ExeDBController } from '../../controllers/DBController';
export default async (): Promise<void> => {
	try {
		console.clear();
		const DBController = container.resolve<ExeDBController>('DBController');
		await DBController.connect();
		console.log('⏳ Subiendo DB local...');
		await DBController.bulkDB(`LocalStore.db`);
		// TODO: Limpiar DB local
		console.log('✅ DB Sincronizada');
		await DBController.disconnect();
		const nextAction = await backOrExit();
		if (nextAction === 0) return;
	} catch (error) {
		console.log('⚠️ Falló la sincronización', error);
		await backOrExit();
	}
	console.clear();
};
