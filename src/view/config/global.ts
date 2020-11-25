import {
	selectableList,
	termmOrBackOrExit,
	askAndSaveOption,
	Option,
	ExtractorConfig,
} from '@/helpers/input';
import { getCurrentData, manageFileConfig } from '@/tools/File';
import { vNumber, vEmail } from 'ea-common-gpi-pi';

const options: Option[] = [
	{ option: 'Limite de comentarios', path: 'limit', validation: vNumber, isNumber: true },
	{ option: 'Correo institucional', path: 'email', validation: vEmail },
	{ option: 'Nombre completo', path: 'fullName' },
];

export default async (): Promise<void> => {
	let config: ExtractorConfig = await getCurrentData('root');
	const file = await manageFileConfig(config, 'root');
	const back = true;
	while (back) {
		const displayOptions = options.map(({ option, path }, i) => ({
			N: i + 1,
			Opción: option,
			Valor: config[path],
		}));
		selectableList(displayOptions);
		try {
			const nextAction = await termmOrBackOrExit('Ingrese opción');
			if (nextAction === 0) return;
			const newConfig = await askAndSaveOption(parseInt(nextAction), file, options, 'root');
			config = newConfig;
		} catch (error) {
			console.log(error);
			continue;
		}
		console.clear();
	}
};
