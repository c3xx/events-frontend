export function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleString('en-IN', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
}
