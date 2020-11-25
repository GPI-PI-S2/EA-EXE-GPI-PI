import { Readline } from '@/tools/Readline';
import { Extractor } from 'ea-core-gpi-pi/dist/services/Extractor';
import { File } from '@/tools/File';

export function extractorInfo(extractor: Extractor): void {
	console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ name:\t\t${extractor.register.name}${extractor.register.name.length > 7 ? '' : '\t'}\t┃
┃ version:\t${extractor.register.version}\t\t┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛      
`);
}
export function selectableList<T extends { [key: string]: unknown }[]>(list: T): void {
	const content = list.reduce((acc: Record<string, unknown>, { N, ...x }) => {
		acc[N as string | number] = x;
		return acc;
	}, {});
	console.table(content);
	return;
}
export async function termmOrBackOrExit(question: string): Promise<0 | string> {
	try {
		console.log('ℹ️ <back> para volver, <exit para salir>\n');
		const response = await Readline.read(question);
		if (response === 'back') return 0;
		else if (response === 'exit') return process.exit(0);
		else return response;
	} catch (error) {
		throw new Error(error);
	}
}
export async function backOrExit(): Promise<0 | string> {
	try {
		const response = await Readline.read(
			'Ingrese <back> para volver, <exit> para salir o cualquier otra tecla para continuar',
		);
		if (response === 'back') return 0;
		else if (response === 'exit') return process.exit(0);
		else return 'ok';
	} catch (error) {
		throw new Error(error);
	}
}
export type Option = {
	option: string;
	path: string;
	isNumber?: boolean;
	validation?(options?: unknown): (option: string | number) => boolean | string;
};

export type ExtractorConfig = { [key: string]: unknown; limit?: number };
export type Config = {
	[key: string]: { [key: string]: unknown };
	telegram?: ExtractorConfig;
	emol?: ExtractorConfig;
	youtube?: ExtractorConfig;
	reddit?: ExtractorConfig;
	twitter?: ExtractorConfig;
};

export type ConfigType = 'telegram' | 'emol' | 'youtube' | 'reddit' | 'twitter' | 'root';

export async function askAndSaveOption(
	index: number,
	file: File,
	options: Option[],
	configType: ConfigType,
): Promise<Config> {
	const { option, validation, path, isNumber = false } = options[index - 1];
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
	let newContent = { ...currentContent };
	if (configType === 'root') {
		newContent = { ...currentContent, [path]: isNumber ? parseInt(result as string) : result };
	} else {
		newContent = {
			...currentContent,
			[configType]: {
				...currentContent[configType],
				[path]: isNumber ? parseInt(result as string) : result,
			},
		};
	}
	await file.write(newContent);
	return newContent;
}
