import { config, createLogger, format, transports } from 'winston';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import prismjs from './prismjs';
type level = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
const { combine, json, splat, cli, printf } = format;
const gLevel = (process.env.LEVEL ? process.env.LEVEL : 'info') as level;
const levels = config.npm.levels;
const myFormat = printf(({ level, message, ...metadata }) => {
	const msg = `${level}: ${message} `;
	const splat = (Reflect.ownKeys(metadata).find(
		(key) => String(key) === 'Symbol(splat)',
	) as unknown) as string;
	const sLevel = (Reflect.ownKeys(metadata).find(
		(key) => String(key) === 'Symbol(level)',
	) as unknown) as string;
	const cLevel = metadata[sLevel];
	const currentLevel = levels[cLevel];
	const maxLevel = levels[gLevel];
	if (splat && currentLevel <= maxLevel) {
		const delimiter = '--------⬆️';
		Object.values({ ...metadata[splat] }).forEach((value) => {
			const r = prismjs(JSON.stringify(value, null, 2));
			console.log(r);
		});
		return delimiter;
	} else return msg;
});
const cTransports: ConsoleTransportInstance[] = [];
cTransports.push(
	new transports.Console({
		format: combine(),
	}),
);
const LoggerInstance = createLogger({
	level: gLevel,
	levels,
	format: combine(format.colorize(), splat(), json(), cli(), myFormat),
	transports: cTransports,
});

export default LoggerInstance;
