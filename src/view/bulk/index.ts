import { backOrExit } from '@/helpers/input';
import { existsSync } from 'fs';
import { container } from 'tsyringe';
import { ExeDBController } from '../../controllers/DBController';
const filename = 'LocalStore.db';
export default async (): Promise<void> => {
	try {
		console.clear();
		console.log(`
╔═════════════════╗
║ Main > Subir DB ║ 
╚═════════════════╝
`);
		const existDB = existsSync(filename);
		if (existDB) {
			const DBController = container.resolve<ExeDBController>('DBController');
			await DBController.connect();
			console.log('⏳ Subiendo DB local...');
			const result = await DBController.bulkDB(`LocalStore.db`);
			console.log('✅ DB Sincronizada\n');
			console.table(result);
			await DBController.disconnect();
		} else {
			console.log('No se encontró base de datos\n');
		}
		const nextAction = await backOrExit();
		if (nextAction === 0) return;
	} catch (error) {
		const message = error.message ? error.message : 'Error desconocido';
		console.log('❌ Falló la sincronización:', message);
		await backOrExit();
	}
	console.clear();
};
