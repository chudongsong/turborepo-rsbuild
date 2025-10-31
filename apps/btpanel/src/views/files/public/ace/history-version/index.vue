<template>
	<div class="py-[1rem] px-16px">
		<bt-table-group>
			<template #content>
				<bt-table ref="fileTableRef" height="40rem" :column="tableColumn" :description="'列表为空'" :data="historyList"></bt-table>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/index';
import { getfileHistoryData, reHistory, delFileHistory } from '@api/files';

import { useSetDiffEditorOptions, useGetAceEditorSession, useCreateEditorTabs, editorTabsActive, reHistoryRow, useGetFileBody } from '@files/public/ace/useMethods';
import 'ace-diff/dist/ace-diff.min.css';
import 'ace-diff/dist/ace-diff-dark.min.css';
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools';
import { useOperate } from '@/hooks/tools/table/column';
const Message = useMessage();

interface Props {
	compData?: any;
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
});

const emit = defineEmits(['close']);

const historyList = ref<any[]>(props.compData.editorTabsActive.history || []); // 历史记录列表

/**
 * @description: 恢复
 * @param row 行数据
 */
const recoverEvent = async (row: any) => {
	await useConfirm({
		title: `恢复历史文件`,
		content: `是否恢复历史文件 ${formatTime(Number(row))}?恢复历史文件后，当前文件内容将会被替换！`,
	});
	useDataHandle({
		loading: '正在恢复历史文件，请稍后...',
		request: reHistory({
			filename: editorTabsActive.path,
			history: row,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				props.compData.callback();
				getHistory();
			}
		},
	});
};

/**
 * @description: 对比
 * @param row 行数据
 */
const diffEvent = async (row: any) => {
	const params = {
		filename: editorTabsActive.path,
		history: row,
	};
	const res: any = await useDataHandle({
		request: getfileHistoryData(params),
	});
	const session = useGetAceEditorSession(editorTabsActive.id);
	if (res.status) {
		reHistoryRow.value = {
			id: editorTabsActive.id,
			st_mtime: row,
			path: editorTabsActive.path,
			type: 'editor',
		};
		emit('close');
		await useCreateEditorTabs({
			title: `${editorTabsActive.title} <-> ${editorTabsActive.title}`,
			type: 'diff',
			mode: 'diff',
			path: editorTabsActive.path,
		});
		await useSetDiffEditorOptions({
			mode: `ace/mode/${editorTabsActive.mode}`,
			left: {
				content: res.data.data,
				editable: false,
				copyLinkEnabled: false,
			},
			right: {
				content: session.getValue(),
				editable: false,
				copyLinkEnabled: false,
			},
		});
	} else {
		Message.request(res);
	}
};
// 删除
const deleteEvent = async (row: any) => {
	await useConfirm({
		title: `删除历史文件`,
		content: `是否删除历史文件 ${formatTime(Number(row))}?删除历史文件后，将无法恢复！`,
	});
	useDataHandle({
		loading: '正在删除历史文件，请稍后...',
		request: delFileHistory({
			filename: editorTabsActive.path || '',
			history: row,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) getHistory();
		},
	});
};

// 表格列
const tableColumn = [
	{
		label: '版本时间',
		prop: 'time',
		render(row: any) {
			const renderTime = (timestamp: string) => {
				// 检查 timestamp 是否为有效的日期字符串
				const date = new Date(Number(timestamp) * 1000);
				if (isNaN(date.getTime())) {
					return timestamp; // 如果无效，显示原信息
				}
				return formatTime(date); // 如果有效，格式化时间
			};

			return h('span', {}, renderTime(row));
		},
	},
	useOperate([
		{ onClick: diffEvent, width: 65, title: '文件对比' },
		{ onClick: recoverEvent, title: '恢复' },
		{ onClick: deleteEvent, title: '删除' },
	]),
];

const getHistory = async () => {
	try {
		const { data } = await useGetFileBody(editorTabsActive.path as string);
		historyList.value = data.historys;
	} catch (error) {}
};

onMounted(() => {
	getHistory();
});

defineExpose({
	// onCancel,
});
</script>
