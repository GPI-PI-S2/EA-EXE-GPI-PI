import {
	backOrExit,
	ExtractorConfig,
	extractorInfo,
	selectableList,
	SentimentList,
	termmOrBackOrExit,
} from '@/helpers/input';
import { vRangeBetween } from 'ea-common-gpi-pi';
import extractors from 'ea-core-gpi-pi';
import { Response } from 'ea-core-gpi-pi/dist/services/Extractor/Response';
import { Telegram } from 'ea-core-gpi-pi/dist/services/Telegram';
import { getCurrentData } from '../../tools/File';

async function login(extractor: Telegram, phone: string, apiId: number, apiHash: string) {
	let code = NaN;
	let codeHash = '';
	let response = await extractor.deploy({ apiId, apiHash }, { phone });
	if (response.status === Response.Status.PENDING) {
		const pendingResponse = response.data as Telegram.Deploy.PendingResponse;
		codeHash = pendingResponse.codeHash;
		while (isNaN(code) || code === null) {
			const iCode = await termmOrBackOrExit('Ingrese el código de verificación');
			if (iCode === 0) return;
			const intCode = parseInt(iCode);
			const valid = iCode.length > 4 && !isNaN(intCode);
			if (!valid) {
				console.log('Error: Código inválido');
				continue;
			}
			code = intCode;
			response = await extractor.deploy({ apiId, apiHash }, { phone, code, codeHash });
			if (response.status === Response.Status.OK) code = intCode;
			else console.log('Error: Codigo Invalido');
		}
	} else if (response.status === Response.Status.ERROR) throw new Error("can't continue");
	return response.data as Telegram.Deploy.Response;
}

async function selectChat(chats: Telegram.Deploy.chat[]) {
	console.info('\nChats\n');
	chats.forEach((chat, index) => console.log(` [${index + 1}]  (${chat.type}) - ${chat.name}`));
	const min = 1;
	const max = chats.length;
	let selected = '';
	while (!selected) {
		const userResponse = await termmOrBackOrExit('Seleccione el n° del chat');
		if (userResponse === 0) return;
		const valid = vRangeBetween(min, max)(userResponse);
		if (typeof valid === 'boolean') selected = userResponse;
		else console.debug('Error: selectChat', { valid });
	}
	return chats[Number(selected) - 1];
}

export default async (): Promise<void> => {
	const telegram = extractors.get('telegram-extractor');
	let back = true;
	const { limit = 1000 }: ExtractorConfig = await getCurrentData('root');
	const config: ExtractorConfig = await getCurrentData('telegram');
	const phone = config?.phone;
	if (!phone) {
		back = false;
		await termmOrBackOrExit('Debe configurar el teléfono primero');
	}
	const apiId = 1862196;
	// const apiId = config?.apiId;
	if (!apiId) {
		back = false;
		await termmOrBackOrExit('Debe configurar el Api ID primero');
	}

	const apiHash = 'ecf4f984d701a3ee7a909d0c505d2df5';
	// const apiHash = config?.apiHash;
	if (!apiHash) {
		back = false;
		await termmOrBackOrExit('Debe configurar Api Hash primero');
	}

	while (back) {
		extractorInfo(telegram);
		try {
			const loginResponse = await login(telegram, phone, apiId, apiHash);
			const selectedChat = await selectChat(loginResponse.chats);
			if (!selectedChat) {
				back = false;
			}
			const { accessHash, id, type } = selectedChat;
			const result = await telegram.obtain({
				accessHash,
				type,
				chatId: id,
				limit,
				metaKey: JSON.stringify(selectedChat),
				minSentenceSize: 2,
			});

			let n_inputs = 0;
			const prom_sentiments: SentimentList = {
				asertividad: 0,
				autoconciencia_emocional: 0,
				autoestima: 0,
				desarrollar_y_estimular_a_los_demas: 0,
				empatia: 0,
				autocontrol_emocional: 0,
				influencia: 0,
				liderazgo: 0,
				optimismo: 0,
				relacion_social: 0,
				colaboracion_y_cooperacion: 0,
				comprension_organizativa: 0,
				conciencia_critica: 0,
				desarrollo_de_las_relaciones: 0,
				tolerancia_a_la_frustracion: 0,
				comunicacion_asertiva: 0,
				manejo_de_conflictos: 0,
				motivacion_de_logro: 0,
				percepcion_y_comprension_emocional: 0,
				violencia: 0,
			};
			result.data.result.forEach((input) => {
				n_inputs++;
				prom_sentiments['asertividad'] += input['sentiments']['asertividad'];
				prom_sentiments['autoconciencia_emocional'] +=
					input['sentiments']['autoconciencia emocional'];
				prom_sentiments['autoestima'] += input['sentiments']['autoestima'];
				prom_sentiments['desarrollar_y_estimular_a_los_demas'] +=
					input['sentiments']['desarrollar y estimular a los demás'];
				prom_sentiments['empatia'] += input['sentiments']['empatía'];
				prom_sentiments['autocontrol_emocional'] +=
					input['sentiments']['autocontrol emocional'];
				prom_sentiments['influencia'] += input['sentiments']['influencia'];
				prom_sentiments['liderazgo'] += input['sentiments']['liderazgo'];
				prom_sentiments['optimismo'] += input['sentiments']['optimismo'];
				prom_sentiments['relacion_social'] += input['sentiments']['relación social'];
				prom_sentiments['colaboracion_y_cooperacion'] +=
					input['sentiments']['colaboración y cooperación'];
				prom_sentiments['comprension_organizativa'] +=
					input['sentiments']['comprensión organizativa'];
				prom_sentiments['conciencia_critica'] += input['sentiments']['conciencia crítica'];
				prom_sentiments['desarrollo_de_las_relaciones'] +=
					input['sentiments']['desarrollo de las relaciones'];
				prom_sentiments['tolerancia_a_la_frustracion'] +=
					input['sentiments']['tolerancia a la frustración'];
				prom_sentiments['comunicacion_asertiva'] +=
					input['sentiments']['comunicacion asertiva'];
				prom_sentiments['manejo_de_conflictos'] +=
					input['sentiments']['manejo de conflictos'];
				prom_sentiments['motivacion_de_logro'] +=
					input['sentiments']['motivación de logro'];
				prom_sentiments['percepcion_y_comprension_emocional'] +=
					input['sentiments']['percepción y comprensión emocional'];
				prom_sentiments['violencia'] += input['sentiments']['violencia'];
			});

			console.clear();
			console.log(`Resumen Análisis`);
			const displaySentiments = [];
			let i = 0;
			for (const prop in prom_sentiments) {
				prom_sentiments[prop] = parseFloat((prom_sentiments[prop] / n_inputs).toFixed(2));
				const sentiment = {
					N: i + 1,
					'Factor emocional': prop,
					'Valor promedio': prom_sentiments[prop],
				};
				displaySentiments.push(sentiment);
				i++;
			}
			selectableList(displaySentiments);
			console.log(`Total de comentarios analizados: ${n_inputs}`);

			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			console.log(error);
			continue;
		}
		console.clear();
	}
};
