<template>
	<div class="h-full">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="routeBackupBtn">备份站点</el-button>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="() => getDataInfoEvent(true)"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="routeBackupRef" :data="tableData" :max-height="408" v-bt-loading="tableLoading" v-bt-loading:title="'正在加载中，请稍后...'" :column="backTableColumn">
					<!-- <template #empty>
						<div class="flex items-center justify-center !text-small">
							您的列表为空，您可以
							<BtLink @click="routeBackupBtn">备份当前站点</BtLink>
						</div>
					</template> -->
				</bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :options="batchGroup" :tableRef="routeBackupRef" />
			</template>
			<template #footer-right>
				<!-- @change="refreshActiveList()" -->
				<bt-table-page v-model:page="tablePageConfig.p" v-model:row="tablePageConfig.limit" :total="tablePageConfig.total" @change="getDataInfoEvent"></bt-table-page>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { getDataInfo } from '@/api/global'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useConfirm, useDataHandle, useDataPage, useDialog, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate, usePathSize, usePs } from '@/hooks/tools/table/column'
import { ResponseResult } from '@/types'
import { openRestoreBack } from '@/views/config/views/new-sync/back-list/useMethod'
import { cloudMap } from '@/views/site/useController'
import { BackupSite, DelBackup } from '@api/site'
import { useSiteStore } from '@site/useStore'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => [],
})

const { isRefreshList } = useSiteStore()

const Message = useMessage() // 消息提示

const tableLoading = ref(false) // 表格loading
// const tabActive = ref('routeBackup') // tab默认选中
const routeBackupRef = ref() // 表格实例
const tableData = ref([]) // 表格数据
const timerId = ref() // 是否循环

// const showBackupMysql = ref(false) // 是否显示Mysql备份数据库弹窗
// const formDisabled = ref(false) // 表单禁用
// let backupForm = reactive({
// 	title: '备份数据库',
// 	// 备份数据库表单
// 	password: '',
// 	file: '',
// })

// 批量操作按钮组
const batchGroup = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			const requestHandle = async (item: AnyObject) => {
				return await DelBackup({ id: item.id })
			}
			await batchConfirm({
				title: `批量删除备份文件`,
				content: `批量删除已选备份文件，是否继续操作？`,
				column: [{ prop: 'filename', label: '文件名' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
				onConfirm: async () => {
					await nextAll(requestHandle) // 递归操作所有选中的数据
					// 执行完毕的代码，刷新列表
					await getDataInfoEvent()
					// 刷新外部表格
					isRefreshList.value = true
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
]

// 表格接口请求
const { id, name } = props.compData
const tablePageConfig = reactive({
	p: 1,
	limit: 10,
	search: id,
	type: 0,
	table: 'backup',
	total: 0,
})

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		useCheckbox(),
		{
			label: '文件名称',
			prop: 'name',
		},
		{
			label: '存储位置',
			width: 100,
			render: (row: any) => {
				if (row.filename.indexOf('|') != -1) {
					let cloud_name: any = row.filename.match(/\|(.+)\|/, '$1')
					return <span>{cloudMap[cloud_name[1]]}</span>
				} else {
					return <span>本地</span>
				}
			},
		},
		usePathSize({ prop: 'size' }),
		{
			width: 160,
			prop: 'addtime',
			label: '备份时间',
		},
		usePs({ table: 'backup' }), // 备注
		useOperate([
			// { title: '还原', onClick: (row: any) => openRestoreBack(row, 'confirm') },// 暂时隐藏还原,后端接口问题
			{
				isHide: (row: any) => {
					return row.backup_status === 1
				},
				onClick: downBackEvent,
				title: '下载',
			},
			{
				isHide: (row: any) => {
					return row.backup_status === 1
				},
				render: (row: any) => {
					return (
						<span
							class={`cursor-pointer text-${row.backup_status ? 'danger' : 'primary'}`}
							onClick={() => {
								if (row.backup_status) openBackupLog(row)
								else delBackEvent(row)
							}}>
							{row.backup_status ? '备份中' : '删除'}
							{row.backup_status ? <span class="omit"></span> : ''}
						</span>
					)
				},
			},
		]), // 操作
	])
}

/**
 * @description: 下载数据库
 * @param {any} row 选中row数据
 * @return {void} void
 */
const downBackEvent = (row: any): void => {
	if (row.backup_status) Message.error('备份中的文件不可下载')
	else window.open('/download?filename=' + row.filename, '_self', 'noopener,noreferrer')
}

/**
 * @description: 删除备份文件
 * @param {any} row 选中row数据
 * @param {boolean} isMult 是否批量
 * @return {Promise<void | ResponseResult> | undefined}
 */
const delBackEvent = async (row: any, isMult: boolean = false): Promise<void | ResponseResult> => {
	try {
		if (typeof isMult !== 'boolean') isMult = false
		if (!isMult) {
			await useConfirm({
				width: '40rem',
				title: '删除备份',
				content: '<p>删除选中站点备份文件后，<span class="text-danger">该站点备份文件将永久消失</span>，是否继续？</p>',
				icon: 'warning-filled',
				isHtml: true,
			})
		}
		const res = await DelBackup({ id: row.id })
		if (!isMult) {
			Message.request(res)
			// 判定当前处于哪个模块，刷新列表
			isRefreshList.value = true
		}
		await getDataInfoEvent()
		if (tableData.value.length === 0) {
			tablePageConfig.p = 1
			getDataInfoEvent()
		}
		return res
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 打开备份日志
 * @param {any} row 选中row数据
 * @return {void} void
 */
const openBackupLog = (row: any) => {
	useDialog({
		isAsync: true,
		title: `备份日志`,
		area: 64,
		compData: row,
		component: () => import('./backup-log.vue'),
	})
}

/**
 * @description 常规备份
 */
const routeBackupBtn = async () => {
	// useDialog({
	// 	title: '网站备份',
	// 	component: () => import('./confirm-back.vue'),
	// 	area: 46,
	// 	compData: {
	// 		...props.compData,
	// 		refresh: () => {
	// 			getDataInfoEvent()
	// 			isRefreshList.value = true
	// 		},
	// 	},
	// })

	const res: AnyObject = await useDataHandle({
		loading: '正在备份站点...',
		request: BackupSite({ id, backstage: 1 }),
		message: true,
	})
	if (res.status) {
		getDataInfoEvent()
		isRefreshList.value = true
	}
}

const getDataInfoEvent = async (isRefresh: boolean = false, isLoad: boolean = true) => {
	isLoad && (tableLoading.value = true)
	const res = await useDataHandle({
		request: getDataInfo({
			p: tablePageConfig.p,
			limit: tablePageConfig.limit,
			search: id,
			type: tablePageConfig.type.toString(),
			table: 'backup',
		}),
		data: {
			data: [Array, tableData],
			page: useDataPage(tablePageConfig),
		},
	})
	isLoad && (tableLoading.value = false)
	if (isRefresh) Message.success('刷新成功')
	clearTimeout(timerId.value)
	if (tableData.value.some((item: any) => item.backup_status === 1)) {
		timerId.value = setTimeout(() => {
			getDataInfoEvent(false, false)
		}, 3000)
	}
}

const backTableColumn = useTableColumn()

onMounted(() => {
	getDataInfoEvent()
})
</script>
