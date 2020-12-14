/* eslint-disable no-case-declarations */
import { ConfigFile } from '@/controllers/ConfigFile';
import { backOrExit, extractorInfo, termmOrBackOrExit } from '@/helpers/input';
import { File } from '@/tools/File';
import { arrayValidation, vMax, vNoWhitespaces, vRequired, vUrl } from 'ea-common-gpi-pi';
import extractors from 'ea-core-gpi-pi';
import { readdir } from 'fs';
import { URL } from 'url';
let cError = '';
const nav = `
╔════════════════════════╗
║ Main > Bulk Extractors ║ 
╚════════════════════════╝`;

namespace BulkExtractors {
	export type extractors = Parameters<typeof extractors.get>[0];
	export type File = {
		terms: Term[];
	};
	export type Term = {
		metakey: string;
		extractor: extractors;
		ok: boolean;
	};
	export type parsedTerm = Term & { index: number };
}
function findFile(): Promise<string> {
	return new Promise((r) => {
		readdir(process.cwd(), (err, files) => {
			if (err) {
				return r('');
			}
			const file = files.find((file) => file.endsWith('.gpi'));
			if (!file) return r('');
			else return r(file);
		});
	});
}
export default async (): Promise<void> => {
	const back = true;
	const filename = await findFile();
	const file = new File(filename);
	const { limit, bearerToken, apiKey } = await ConfigFile.get();
	while (back) {
		try {
			console.clear();
			console.log(nav + '\n');
			if (cError) {
				console.log('❌' + cError + '\n');
				await backOrExit();
				return;
			}
			if (!bearerToken) throw new Error('Debe configurar Bearer Token primero');
			if (!apiKey) throw new Error('Debe configurar la api key primero');
			const exist = await file.exist();
			if (!exist) throw new Error('No se encontro contenedor');

			const content = (await file.read('object')) as BulkExtractors.File;
			if (!content || !content.terms || !Array.isArray(content.terms))
				throw new Error('Tipo de archivo inválido');

			const twitterMetas: BulkExtractors.parsedTerm[] = [];
			const redditMetas: BulkExtractors.parsedTerm[] = [];
			const youtubeMetas: BulkExtractors.parsedTerm[] = [];
			const emolMetas: BulkExtractors.parsedTerm[] = [];
			content.terms
				.filter((term) => !term.ok)
				.forEach((term, index) => {
					let valid: string | boolean = '';
					switch (term.extractor) {
						case 'twitter-extractor':
							valid = arrayValidation(term.metakey, [
								vRequired(),
								vMax(30),
								vNoWhitespaces(),
							]);
							if (typeof valid === 'string') {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a: ${valid}\n`,
								);
								return;
							} else twitterMetas.push({ ...term, ...{ index: index } });
							break;
						case 'emol-extractor':
							valid = arrayValidation(term.metakey, [vRequired(), vUrl()]);
							if (typeof valid === 'string') {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a: ${valid}\n`,
								);
								return;
							}
							const emolUrl = new URL(term.metakey);
							if (!emolUrl.origin.includes('emol.com')) {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a que no pertence a EMOL\n`,
								);
								return;
							}
							emolMetas.push({ ...term, ...{ index: index } });
							break;
						case 'reddit-extractor':
							valid = arrayValidation(term.metakey, [vRequired(), vUrl()]);
							if (typeof valid === 'string') {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a: ${valid}\n`,
								);
								return;
							}
							const redditUrl = new URL(term.metakey);
							const paths = redditUrl.pathname.split('/');
							if (paths.length != 7) {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a que la URL no es válida\n`,
								);
								return;
							}
							const subReddit = paths[2];
							const postId = paths[4];
							if (!redditUrl.origin.includes('reddit.com')) {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a que no pertence a Reddit\n`,
								);
								return;
							}
							if (!subReddit || !postId) {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a que la URL no es válida\n`,
								);
								return;
							}
							redditMetas.push({ ...term, ...{ index: index } });
							break;
						case 'youtube-extractor':
							valid = arrayValidation(term.metakey, [vRequired(), vUrl()]);
							if (typeof valid === 'string') {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a: ${valid}\n`,
								);
								return;
							}
							const youtubeUrl = new URL(term.metakey);
							if (!youtubeUrl.searchParams.get('v')) {
								console.log(
									`⚠️ Término inválido: ${term.metakey}\nDebido a que el id no es válido\n`,
								);
								return;
							}
							youtubeMetas.push({ ...term, ...{ index: index } });
							break;
					}
					return;
				});
			console.log('Entradas válidas:');
			console.table({
				Twitter: twitterMetas.length,
				EMOL: emolMetas.length,
				Youtube: youtubeMetas.length,
				Reddit: redditMetas.length,
			});
			console.log(
				'Total: ',
				twitterMetas.length + emolMetas.length + youtubeMetas.length + redditMetas.length,
			);
			console.log('\n');
			const nextAction = await termmOrBackOrExit('¿Iniciar extracción? <yes> o <no> ');
			if (nextAction === 0) return;
			if (nextAction != 'yes' && nextAction != 'y') return;

			const emol = extractors.get('emol-extractor');
			extractorInfo(emol);
			await emol.deploy();
			for (let x = 0; x < emolMetas.length; x++) {
				const metaKey = emolMetas[x].metakey;
				console.log(`Obteniendo comentarios de: ${metaKey}`);
				try {
					const response = await emol.obtain({ limit, metaKey });
					if (response.isError) {
						console.log('❌ Problemas al obtener los comentarios\n');
						continue;
					}
					const data = response.data;
					content.terms[emolMetas[x].index].ok = true;
					console.log(`Comentarios analizados: ${data.result.length}\n`);
					await file.write({ terms: content.terms });
				} catch (error) {
					console.log('❌ Problemas al obtener los comentarios\n');
				}
			}

			const reddit = extractors.get('reddit-extractor');
			extractorInfo(reddit);
			await reddit.deploy();
			for (let x = 0; x < redditMetas.length; x++) {
				const url = redditMetas[x].metakey;
				const cURL = new URL(url);
				const paths = cURL.pathname.split('/');
				const subReddit = paths[2];
				const postId = paths[4];
				console.log(`Obteniendo comentarios de: ${url}`);
				try {
					const response = await reddit.obtain({
						limit,
						metaKey: JSON.stringify({ postId, subReddit }),
						postId,
						subReddit,
					});
					if (response.isError) {
						console.log('❌ Problemas al obtener los comentarios\n');
						continue;
					}
					const data = response.data;
					content.terms[redditMetas[x].index].ok = true;
					console.log(`Comentarios analizados: ${data.result.length}\n`);
					await file.write({ terms: content.terms });
				} catch (error) {
					console.log('❌ Problemas al obtener los comentarios\n');
				}
			}

			const twitter = extractors.get('twitter-extractor');
			extractorInfo(twitter);
			await twitter.deploy({ bearerToken });
			for (let x = 0; x < twitterMetas.length; x++) {
				const metaKey = twitterMetas[x].metakey;
				console.log(`Obteniendo comentarios en base a : ${metaKey}`);
				try {
					const response = await twitter.obtain({ limit, metaKey });
					if (response.isError) {
						console.log('❌ Problemas al obtener los comentarios\n');
						continue;
					}
					const data = response.data;
					content.terms[twitterMetas[x].index].ok = true;
					console.log(`Comentarios analizados: ${data.result.length}\n`);
					await file.write({ terms: content.terms });
				} catch (error) {
					console.log('❌ Problemas al obtener los comentarios\n');
				}
			}

			const youtube = extractors.get('youtube-extractor');
			extractorInfo(youtube);
			await youtube.deploy({ apiKey });
			for (let x = 0; x < youtubeMetas.length; x++) {
				const input = youtubeMetas[x].metakey;
				const cURL = new URL(input);
				const id = cURL.searchParams.get('v');
				console.log(`Obteniendo comentarios de: ${id}`);
				try {
					const response = await youtube.obtain({ limit, metaKey: id });
					if (response.isError) {
						console.log('❌ Problemas al obtener los comentarios\n');
						continue;
					}
					const data = response.data;
					content.terms[youtubeMetas[x].index].ok = true;
					console.log(`Comentarios analizados: ${data.result.length}\n`);
					await file.write({ terms: content.terms });
				} catch (error) {
					console.log('❌ Problemas al obtener los comentarios\n');
				}
			}
			await backOrExit();
			return;
		} catch (error) {
			const message = error.message ? error.message : 'Se ha producido un error';
			cError = message;
			continue;
		}
	}
};
