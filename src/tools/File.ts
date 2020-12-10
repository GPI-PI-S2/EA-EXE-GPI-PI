import { isObject } from 'ea-common-gpi-pi';
import { ConfigType, ExtractorConfig } from '@/helpers/input';
import fs, { ReadStream } from 'fs';
export class File {
	constructor(private filepath: string) {}
	private rawContent: Buffer;
	async get(): Promise<ReadStream> {
		return fs.createReadStream(this.filepath);
	}
	async exist(): Promise<boolean> {
		try {
			const response = await fs.promises.readFile(this.filepath);
			this.rawContent = response;
			return true;
		} catch (error) {
			return false;
		}
	}
	async read<T extends 'string' | 'object'>(
		as: T,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<T extends 'string' ? string : { [key: string]: any }> {
		let raw: Buffer;
		if (this.rawContent) raw = this.rawContent;
		else {
			try {
				raw = await fs.promises.readFile(this.filepath);
			} catch (error) {
				await this.write({});
				raw = await fs.promises.readFile(this.filepath);
			}
		}
		const content = raw.toString();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (as === 'string') return content as any;
		return JSON.parse(content);
	}
	async write(content: string | Record<string, unknown>): Promise<void> {
		if (isObject(content as Record<string, unknown>)) content = JSON.stringify(content);
		await fs.promises.writeFile(this.filepath, content as string);
		return;
	}
	async delete(): Promise<void> {
		try {
			fs.unlinkSync(this.filepath);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

export async function manageFileConfig(
	config: ExtractorConfig,
	configType: ConfigType,
): Promise<File> {
	const file = new File(`./config.json`);
	if (await file.exist()) {
		const content = await file.read('object');
		if (configType === 'root') {
			config = content;
		} else if (content[configType]) {
			config = content[configType] as ExtractorConfig;
		} else {
			config = { ...content, [configType]: config };
		}
	} else {
		let newConfig = {};
		if (configType === 'root') {
			newConfig = { ...config };
		} else {
			newConfig = { ...newConfig, [configType]: config };
		}
		await file.write(newConfig);
	}
	return file;
}

export async function getCurrentData(configType: ConfigType): Promise<ExtractorConfig> {
	const file = new File('./config.json');
	if (await file.exist()) {
		const content = await file.read('object');
		if (configType === 'root') return content as ExtractorConfig;
		if (configType in content) return content[configType] as ExtractorConfig;
		return {} as ExtractorConfig;
	}
	return {} as ExtractorConfig;
}
