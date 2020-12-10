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
import { vNumber, vPhone } from 'ea-common-gpi-pi';

const options: Option[] = [
	//{ option: 'Autenticación', path: 'auth'},
	{ option: 'Número de teléfono', path: 'phone', validation: vPhone },
	{ option: 'Api ID', path: 'apiId', validation: vNumber },
	{ option: 'Api Hash', path: 'apiHash' },
];

export default async (): Promise<void> => {
	let config: ExtractorConfig = await getCurrentData('telegram');
	const telegram = extractors.get('telegram-extractor');
	const file = await manageFileConfig(config, 'telegram');
	let back = true;
	if (options.length === 0) {
		await termmOrBackOrExit('No hay opciones para este extractor');
		back = false;
	}
	while (back) {
		const displayOptions = options.map(({ option, path }, i=1) => ({
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
