import { File } from '@/tools/File';
import { Readline } from '@/tools/Readline';
import { Extractor } from 'ea-core-gpi-pi/dist/services/Extractor';

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
		console.log('ℹ️ <back> o <b> para volver, <exit> o <e> para salir\n');
		const response = await Readline.read(question);
		if (response === 'back' || response === 'b') return 0;
		else if (response === 'exit' || response === 'e') return process.exit(0);
		else return response;
	} catch (error) {
		throw new Error(error);
	}
}
export async function backOrExit(): Promise<0 | string> {
	try {
		const response = await Readline.read(
			'Ingrese <back> o <b> para volver, <exit> o <e> para salir o cualquier otra tecla para continuar',
		);
		if (response === 'back' || response === 'b') return 0;
		else if (response === 'exit' || response === 'e') return process.exit(0);
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

export type ExtractorConfig = {
	[key: string]: unknown;
	limit?: number;
	apiKey?: string;
	bearerToken?: string;
	phone?: string;
};
export type Config = {
	[key: string]: { [key: string]: unknown };
	telegram?: ExtractorConfig;
	emol?: ExtractorConfig;
	youtube?: ExtractorConfig;
	reddit?: ExtractorConfig;
	twitter?: ExtractorConfig;
};

export type ConfigType = 'telegram' | 'emol' | 'youtube' | 'reddit' | 'twitter' | 'root';

export type SentimentList = {
	[key: string]: number;
	asertividad: number;
	autoconciencia_emocional: number;
	autoestima: number;
	desarrollar_y_estimular_a_los_demas: number;
	empatia: number;
	autocontrol_emocional: number;
	influencia: number;
	liderazgo: number;
	optimismo: number;
	relacion_social: number;
	colaboracion_y_cooperacion: number;
	comprension_organizativa: number;
	conciencia_critica: number;
	desarrollo_de_las_relaciones: number;
	tolerancia_a_la_frustracion: number;
	comunicacion_asertiva: number;
	manejo_de_conflictos: number;
	motivacion_de_logro: number;
	percepcion_y_comprension_emocional: number;
	violencia: number;
};

export type SentimentType =
	| 'asertividad'
	| 'autoconciencia_emocional'
	| 'autoestima'
	| 'desarrollar_y_estimular_a_los_demas'
	| 'empatia'
	| 'autocontrol_emocional'
	| 'influencia'
	| 'liderazgo'
	| 'optimismo'
	| 'relacion_social'
	| 'colaboracion_y_cooperacion'
	| 'comprension_organizativa'
	| 'conciencia_critica'
	| 'desarrollo_de_las_relaciones'
	| 'tolerancia_a_la_frustracion'
	| 'comunicacion_asertiva'
	| 'manejo_de_conflictos'
	| 'motivacion_de_logro'
	| 'percepcion_y_comprension_emocional'
	| 'violencia';

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
