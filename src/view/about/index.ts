import { backOrExit } from '@/helpers/input';

const aboutUs = {
	Proyecto: { descripción: 'Análisis de "Factor emocional"s en redes sociales' },
	Ramo: { descripción: 'Gestión de Proyectos Informáticos' },
	Semestre: { descripción: '2do semestres 2020' },
	'Profesor guía': { descripción: 'Doctor Oscar Magna' },
};
export default async (): Promise<void> => {
	const back = true;
	while (back) {
		try {
			console.clear();
			console.log(`
╔═════════════════════╗
║ Main > Sobre la app ║ 
╚═════════════════════╝
`);
			console.table(aboutUs);
			console.log('\n');
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
