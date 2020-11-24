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
import { vPhone, vNumber } from 'ea-common-gpi-pi';

const options: Option[] = [
	{ option: 'Número de teléfono', path: 'phone', validation: vPhone },
	{ option: 'Limite de comentarios', path: 'limit', validation: vNumber },
];

export default async (): Promise<void> => {
	let config: ExtractorConfig = {};
	const telegram = extractors.get('telegram-extractor');
	const file = await manageFileConfig(config);
	const back = true;
	while (back) {
		const displayOptions = options.map(({ option, path }, i) => ({
			N: i + 1,
			Opción: option,
			Valor: config[path],
		}));
		extractorInfo(telegram);
		selectableList(displayOptions);
		try {
			const nextAction = await termmOrBackOrExit('Ingrese opción');
			if (nextAction === 0) return;
			const newConfig = await askAndSaveOption(
				parseInt(nextAction),
				file,
				options,
				'telegram',
			);
			config = newConfig.telegram;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
