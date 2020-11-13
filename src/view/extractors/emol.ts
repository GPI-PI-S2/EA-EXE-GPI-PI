import { backOrExit, extractorInfo } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';

export default async (): Promise<void> => {
	const emol = extractors.get('emol-extractor');
	const back = true;
	while (back) {
		extractorInfo(emol);
		try {
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
