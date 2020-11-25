import { selectableList, termmOrBackOrExit } from '@/helpers/input';
import extractorsViews from './extractors';
import configViews from './config';
export default async (): Promise<void> => {
	const exit = false;
	const options = ['Extractores', 'Configuración', 'Sobre la app'].map((v, i) => ({
		N: i + 1,
		Opción: v,
	}));
	while (!exit) {
		console.clear();
		console.log(`
╔═══════════════════════╗
║ PROYECTO GPI PI       ║
║ SEGUNDO SEMESTRE 2020 ║
╚═══════════════════════╝
`);
		console.log('Selecciona una opción:\n');
		selectableList(options);
		const option = await termmOrBackOrExit('Ingrese el identificador');
		if (option === 0) return;
		switch (option) {
			case '1': {
				await extractorsViews();
				break;
			}
			case '2': {
				await configViews();
				break;
			}
			case '3': {
				console.log('No implementado 3');
				break;
			}
		}
	}
	return;
};
