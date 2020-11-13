import { backOrExit, extractorInfo } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';

export default async (): Promise<void> => {
	const telegram = extractors.get('telegram-extractor');
	const back = true;
	while (back) {
		extractorInfo(telegram);
		try {
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
