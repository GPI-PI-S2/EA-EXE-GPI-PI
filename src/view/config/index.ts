import { selectableList, termmOrBackOrExit } from '@/helpers/input';
import extractors from 'ea-core-gpi-pi';
import emolConfig from './emol';
import globalConfig from './global';
import redditConfig from './reddit';
import telegramConfig from './telegram';
import twitterConfig from './twitter';
import youtubeConfig from './youtube';

export default async (): Promise<void> => {
	const displayExtractors = extractors.availables.map((extractor, index) => ({
		N: index + 1,
		id: extractor.id,
		version: extractor.version,
		name: extractor.name,
	}));
	displayExtractors.push({
		N: displayExtractors.length + 1,
		name: 'Configuración global',
		id: 'global',
		version: '-',
	});
	const exit = false;
	while (!exit) {
		let extractorId = '';
		while (!extractorId) {
			console.clear();
			console.log(`
╔══════════════════════╗
║ Main > Configuración ║ 
╚══════════════════════╝
`);
			console.log('Selecciona un extractor:\n');
			selectableList(displayExtractors);
			const index = await termmOrBackOrExit('Ingrese el identificador ');
			if (index === 0) return;
			const e = extractors.availables[Number(index) - 1];
			const selectedOption = displayExtractors[Number(index) - 1];
			const isConfig = selectedOption && selectedOption.id === 'global';
			if (e || isConfig) {
				if (isConfig) extractorId = selectedOption.id;
				else extractorId = e.id;
			}
		}
		console.clear();
		switch (extractorId) {
			case 'telegram-extractor': {
				await telegramConfig();
				break;
			}
			case 'youtube-extractor': {
				await youtubeConfig();
				break;
			}
			case 'reddit-extractor': {
				await redditConfig();
				break;
			}
			case 'emol-extractor': {
				await emolConfig();
				break;
			}
			case 'twitter-extractor': {
				await twitterConfig();
				break;
			}
			case 'global': {
				await globalConfig();
				break;
			}
			default: {
				throw new Error('Configuración no disponible');
			}
		}
		console.log('Finished');
	}

	return process.exit(0);

	/* 	// Ejemplo de comandos por terminal;
	if (program.debug) console.log(program.opts());
	console.log('pizza details:');
	if (program.small) console.log('- small pizza size');
	if (program.pizzaType) console.log(`- ${program.pizzaType}`); */
};
