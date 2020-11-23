import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';

export default async (): Promise<void> => {
	const twitter = extractors.get('twitter-extractor');
	const back = true;
	while (back) {
		extractorInfo(twitter);
		const hashtag = await termmOrBackOrExit('Ingrese el término de búsqueda');
		if(hashtag === 0) return;
		try {
			console.clear();
			const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAJewJQEAAAAAPOlJ%2BAGXOMiIAG7dDUUtTaFAOgs%3DKLpEMQCsq33R2kwwnADok1ujE9v65o4eSf34m5b4yupPvGCi40';
			await twitter.deploy({ bearerToken });
			const result = await twitter.obtain({
				limit: 1000, 
				metaKey: hashtag
			})
			result.data.result.forEach((r) => {
				console.log('=>', r);
			})
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
