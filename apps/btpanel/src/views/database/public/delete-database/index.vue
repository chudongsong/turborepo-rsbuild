<template>
	<div class="p-[28px]">
		<el-alert title="警告" :type="alertMessage.titleType" show-icon :closable="false" :description="alertMessage.description"></el-alert>

		<bt-table-group>
			<template #content>
				<bt-table ref="deleteRef" :data="tableData" :column="tableColumn" :max-height="300" v-bt-loading="tableLoading" v-bt-loading:title="'正在检查删除数据，请稍候...'" />
			</template>
		</bt-table-group>
		<p v-if="isCloudFlag" class="text-danger">注意：远程数据库暂不支持数据库回收站，选中的数据库将彻底删除</p>

		<p class="text-danger mt-4px">请仔细阅读以上要删除信息，防止数据库被误删</p>
		<p class="text-danger mt-[4px]" v-if="!dbRecycle && !isCloudFlag">当前数据库回收站尚未开启,请谨慎操作!</p>
	</div>
</template>
<script lang="tsx" setup>
import type { CloudServerItem, DatabaseTableItemProps } from '@database/types'

import { batchDelMysqlData, checkDelData, checkModulesDelData, deleteDatabase, getModulesCloudServer, getMysqlCloudServer } from '@api/database'
import { openResultView, usePosition } from '@database/useMethod'
import { getDatabaseStore } from '@database/useStore'
import { Message, useConfirm, useDataHandle } from '@hooks/tools'
import { getByteUnit } from '@utils/index'
import { useGlobalStore } from '@/store/global'
import { assembBatchParams, assembBatchResults } from '@/public'

interface Props {
	compData?: {
		ids: number[] // 删除的id列表
		isMult: boolean // 是否为批量删除
		rows: any[] // 原始表格数据
		config: {
			enable: boolean // 是否开启批量操作
			exclude: any[] // 排除的操作
		}
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		ids: [],
		isMult: false,
		rows: [],
		config: {
			enable: false,
			exclude: [],
		},
	}),
})

const {
	refs: { tabActive },
	refreshTableList,
} = getDatabaseStore()

const { panel } = useGlobalStore() // 全局store

const { enable, exclude } = props.compData?.config

const { ids, isMult } = props.compData
const isCloudFlag = ref<boolean>(false) // 是否包含远程数据库
const serverList = shallowRef<CloudServerItem[]>([]) // 远程数据库列表

const dbRecycle = ref<boolean>(panel.value.isDbRecycle) // 数据库回收站状态

const tableData = shallowRef([]) // 表格数据存储
const tableLoading = shallowRef<boolean>(false) // 表格loading

const popupSetFooter = inject<any>('popupSetFooter') //     弹窗切换底部按钮展示

// 顶部删除信息、类型
const alertMessage = reactive({
	title: '警告',
	titleType: 'warning' as 'warning' | 'error',
	description: '删除数据库后，数据库内的所有数据将被清空，且不可恢复。',
})

/**
 * @description: 确认删除
 */
const onConfirm = async (close: AnyFunction) => {
	await useConfirm({
		type: 'input',
		title: '二次验证信息-删除数据库',
		content: '移至回收站的数据库如需彻底删除请前往数据库回收站，<span class="text-danger">远程数据库将直接彻底删除</span>，是否继续操作？',
		icon: 'warning-filled',
		isHtml: true,
		input: { content: '删除数据库' },
	})
	let result: any = []
	const loading = Message.load('正在删除...')
	if (isMult && tabActive.value === 'mysql') {
		const params = assembBatchParams(props.compData.rows, exclude, enable)
		const res = await batchDelMysqlData(params)
		const { data } = assembBatchResults(res.data)
		openResultView(data, { title: '删除' })
		refreshTableList()
	} else {
		await deleteRecursion(result, 0, isMult)
	}

	loading.close()
	close()
}

/**
 * @description:删除递归
 * @param {Array} result 结果数组
 * @param {Number} index 当前索引
 * @param {Boolean} isMult 是否为批量删除
 */
const deleteRecursion = async (result: any, index: number, isMult: boolean) => {
	const { id, name } = tableData.value[index] // 数据库id，name
	const type = tabActive.value === 'mysql' ? null : tabActive.value // 数据库类型

	// 删除数据库请求
	const res = await useDataHandle({
		request: deleteDatabase({ id, name }, type),
	})
	// 添加结果
	result.push({ id: id, name: name, status: res.status })
	// 完成所有删除时
	if (index === tableData.value.length - 1) {
		refreshTableList() // 刷新列表
		if (isMult) {
			openResultView(result, { title: '删除数据库' }) // 批量删除-展开结果列表
		} else {
			Message.request(res) // 单个删除-提示结果
		}
	}
	// 未完成所有删除，继续递归删除
	if (index < tableData.value.length - 1) deleteRecursion(result, index + 1, isMult)
}

/**
 * @description: 检查数据库删除数据
 */
const checkDeleteDataEvent = async () => {
	popupSetFooter(false)
	const { data } = await useDataHandle({
		loading: tableLoading,
		request: tabActive.value === 'mysql' ? checkDelData({ ids: JSON.stringify(ids) }) : checkModulesDelData({ data: JSON.stringify({ ids: JSON.stringify(ids) }) }, tabActive.value),
		data: {
			data: [Array, tableData],
		},
	})
	// 是否包含远程数据库
	isCloudFlag.value = data?.some((item: any) => item.sid)
	if (isCloudFlag.value) {
		alertMessage.titleType = 'error'
		alertMessage.description = '当前列表存在彻底删除后无法恢复的数据库，请仔细查看列表，以防误删，是否继续操作？'
	}

	popupSetFooter(true) // 放出按钮
}

/**
 * @description: 获取数据库列表
 */
const getServerList = async () => {
	let params = { data: JSON.stringify({ type: tabActive.value }) }
	await useDataHandle({
		request: tabActive.value === 'mysql' ? getMysqlCloudServer() : getModulesCloudServer(params, tabActive.value),
		data: [Array, serverList],
	})
}

/**
 * @description: 表格配置
 */
const useTableColumn = () => {
	return [
		{ label: '数据库名称', prop: 'name' },
		{
			label: '数据库大小',
			prop: 'total',
			render: (row: DatabaseTableItemProps) => {
				return h('span', getByteUnit(row.total, true, 2))
			},
		},
		// usePosition(serverList.value, tabActive.value), // 数据库位置
		{
			label: '数据库位置',
			render: (row: any) => {
				let position = '本地数据库'
				serverList.value?.forEach((item: any) => {
					if (item.id === row.sid) {
						position = tabActive.value === 'mysql' ? item.db_host : item.ps
						if (item.db_host === '127.0.0.1') position = '本地数据库'
					}
				})
				return h('span', position)
			},
		},
		{ width: 160, label: '创建时间', prop: 'addtime' },
		{
			width: 100,
			label: '删除结果',
			render: (row: DatabaseTableItemProps) => {
				let result: any = row.sid === 0 // 本地数据库
				// 远程数据库- 彻底删除
				// 本地数据库 开了回收站 - 移至回收站
				// 本地数据库 未开回收站 - 彻底删除
				if (result && dbRecycle.value) return (result = h('span', '移至回收站'))
				return (result = h('span', { class: 'text-danger' }, '彻底删除'))
			},
		},
	]
}

const tableColumn = useTableColumn() // 删除表格列数据

onMounted(() => {
	getServerList() // 获取服务器列表
	checkDeleteDataEvent() // 检查删除数据
})

defineExpose({ onConfirm })
</script>
