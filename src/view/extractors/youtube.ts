import {
	backOrExit,
	Config,
	ExtractorConfig,
	extractorInfo,
	termmOrBackOrExit,
} from '@/helpers/input';
import { getCurrentData } from '@/tools/File';
import extractors from 'ea-core-gpi-pi';
import { URL } from 'url';

async function getVideoId(url: string) {
	const cURL = new URL(url);
	return cURL.searchParams.get('v');
}

export default async (): Promise<void> => {
	const youtube = extractors.get('youtube-extractor');
	let back = true;
	const { limit = 1000 }: ExtractorConfig = await getCurrentData('root');
	const config: ExtractorConfig = await getCurrentData('youtube');
	const apiKey = config?.apiKey;
	if (!apiKey) {
		back = false;
		await termmOrBackOrExit('Debe configurar API KEY primero');
	}
	// const apiKey = 'AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180';

	while (back) {
		extractorInfo(youtube);
		const urlVideo = await termmOrBackOrExit('Ingrese la url del video');
		if (urlVideo === 0) return;
		const videoId = await getVideoId(urlVideo);
		if (!videoId) return;

		try {
			console.clear();
			await youtube.deploy({ apiKey });
			const result = await youtube.obtain({
				metaKey: videoId,
				limit,
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
