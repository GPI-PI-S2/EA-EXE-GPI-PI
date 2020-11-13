import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';
import { URL } from 'url';

function getParams(url: string): { subReddit: string; postId: string } {
	const cURL = new URL(url);
	const paths = cURL.pathname.split('/');
	if (paths.length != 7) throw new Error('Invalid URL');
	const subReddit = paths[2];
	const postId = paths[4];
	if (!subReddit || !postId) throw new Error('Invalid subreddit or postId');
	else return { postId, subReddit };
}
export default async (): Promise<void> => {
	const reddit = extractors.get('reddit-extractor');
	const back = true;
	while (back) {
		extractorInfo(reddit);
		const url = await termmOrBackOrExit('Ingrese la url');
		if (url === 0) return;
		try {
			console.clear();
			const { postId, subReddit } = getParams(url);
			await reddit.deploy();
			const result = await reddit.obtain({
				postId,
				subReddit,
				limit: 1000,
				metaKey: JSON.stringify({ subReddit, postId }),
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
