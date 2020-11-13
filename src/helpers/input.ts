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
