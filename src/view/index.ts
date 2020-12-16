import { selectableList, termmOrBackOrExit } from '@/helpers/input';
import aboutUsView from './about';
import bulkView from './bulk';
import bulkExtractors from './bulkExtractors';
import configViews from './config';
import extractorsViews from './extractors';
import statsViews from './stats';

export default async (): Promise<void> => {
	const exit = false;
	const options = [
		'Extractores',
		'Extractores bulk',
		'Stats',
		'Subir DB',
		'Sobre la app',
		'Configuración',
	].map((v, i) => ({
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
				await bulkExtractors();
				break;
			}
			case '3': {
				await statsViews();
				break;
			}
			case '4': {
				await bulkView();
				break;
			}
			case '5': {
				await aboutUsView();
				break;
			}
			case '6': {
				await configViews();
				break;
			}
		}
	}
	return;
};
