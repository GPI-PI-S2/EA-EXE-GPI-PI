import { backOrExit, extractorInfo } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';

export default async (): Promise<void> => {
	const twitter = extractors.get('twitter-extractor');
	const back = true;
	while (back) {
		extractorInfo(twitter);
		try {
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
