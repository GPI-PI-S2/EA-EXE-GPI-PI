import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';
import { vUrl } from 'ea-common-gpi-pi'

async function getURL() {
	let url:string;
	while (!url) {
		const newUrl = await termmOrBackOrExit('Ingrese URL de la noticia');
		if (newUrl === 0) throw new Error('Invalid URL');
		const isValid = vUrl()(newUrl);
		if (typeof isValid === 'boolean') {
			url = newUrl;
		} else {
			console.error(isValid);
		}
	}
	console.log('URL: ', url);
	return url;
}

export default async (): Promise<void> => {
	const emol = extractors.get('emol-extractor');
	const back = true;
	while (back) {
		extractorInfo(emol);
		try {
			await emol.deploy();
			console.clear();
			const url = await getURL();
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
