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

const options: Option[] = [];

export default async (): Promise<void> => {
	let config: ExtractorConfig = await getCurrentData('youtube');
	const youtube = extractors.get('youtube-extractor');
	const file = await manageFileConfig(config, 'youtube');
	let back = true;
	if (options.length === 0) {
		await termmOrBackOrExit('No hay opciones para este extractor');
		back = false;
	}
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
