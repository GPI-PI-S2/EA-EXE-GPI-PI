import { backOrExit } from '@/helpers/input';
import { container } from 'tsyringe';
import { ExeDBController } from '../../controllers/DBController';
export default async (): Promise<void> => {
	const back = true;
	while (back) {
		try {
			console.clear();
			console.log(`
╔══════════════╗
║ Main > Stats ║ 
╚══════════════╝
`);
			const DBController = container.resolve<ExeDBController>('DBController');
			await DBController.connect();
			const stats = await DBController.stats();
			if (Object.entries(stats).length == 0) {
				console.log('No hay registros disponibles\n');
			} else {
				console.table(stats);
				await DBController.disconnect();
			}

			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
