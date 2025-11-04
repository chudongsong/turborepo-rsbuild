import { defineStore } from 'pinia';
import { useModalData, useTableData } from '@mail/useMethod';
import { useOperate } from '@/hooks/tools/table/column';
import { MailTaskFail, MailTask, MailTaskFailDetails } from '@mail/types';

export const MAIL_MASS_FAIL = defineStore('MAIL_MASS_FAIL', () => {
	const propsData = ref({} as MailTask);

	const search = reactive({
		task_id: 0,
		type: 'domain',
	});

	const detailsModal: any = useModalData('');

	const detailSearch = reactive({
		task_id: 0,
		type: '',
		value: '',
		page: 1,
		size: 10,
	});

	const detailLoading = ref(false);

	const { table: detailsTable, columns: detailsColumns } = useTableData<MailTaskFailDetails>([
		{
			prop: 'recipient',
			label: '收件人',
			width: 160,
			// render: row => {
			// 	return (
			// 		<span
			// 			class={{'!break-all':!row.tooltip,''}}
			// 			line-clamp={row.tooltip ? 999 : 1}>
			// 			{row.recipient}
			// 		</span>
			// 	)
			// },
		},
		{
			prop: 'dsn',
			label: 'Dsn',
			width: 60,
		},
		{
			prop: 'delay',
			label: '延时',
			width: 70,
		},
		{
			prop: 'delays',
			label: '各阶段延时',
			width: 150,
		},
		{
			prop: 'relay',
			label: '中继服务器',
			width: 200,
			showOverflowTooltip: true,
			// render: row => {
			// 	return (
			// 		<NEllipsis
			// 			class={row.tooltip ? '' : 'break-all!'}
			// 			line-clamp={row.tooltip ? 9999 : 1}
			// 			tooltip={false}>
			// 			{row.relay}
			// 		</NEllipsis>
			// 	)
			// },
		},
		{
			prop: 'err_info',
			label: '详情',
			render: row => {
				// 初始化 row.tooltip 为 false，以确保它是响应式的
				if (row.tooltip === undefined) {
					row.tooltip = false;
				}
				const reactiveRow = reactive(row);
				return (
					<div class={'tooltip-text'}>
						<span class={'tooltip-text-title'}>{reactiveRow.err_info}</span>
					</div>
				);
			},
		},
	]);

	const loading = ref(false);

	const { table, columns } = useTableData<MailTaskFail>([
		{
			prop: 'domain',
			renderHeader: () => {
				return search.type === 'domain' ? '域名' : '状态';
			},
			render: row => {
				const mapType: any = {
					bounced: '退信',
					deferred: '延迟',
					delivered: '成功',
					invalid: '无效',
					rejected: '拒绝',
				};
				if (search.type === 'domain') return row.domain;
				return mapType[row.status];
			},
		},
		{
			prop: 'count',
			label: '数量',
		},
		useOperate([
			{
				title: '详情',
				onClick: async (row: any) => {
					const { onShowDetails } = await import('@mail/views/mass/fail/useMethod');
					onShowDetails(row);
				},
			},
		]),
	]);

	const reset = () => {
		search.task_id = 0;
		search.type = 'domain';
		table.data = [];
		table.total = 0;
	};

	const resetDetail = () => {
		detailSearch.task_id = 0;
		detailSearch.type = '';
		detailSearch.value = '';
		detailsTable.data = [];
		detailsTable.total = 0;
	};

	return {
		search,
		loading,
		table,
		columns,
		detailsModal,
		propsData,
		reset,
		detailSearch,
		detailLoading,
		detailsTable,
		detailsColumns,
		resetDetail,
	};
});

export default MAIL_MASS_FAIL;
