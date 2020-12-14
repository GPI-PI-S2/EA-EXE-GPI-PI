import { ConfigFile } from '@/controllers/ConfigFile';
import { selectableList, termmOrBackOrExit } from '@/helpers/input';
import {
	arrayValidation,
	vEmail,
	vMax,
	vNumber,
	vPhone,
	vRangeBetween,
	vRequired,
} from 'ea-common-gpi-pi';
let cError = '';
const navEmail = `
╔═══════════════════════════════════════════╗
║ Main > Configuración > Correo electrónico ║ 
╚═══════════════════════════════════════════╝
`;
const navPhone = `
╔═════════════════════════════════╗
║ Main > Configuración > Teléfono ║ 
╚═════════════════════════════════╝
`;
const navLimit = `
╔═════════════════════════════════════════════╗
║ Main > Configuración > Tamaño de la muestra ║ 
╚═════════════════════════════════════════════╝
`;
const navBearer = `
╔═════════════════════════════════════════════╗
║ Main > Configuración > Twitter Bearer Token ║ 
╚═════════════════════════════════════════════╝
`;
const navApiKey = `
╔════════════════════════════════════════╗
║ Main > Configuración > Youtube Api Key ║ 
╚════════════════════════════════════════╝
`;
const nav = `
╔══════════════════════╗
║ Main > Configuración ║ 
╚══════════════════════╝
`;
export default async (): Promise<void> => {
	const exit = false;

	while (!exit) {
		console.clear();
		console.log(nav);

		const { apiKey, email, phone, bearerToken, limit } = await ConfigFile.get();
		const optionsValues = [email, phone, limit, bearerToken, apiKey];
		const options = [
			'Correo electrónico',
			'Teléfono',
			'Tamaño máximo de muestra',
			'Twitter bearer token',
			'Youtube Api key',
		].map((v, i) => ({
			N: i + 1,
			Opción: v,
			Valor: optionsValues[i] ? optionsValues[i] : 'No establecido',
		}));
		try {
			selectableList(options);
			if (cError) {
				console.log('\n❌' + cError + '\n');
				cError = '';
			}
			const index = await termmOrBackOrExit('Ingrese el identificador ');
			if (index === 0) return;
			switch (index) {
				case '1': {
					console.clear();
					console.log(navEmail);
					const email = await termmOrBackOrExit('Ingrese el correo electrónico');
					if (email === 0) return;
					const valid = arrayValidation(email, [vRequired(), vEmail()]);
					if (typeof valid === 'string') throw new Error(valid);
					await ConfigFile.set('email', email);
					break;
				}
				case '2': {
					console.clear();
					console.log(navPhone);
					const phone = await termmOrBackOrExit('Ingrese el número de teléfono');
					if (phone === 0) return;
					const valid = arrayValidation(phone, [vRequired(), vPhone()]);
					if (typeof valid === 'string') throw new Error(valid);
					await ConfigFile.set('phone', phone);
					break;
				}
				case '3': {
					console.clear();
					console.log(navLimit);
					const limit = await termmOrBackOrExit(
						'Ingrese el tamaño máximo de la muestra ',
					);
					if (limit === 0) return;
					const valid = arrayValidation(limit, [
						vRequired(),
						vNumber(),
						vRangeBetween(1, 1000),
					]);
					if (typeof valid === 'string') throw new Error(valid);
					await ConfigFile.set('limit', Number(limit));
					break;
				}
				case '4': {
					console.clear();
					console.log(navBearer);
					const bearerToken = await termmOrBackOrExit(
						'Ingrese el bearer token de Twitter',
					);
					if (bearerToken === 0) return;
					const valid = arrayValidation(bearerToken, [vRequired(), vMax(250)]);
					if (typeof valid === 'string') throw new Error(valid);
					await ConfigFile.set('bearerToken', bearerToken);
					break;
				}
				case '5': {
					console.clear();
					console.log(navApiKey);
					const apiKey = await termmOrBackOrExit('Ingrese la api key de youtube ');
					if (apiKey === 0) return;
					const valid = arrayValidation(apiKey, [vRequired(), vMax(250)]);
					if (typeof valid === 'string') throw new Error(valid);
					await ConfigFile.set('apiKey', apiKey);
					break;
				}
			}
		} catch (error) {
			const message = error.message ? error.message : 'Se ha producido un error';
			cError = message;
			continue;
		}
	}
};
