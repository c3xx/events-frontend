export const nav = createNavBreadCrumbsState();

function createNavBreadCrumbsState() {
	let value = $state<
		{
			title: string;
			url: string;
		}[]
	>([{ title: 'Events', url: '/' }]);

	return {
		get value() {
			return value;
		},
		get default() {
			return { title: 'Events', url: '/' };
		},
		set(breadcrumbs: typeof value) {
			value = breadcrumbs;
		},
		reset() {
			value = [this.default];
		}
	};
}
