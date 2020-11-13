import { program } from 'commander';

export default async (): Promise<void> => {
	program.version('0.0.1');
	program
		.option('-d, --debug', 'output extra debugging')
		.option('-s, --small', 'small pizza size')
		.option('-p, --pizza-type <type>', 'flavour of pizza');

	program.parse(process.argv);
	return;
};
