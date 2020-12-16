import { File } from '@/tools/File';
import {
	arrayValidation,
	vEmail,
	vMax,
	vNumber,
	vPhone,
	vRangeBetween,
	vRequired,
} from 'ea-common-gpi-pi';

export class ConfigFile {
	private static file = new File('config.json');
	private static defaultFile: ConfigFile.Config = {
		apiKey: '',
		bearerToken: '',
		limit: 1000,
		phone: '',
		email: '',
	};
	private static validator: Record<keyof ConfigFile.Config, ConfigFile.fn[]> = {
		apiKey: [vRequired(), vMax(250)],
		bearerToken: [vRequired(), vMax(250)],
		limit: [vRequired(), vNumber(), vRangeBetween(1, 1000)],
		phone: [vRequired(), vPhone()],
		email: [vRequired(), vEmail()],
	};
	static async set<T extends keyof ConfigFile.Config>(
		key: T,
		value: ConfigFile.Config[T],
	): Promise<void> {
		const validations = arrayValidation(`${value}`, this.validator[key]);
		if (typeof validations === 'string') throw new Error(validations);
		let { apiKey, bearerToken, limit, email, phone } = (await this.file.read(
			'object',
		)) as ConfigFile.Config;
		const apiV = arrayValidation(apiKey, this.validator.apiKey);
		const bearerV = arrayValidation(bearerToken, this.validator.bearerToken);
		const limitV = arrayValidation(`${limit}`, this.validator.limit);
		const emailV = arrayValidation(`${email}`, this.validator.email);
		const phoneV = arrayValidation(`${phone}`, this.validator.phone);
		if (typeof emailV === 'string') {
			console.warn(`⚠️ Correo electrónico invalido, reestableciendo`);
			email = this.defaultFile.email;
		}
		if (typeof phoneV === 'string') {
			console.warn(`⚠️ Teléfono invalido, reestableciendo`);
			phone = this.defaultFile.phone;
		}
		if (typeof limitV === 'string') {
			console.warn(`⚠️ Tamaño máximo de muestra invalido, reestableciendo`);
			limit = this.defaultFile.limit;
		}
		if (typeof bearerV === 'string') {
			console.warn(`⚠️ bearerToken invalido, reestableciendo`);
			bearerToken = this.defaultFile.bearerToken;
		}
		if (typeof apiV === 'string') {
			console.warn(`⚠️ apiKey invalido, reestableciendo`);
			apiKey = this.defaultFile.apiKey;
		}
		const file = { ...this.defaultFile, ...{ apiKey, bearerToken, limit, phone, email } };
		file[key] = value;
		await this.file.write(file);
		return;
	}
	static async get(): Promise<ConfigFile.Config> {
		let { apiKey, bearerToken, limit, phone, email } = ConfigFile.defaultFile;
		const exist = await this.file.exist();
		if (exist) {
			const res = await this.file.read('object');
			if (res['apiKey']) apiKey = res['apiKey'];
			if (res['bearerToken']) bearerToken = res['bearerToken'];
			if (res['limit']) limit = res['limit'];
			if (res['phone']) phone = res['phone'];
			if (res['email']) email = res['email'];
		} else await this.file.write({ apiKey, bearerToken, limit, phone, email });
		const apiV = arrayValidation(apiKey, this.validator.apiKey);
		const bearerV = arrayValidation(bearerToken, this.validator.bearerToken);
		const limitV = arrayValidation(`${limit}`, this.validator.limit);
		const phoneV = arrayValidation(`${phone}`, this.validator.phone);
		const emailV = arrayValidation(`${email}`, this.validator.email);

		if (email != '' && typeof emailV === 'string') {
			console.warn(`⚠️ Correo electrónico invalido, reestableciendo`);
			email = this.defaultFile.email;
		}
		if (phone != '' && typeof phoneV === 'string') {
			console.warn(`⚠️ Teléfono invalido, reestableciendo`);
			phone = this.defaultFile.phone;
		}
		if (!Number.isNaN(limit) && typeof limitV === 'string') {
			console.warn(`⚠️ Tamaño máximo de muestra invalido, reestableciendo`);
			limit = this.defaultFile.limit;
		}
		if (bearerToken != '' && typeof bearerV === 'string') {
			console.warn(`⚠️ bearerToken invalido, reestableciendo`);
			bearerToken = this.defaultFile.bearerToken;
		}
		if (apiKey != '' && typeof apiV === 'string') {
			console.warn(`⚠️ apiKey invalido, reestableciendo`);
			apiKey = this.defaultFile.apiKey;
		}
		return {
			apiKey,
			bearerToken,
			limit,
			phone,
			email,
		};
	}
}
export namespace ConfigFile {
	export type fn = (input: string) => true | string;
	export interface Config {
		limit: number;
		apiKey: string;
		bearerToken: string;
		phone: string;
		email: string;
	}
}
