<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/app/data-table.svelte';
	import type { TableProps, User } from '$lib/types';

	let {
		columns,
		data,
		selectable = false,
		onSelectionChange,
		optionsList
	}: TableProps<User> = {
		columns: [
			{
				key: 'fullName',
				header: 'Name',
				type: 'link',
				href: '/organizations/'
			},
			{
				key: 'email',
				header: 'Email',
				type: 'text'
			}
		],
		data: [
			{
				id: '1',
				fullName: 'Farhaan',
				email: 'farhaan@gmail.com',
				type: 'end_user',
				isActive: true,
				organizationRoles: []
			},
			{
				id: '2',
				fullName: 'Farhaan2',
				email: 'farhaan2@gmail.com',
				type: 'end_user',
				isActive: true,
				organizationRoles: []
			}
		],
		selectable: true,
		optionsList: [
			{
				id: '2',
				name: 'Assign members',
				onclick: (user) => {
					goto(`organizations/${user.id}`);
				}
			}
		]
	};
</script>

<DataTable {columns} {data} selectable={true} {optionsList} />
