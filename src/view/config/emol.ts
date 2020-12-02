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
	let config: ExtractorConfig = await getCurrentData('emol');
	const emol = extractors.get('emol-extractor');
	const file = await manageFileConfig(config, 'emol');
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
		extractorInfo(emol);
		selectableList(displayOptions);
		try {
			const nextAction = await termmOrBackOrExit('Ingrese opción');
			if (nextAction === 0) return;
			const newConfig = await askAndSaveOption(parseInt(nextAction), file, options, 'emol');
			config = newConfig.emol;
		} catch (error) {
			console.log(error);
			continue;
		}
		console.clear();
	}
};
