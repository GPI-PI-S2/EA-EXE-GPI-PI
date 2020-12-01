import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import { vPhone, vRangeBetween } from 'ea-common-gpi-pi';
import extractors from 'ea-core-gpi-pi';
import { Response } from 'ea-core-gpi-pi/dist/services/Extractor/Response';
import { Telegram } from 'ea-core-gpi-pi/dist/services/Telegram';
import { File } from '../../tools/File'

const config = { apiId: 1862196, apiHash: 'ecf4f984d701a3ee7a909d0c505d2df5' };	

type content = {
	phone: string;
	code: number;
	codeHash: string;
	auth: string;
};

async function login(extractor: Telegram) {
	const file = new File('telegramUser.json');
	let phone = '';
	let code = NaN;
	let codeHash = '';
	let auth = '';
	if (await file.exist()) {
		const content = (await file.read('object')) as content;
		phone = content['phone'];
		auth = content['auth'];
		console.log(phone);
	}
	while (!phone) {
		const iPhone = await termmOrBackOrExit('Ingrese un número de teléfono');
		if (iPhone === 0) return;
		const valid = vPhone()(iPhone);
		if (typeof valid === 'boolean') phone = iPhone;
		else console.debug('Error: login error', { valid });
	}
	console.log(phone)
	let response = await extractor.deploy(config, { phone });
	console.log(phone)
	console.log(response)
	if (response.status === Response.Status.PENDING) {
		const pendingResponse = response.data as Telegram.Deploy.PendingResponse;
		codeHash = pendingResponse.codeHash;
		while (isNaN(code) || code === null) {
			const iCode = await termmOrBackOrExit('Ingrese el código de verificación');
			if (iCode === 0) return;
			const intCode = parseInt(iCode);
			const valid = iCode.length > 4 && !isNaN(intCode);
			console.log(valid);
			console.log('ASDASD');
			if (!valid) {
				console.debug('Error: Código inválido');
				continue;
			}
			code = intCode
			response = await extractor.deploy(config, { phone, code, codeHash });
			if(response.status === Response.Status.OK) code = intCode;
			else console.info('Error: Codigo Invalido');
		}
		console.debug('SALI');
		await file.write({ auth, phone } as content);
	} else if (response.status === Response.Status.ERROR) throw new Error("can't continue");
	const content = (await file.read('object')) as content;
	await file.write({ ...content, ...{ auth, phone } } as content);
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
	const back = true;

	while (back) {
		extractorInfo(telegram);
		try {
			const loginResponse = await login(telegram);
			console.log('SALI DE LOGIN RESPONSE')
			console.log(loginResponse)
			const selectedChat = await selectChat(loginResponse.chats);
			const { accessHash, id, type } = selectedChat;
			const result = (await telegram.obtain({
				accessHash,
				type,
				chatId: id,
				limit: 1000,
				metaKey: JSON.stringify(selectedChat),
				minSentenceSize: 2,
			})) as Response<Telegram.Obtain.Response>;
			console.log(result);

			const nextAction = await backOrExit();
			if (nextAction === 0) return;
		} catch (error) {
			continue;
		}
		console.clear();
	}
};
