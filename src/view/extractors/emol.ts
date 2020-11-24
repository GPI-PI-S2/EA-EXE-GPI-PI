import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';

export default async (): Promise<void> => {
	const emol = extractors.get('emol-extractor');
	const back = true;
	while (back) {
		extractorInfo(emol);
		const url = await termmOrBackOrExit('Ingrese la URL de la noticia');
		if (url === 0) return;
		try {
			console.clear();
			await emol.deploy();
			const result = await emol.obtain({
				limit: 1000,
				metaKey: url
			});
			result.data.result.forEach((r) => {
				console.log('=>', r);
			});
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
