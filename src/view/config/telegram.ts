import { backOrExit, extractorInfo, selectableList, termmOrBackOrExit } from '@/helpers/input';
import { File } from '@/tools/File';
import extractors from 'ea-core-gpi-pi';
import { vPhone, vNumber } from 'ea-common-gpi-pi';

type config = {
	[index: string]: string | number;
	phone?: string;
	limit?: number;
};

type option = {
	option: string;
	path: string;
	validation(options?: unknown): (option: string | number) => boolean | string;
};

const options: option[] = [
	{ option: 'Número de teléfono', path: 'phone', validation: vPhone },
	{ option: 'Limite de comentarios', path: 'limit', validation: vNumber },
];
// TODO: Usar esta función de forma global para las otras vistas de configuraciones
async function askAndSaveOption(index: number, file: File): Promise<{ telegram: config }> {
	const { option, validation, path } = options[index - 1];
	const result = await termmOrBackOrExit(`Ingrese ${option}`);
	if (validation) {
		const isValid = validation()(result);
		if (typeof isValid !== 'boolean') {
			console.log(`Error: ${isValid}`);
			await backOrExit();
			return;
		}
	}
	const currentContent = await file.read('object');
	const newContent = {
		...currentContent,
		telegram: { ...currentContent.telegram, [path]: result },
	};
	await file.write(newContent);
	return newContent;
}

export default async (): Promise<void> => {
	let config: config;
	const telegram = extractors.get('telegram-extractor');
	const file = new File(`./config.json`);
	if (await file.exist()) {
		const content = await file.read('object');
		config = content.telegram as config;
	} else {
		config = {};
		await file.write({ telegram: config });
	}
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
			const newConfig = await askAndSaveOption(parseInt(nextAction), file);
			config = newConfig.telegram;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
