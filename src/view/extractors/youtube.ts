import {
	backOrExit,
	ExtractorConfig,
	extractorInfo,
	selectableList,
	SentimentList,
	termmOrBackOrExit,
} from '@/helpers/input';
import { getCurrentData } from '@/tools/File';
import extractors from 'ea-core-gpi-pi';
import { URL } from 'url';

async function getVideoId(url: string) {
	const cURL = new URL(url);
	return cURL.searchParams.get('v');
}

export default async (): Promise<void> => {
	const youtube = extractors.get('youtube-extractor');
	let back = true;
	const { limit = 1000 }: ExtractorConfig = await getCurrentData('root');
	const config: ExtractorConfig = await getCurrentData('youtube');
	const apiKey = config?.apiKey;
	if (!apiKey) {
		back = false;
		await termmOrBackOrExit('Debe configurar API KEY primero');
	}
	// const apiKey = 'AIzaSyCbh7V9N99YuffN2s8xeu7MmfYS4l2I180';

	while (back) {
		extractorInfo(youtube);
		const urlVideo = await termmOrBackOrExit('Ingrese la url del video');
		if (urlVideo === 0) return;
		const videoId = await getVideoId(urlVideo);
		if (!videoId) return;

		try {
			console.clear();
			await youtube.deploy({ apiKey });
			const result = await youtube.obtain({
				metaKey: videoId,
				limit,
			});
			let n_inputs = 0;
			const prom_sentiments : SentimentList = {
				'asertividad': 0,
				'autoconciencia_emocional': 0,
				'autoestima': 0,
				'desarrollar_y_estimular_a_los_demas': 0,
				'empatia': 0,
				'autocontrol_emocional': 0,
				'influencia': 0,
				'liderazgo': 0,
				'optimismo': 0,
				'relacion_social': 0,
				'colaboracion_y_cooperacion': 0,
				'comprension_organizativa': 0,
				'conciencia_critica': 0,
				'desarrollo_de_las_relaciones': 0,
				'tolerancia_a_la_frustracion': 0,
				'comunicacion_asertiva': 0,
				'manejo_de_conflictos': 0,
				'motivacion_de_logro': 0,
				'percepcion_y_comprension_emocional': 0,
				'violencia': 0
			};
			result.data.result.forEach((input) => {
				n_inputs++;
				prom_sentiments['asertividad'] += input['sentiments']['asertividad'];
				prom_sentiments['autoconciencia_emocional'] += input['sentiments']['autoconciencia emocional'];
				prom_sentiments['autoestima'] += input['sentiments']['autoestima'];
				prom_sentiments['desarrollar_y_estimular_a_los_demas'] += input['sentiments']['desarrollar y estimular a los demás'];
				prom_sentiments['empatia'] += input['sentiments']['empatía'];
				prom_sentiments['autocontrol_emocional'] += input['sentiments']['autocontrol emocional'];
				prom_sentiments['influencia'] += input['sentiments']['influencia'];
				prom_sentiments['liderazgo'] += input['sentiments']['liderazgo'];
				prom_sentiments['optimismo'] += input['sentiments']['optimismo'];
				prom_sentiments['relacion_social'] += input['sentiments']['relación social'];
				prom_sentiments['colaboracion_y_cooperacion'] += input['sentiments']['colaboración y cooperación'];
				prom_sentiments['comprension_organizativa'] += input['sentiments']['comprensión organizativa'];
				prom_sentiments['conciencia_critica'] += input['sentiments']['conciencia crítica'];
				prom_sentiments['desarrollo_de_las_relaciones'] += input['sentiments']['desarrollo de las relaciones'];
				prom_sentiments['tolerancia_a_la_frustracion'] += input['sentiments']['tolerancia a la frustración'];
				prom_sentiments['comunicacion_asertiva'] += input['sentiments']['comunicacion asertiva'];
				prom_sentiments['manejo_de_conflictos'] += input['sentiments']['manejo de conflictos'];
				prom_sentiments['motivacion_de_logro'] += input['sentiments']['motivación de logro'];
				prom_sentiments['percepcion_y_comprension_emocional'] += input['sentiments']['percepción y comprensión emocional'];
				prom_sentiments['violencia'] += input['sentiments']['violencia'];
			});

			console.clear();
			console.log(`Resumen Análisis`);
			const displaySentiments = [];
			let i = 0;
			for (const prop in prom_sentiments) {
				prom_sentiments[prop] = parseFloat((prom_sentiments[prop]/n_inputs).toFixed(2));
				const sentiment = {
					N: i + 1,
					Sentimiento: prop,
					Valor_Promedio: prom_sentiments[prop]
				}
				displaySentiments.push(sentiment)
				i++;
			}			
			selectableList(displaySentiments);
			console.log(`Total de comentarios analizados: ${n_inputs}`);
			
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			console.log(error)
			continue;
		}
		console.clear();
	}
};
