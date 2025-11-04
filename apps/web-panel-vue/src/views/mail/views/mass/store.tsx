import { defineStore } from 'pinia';
import { formatTime } from '@/utils';
import { useOperate } from '@/hooks/tools/table/column';
import { useTableData, useModalData } from '@mail/useMethod';
import { MailTask } from '@mail/types';
import BtDivider from '@components/other/bt-divider';

export const MAIL_MASS = defineStore('MAIL_MASS', () => {
	const search = reactive({
		p: 1,
		size: 10,
	});

	const formModal = useModalData('添加发送任务', {
		onRefresh: async () => {
			const { getList } = await import('@mail/views/mass/useMethod');
			getList();
		},
	});

	const { table, columns } = useTableData([
		{
			prop: 'created',
			label: '创建时间',
			width: 180,
			minWidth: 140,
			render: row => formatTime(row.created),
		},
		{
			prop: 'task_name',
			label: '任务名称',
			width: 200,
			minWidth: 140,
			showOverflowTooltip: true,
		},
		{
			prop: 'addresser',
			label: '发件人',
			minWidth: 160,
			showOverflowTooltip: true,
		},
		{
			prop: 'recipient_count',
			label: '总数',
			align: 'center',
			width: 140,
			minWidth: 80,
		},
		{
			prop: 'success_count',
			label: '成功数量',
			align: 'center',
			width: 140,
			minWidth: 80,
			render: (row: MailTask) => {
				if (row.task_process === 2) {
					return row.recipient_count - row.count.error_count;
				}
				return '--';
			},
		},
		{
			prop: 'error_count',
			label: '失败数量',
			align: 'center',
			width: 140,
			minWidth: 80,
			render: row => {
				if (row.task_process === 2) {
					return (
						<span
							class="bt-link !text-dangerDark"
							onClick={async () => {
								const { onShowFail } = await import('@mail/views/mass/useMethod');
								onShowFail(row);
							}}
						>
							{row.count.error_count}
						</span>
					);
				}
				return '--';
			},
		},
		{
			prop: 'task_process',
			label: '状态',
			width: 140,
			render: row => {
				if (row.task_process === 0) return <span class="text-warning">等待发送</span>;
				if (row.task_process === 1) return <span class="text-warning">执行中</span>;
				return '完成';
			},
		},
		useOperate(
			[
				{
					title: '错误日志',
					isHide: (row: MailTask) => !row.task_process,
					onClick: async (row: MailTask) => {
						const { onShowLog } = await import('@mail/views/mass/useMethod');
						onShowLog(row);
					},
				},
				{
					// title: row.task_process ? 'Pause' : 'Send',
					// isHide: (row:any)=>row.task_process !== 2,
					render: (row: MailTask) => {
						return row.task_process !== 2 ? (
							<span
								onClick={async () => {
									const { onSetStatus } = await import('@mail/views/mass/useMethod');
									onSetStatus(row);
								}}
								title={row.task_process ? '停止' : '发送'}
								class="bt-link"
							>
								{row.task_process ? '停止' : '发送'}
								<BtDivider />
							</span>
						) : (
							''
						);
					},
				},
				{
					title: '删除',
					onClick: async (row: MailTask) => {
						const { onDel } = await import('@mail/views/mass/useMethod');
						onDel(row);
					},
				},
			],
			{
				width: 200,
				fixed: 'right',
				label: '操作',
			}
		),
	]);

	const failModal = useModalData('错误任务');

	const logModal = useModalData('发送日志');

	const reset = () => {
		table.data = [];
		table.total = 0;
		search.p = 1;
	};

	return {
		search,
		table,
		columns,
		formModal,
		failModal,
		logModal,
		reset,
	};
});

export default MAIL_MASS;
