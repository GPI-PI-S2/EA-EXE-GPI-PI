import { backOrExit, extractorInfo } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';

export default async (): Promise<void> => {
	const reddit = extractors.get('reddit-extractor');
	const back = true;
	while (back) {
		extractorInfo(reddit);
		try {
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
