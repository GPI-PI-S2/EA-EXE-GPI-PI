import {
	extractorInfo,
	selectableList,
	termmOrBackOrExit,
	askAndSaveOption,
	Option,
	ExtractorConfig,
} from '@/helpers/input';
import { getCurrentData, manageFileConfig } from '@/tools/File';
import extractors from 'ea-core-gpi-pi';
import { vNumber } from 'ea-common-gpi-pi';

const options: Option[] = [
	{ option: 'Limite de comentarios', path: 'limit', validation: vNumber, isNumber: true },
];

export default async (): Promise<void> => {
	let config: ExtractorConfig = await getCurrentData('reddit');
	const reddit = extractors.get('reddit-extractor');
	const file = await manageFileConfig(config, 'reddit');
	const back = true;
	while (back) {
		const displayOptions = options.map(({ option, path }, i) => ({
			N: i + 1,
			Opción: option,
			Valor: config[path],
		}));
		extractorInfo(reddit);
		selectableList(displayOptions);
		try {
			const nextAction = await termmOrBackOrExit('Ingrese opción');
			if (nextAction === 0) return;
			const newConfig = await askAndSaveOption(parseInt(nextAction), file, options, 'reddit');
			config = newConfig.reddit;
		} catch (error) {
			console.log(error);
			continue;
		}
		console.clear();
	}
};
