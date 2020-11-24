import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';
import { URL } from 'url';

async function getVideoId(url: string) {
	const cURL = new URL(url);
	return cURL.searchParams.get('v');
}

export default async (): Promise<void> => {
	const youtube = extractors.get('youtube-extractor');
	const back = true;

	// Esto debería venir en un archivo config que se construirá en el menu Config
	// const apiKey = config.apiKey;
	const apiKey = 'AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180';

	while (back) {
		extractorInfo(youtube);
		const urlVideo = await termmOrBackOrExit('Ingrese la url del video')
		if (urlVideo === 0) return;
		const videoId = await getVideoId(urlVideo);
		if (!videoId) return;
		

		try {
			console.clear();
			await youtube.deploy({apiKey});
			const result = await youtube.obtain({
				// metaKey: videoId, limit: config.limit
				metaKey: videoId, limit: 5000
			});
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
