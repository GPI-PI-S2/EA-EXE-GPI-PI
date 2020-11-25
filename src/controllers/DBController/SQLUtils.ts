export function objectPropWildcardSQL(object: unknown): string {
	return Object.keys(object)
		.map((key) => `\`${key}\`` + ' = ?')
		.join(', ');
}
export function objectWildcardSQL(object: unknown): string {
	return (
		'(' +
		Object.keys(object)
			.map(() => '?')
			.join(', ') +
		')'
	);
}
export function objectPropSQL(object: unknown): string {
	return (
		'(' +
		Object.keys(object)
			.map((key) => `\`${key}\``)
			.join(', ') +
		')'
	);
}
