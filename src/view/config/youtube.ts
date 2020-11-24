import {
	extractorInfo,
	selectableList,
	termmOrBackOrExit,
	askAndSaveOption,
	Option,
	ExtractorConfig,
} from '@/helpers/input';
import { manageFileConfig } from '@/tools/File';
import extractors from 'ea-core-gpi-pi';
import { vNumber } from 'ea-common-gpi-pi';

const options: Option[] = [{ option: 'Limite de comentarios', path: 'limit', validation: vNumber }];

export default async (): Promise<void> => {
	let config: ExtractorConfig = {};
	const youtube = extractors.get('youtube-extractor');
	const file = await manageFileConfig(config);
	const back = true;
	while (back) {
		const displayOptions = options.map(({ option, path }, i) => ({
			N: i + 1,
			Opción: option,
			Valor: config[path],
		}));
		extractorInfo(youtube);
		selectableList(displayOptions);
		try {
			const nextAction = await termmOrBackOrExit('Ingrese opción');
			if (nextAction === 0) return;
			const newConfig = await askAndSaveOption(
				parseInt(nextAction),
				file,
				options,
				'youtube',
			);
			config = newConfig.youtube;
		} catch (error) {
			console.log(error);
			continue;
		}
		console.clear();
	}
};
