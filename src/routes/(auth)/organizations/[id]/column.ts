import { renderComponent } from '$lib/components/ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import { Checkbox } from '$lib/components/ui/checkbox';
import type { OrganizationMember } from '$lib/types';
import MemberActions from './member-actions.svelte';

export const columns: ColumnDef<OrganizationMember>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'user.fullName',
		header: 'Name'
	},
	{
		id: 'id',
		accessorKey: 'user.id',
		header: 'Role(s)'
	},
	{
		id: 'email',
		accessorKey: 'user.email',
		header: 'Email'
	},
	{
		accessorKey: 'isActive',
		header: 'Status'
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			return renderComponent(MemberActions, { row: row.original });
		}
	}
];
