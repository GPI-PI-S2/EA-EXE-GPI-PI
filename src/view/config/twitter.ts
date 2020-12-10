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

const options: Option[] = [{ option: 'Bearer Token', path: 'bearerToken' }];

export default async (): Promise<void> => {
	let config: ExtractorConfig = await getCurrentData('twitter');
	const twitter = extractors.get('twitter-extractor');
	const file = await manageFileConfig(config, 'twitter');
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
		extractorInfo(twitter);
		selectableList(displayOptions);
		try {
			const nextAction = await termmOrBackOrExit('Ingrese opción');
			if (nextAction === 0) return;
			const newConfig = await askAndSaveOption(
				parseInt(nextAction),
				file,
				options,
				'twitter',
			);
			config = newConfig.twitter;
		} catch (error) {
			console.log(error);
			continue;
		}
		console.clear();
	}
};
