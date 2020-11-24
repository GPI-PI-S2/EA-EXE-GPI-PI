import { isObject } from 'ea-common-gpi-pi';
import { ExtractorConfig } from '@/helpers/input';
import fs from 'fs';
export class File {
	constructor(private filepath: string) {}
	private rawContent: Buffer;
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
}

export async function manageFileConfig(config: ExtractorConfig): Promise<File> {
	const file = new File(`./config.json`);
	if (await file.exist()) {
		const content = await file.read('object');
		if (content.telegram) {
			config = content.telegram as ExtractorConfig;
		} else {
			config = { ...content, telegram: config };
		}
	} else {
		await file.write({ telegram: config });
	}
	return file;
}
