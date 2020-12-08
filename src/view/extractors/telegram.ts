import { backOrExit, ExtractorConfig, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import { vRangeBetween } from 'ea-common-gpi-pi';
import extractors from 'ea-core-gpi-pi';
import { Response } from 'ea-core-gpi-pi/dist/services/Extractor/Response';
import { Telegram } from 'ea-core-gpi-pi/dist/services/Telegram';
import { getCurrentData } from '../../tools/File'

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
				console.debug('Error: Código inválido');
				continue;
			}
			code = intCode
			response = await extractor.deploy({ apiId, apiHash }, { phone, code, codeHash });
			if(response.status === Response.Status.OK) code = intCode;
			else console.info('Error: Codigo Invalido');
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
	const apiId = config?.apiId;
	if (!apiId) {
		back = false;
		await termmOrBackOrExit('Debe configurar el Api ID primero');
	}

	// apiId = 1862196

	const apiHash = config?.apiHash;
	if (!apiHash) {
		back = false;
		await termmOrBackOrExit('Debe configurar Api Hash primero');
	}

	//  apiHash = 'ecf4f984d701a3ee7a909d0c505d2df5'


	while (back) {
		extractorInfo(telegram);
		try {
			const loginResponse = await login(telegram, phone, apiId, apiHash);
			const selectedChat = await selectChat(loginResponse.chats);
			const { accessHash, id, type } = selectedChat;
			const result = (await telegram.obtain({
				accessHash,
				type,
				chatId: id,
				limit,
				metaKey: JSON.stringify(selectedChat),
				minSentenceSize: 2,
			})) as Response<Telegram.Obtain.Response>;
			console.log(result.data)
			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
