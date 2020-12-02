import { backOrExit } from '@/helpers/input';
import { container } from 'tsyringe';
import { ExeDBController } from '../../controllers/DBController';
export default async (): Promise<void> => {
	const back = true;
	while (back) {
		try {
			console.clear();
			const DBController = container.resolve<ExeDBController>('DBController');
			await DBController.connect();
			const stats = await DBController.stats();
			console.log(stats);
			await DBController.disconnect();
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
