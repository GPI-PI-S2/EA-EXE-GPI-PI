import { backOrExit } from '@/helpers/input';
import { container } from 'tsyringe';
import { ExeDBController } from '../../controllers/DBController';
export default async (): Promise<void> => {
	const back = true;
	while (back) {
		try {
			console.clear();
			const formattedStats: { [key: string]: { comments: number } } = {};
			const DBController = container.resolve<ExeDBController>('DBController');
			await DBController.connect();
			const stats = await DBController.stats();
			Object.entries(stats).map(([extractorId, comments]) => {
				formattedStats[extractorId] = { comments };
			});
			console.table(formattedStats);
			await DBController.disconnect();
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
