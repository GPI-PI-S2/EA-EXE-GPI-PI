export function objectPropWildcardSQL(object: Record<string, number | string>): string {
	return Object.keys(object)
		.map((key) => `\`${key}\`` + ' = ?')
		.join(', ');
}
export function objectWildcardSQL(object: Record<string, number | string>): string {
	return (
		'(' +
		Object.keys(object)
			.map(() => '?')
			.join(', ') +
		')'
	);
}
export function objectPropSQL(object: Record<string, number | string>): string {
	return (
		'(' +
		Object.keys(object)
			.map((key) => `\`${key}\``)
			.join(', ') +
		')'
	);
}
