<template>
	<div>
		<bt-install-mask v-if="showMask">
			<template #content><MaskTip type="Redis"></MaskTip> </template>
		</bt-install-mask>

		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="openAddDatabaseView(() => getDbKey(tableParam.sid), tableParam.sid, activeName)">添加Key</el-button>
					<el-button @click="openServerView">远程数据库</el-button>
					<el-button @click="openBackView">备份列表</el-button>
					<el-button @click="openClearDbView">清空数据库</el-button>
					<!-- 状态 -->
					<BtSoftStateBtn pluginName="redis" :plugin-info="softData" :is-request="false" class="ml-8px" />
					<bt-link @click="npsSurveyV2Dialog({ name: '数据库', type: 12, id: 17 })" class="ml-[12px] <2xl:hidden"> 需求反馈 </bt-link>
				</div>
			</template>
			<template #header-right>
				<!-- 远程数据库列表 -->
				<div class="flex items-center mx-4px inline-flex">
					<span class="text-warning inline-block whitespace-nowrap flex items-center"> <i class="svgtofont-el-info-filled mt-2px mr-4px"></i>当前所有操作都关联至 </span>
					<el-select v-model="selectValue" class="!w-[16rem] mx-4px" @change="changeServerValue">
						<el-option v-for="item in redisData.serverList" :key="item.ps" :label="item.ps" :value="item.id"> </el-option>
					</el-select>
				</div>

				<!-- 状态 -->
				<div class="flex items-center">
					<i :class="`text-base mt-4px mr-2px svgtofont-el-circle-${statusIcon}-filled text-${statusIcon === 'close' ? 'danger' : 'primary'}`"></i>
					<div class="mr-[1.6rem] text-small">
						<span>状态：</span>
						<span :style="`color:${redisStatus.db_status ? 'var(--el-color-primary)' : '#ef0808'}`">
							{{ redisStatus.msg }}
						</span>
					</div>
				</div>
			</template>
			<template #content>
				<bt-tabs v-model="activeName" type="card" @change="onTabChange" class="tab-switch">
					<el-tab-pane class="h-0 !p-0" v-for="(item, index) in redisData.keyList" :key="index" :label="item.name + '【' + item.keynum + '】'" :name="String(item.id)" :lazy="true"> </el-tab-pane>
				</bt-tabs>

				<div class="!float-right mb-8px !w-[24rem]">
					<bt-input-search v-model="tableParam.search" @search="getDbValue" placeholder="请输入键名称" />
				</div>

				<bt-table ref="redisTableRef" v-bt-loading="tableLoad" :column="tableColumn" :data="redisData.valueList" :total="valueTotal"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="redisTableRef" :options="batchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="tableParam.p" v-model:row="tableParam.limit" :total="valueTotal" @change="getDbValue"></bt-table-page>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import type { CloudServerItem, KeyItem, ValueItem } from '@database/types.d'
import type { TableBatchEventProps } from '@components/extension/bt-table-batch/types.d'
import type { TableColumnProps } from '@components/data/bt-table/types.d'
import { getDatabaseStore } from '@database/useStore'
import { delBatchRedisValue, delRedisValue, getModulesCloudServer, getRedisKey, getRedisKeyValue } from '@/api/database'
import { useGlobalStore } from '@store/global'

import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useDialog } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { Message } from '@hooks/tools'
import { openServerView, openAddDatabaseView, useCheckServerConnection } from '@database/useMethod'

import BtSoftStateBtn from '@components/extension/bt-soft-state/index.vue'
import MaskTip from '@database/public/mask-tip/index.vue'
import { assembBatchParams, assembBatchResults, npsSurveyV2Dialog, openResultView } from '@/public/index'

const { mainHeight } = useGlobalStore()

const {
	refs: { isRefreshTable, envStatus, isHaveServer, softData },
	resetRefresh,
	refreshTableList,
} = getDatabaseStore()

const activeName = ref<string>('0') // 当前激活的tab

const redisTableRef = ref() // 表格ref
const tableLoad = ref<boolean>(false) // 表格加载状态
const selectValue = ref<string | number>(0) // 服务器选择
const showMask = computed(() => !envStatus.value.setup && !isHaveServer.value)

const redisData = reactive({
	serverList: [] as CloudServerItem[],
	keyList: [] as KeyItem[],
	valueList: [] as ValueItem[],
})

const valueTotal = ref(0) // 数据总数
const tableParam = reactive({
	search: '',
	sid: 0,
	limit: 10,
	db_idx: 0,
	p: 1,
})

const redisStatus = ref({
	db_status: true,
	msg: '加载中',
})

const statusIcon = computed(() => {
	return redisStatus.value.db_status ? 'check' : 'close'
})

/**
 * @description
 * @param batchConfirm
 * @param nextAll
 * @param selectedList
 * @param options
 */
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearBatch, config) => {
	const { label, value } = options
	const { enable, exclude } = config
	await batchConfirm({
		title: `批量${label}键`,
		content: `即将批量${label}键，是否继续操作！`,
		column: [{ label: '键名', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const list = selectedList.value.map((item: any) => ({ key: item.name }))
			const params = assembBatchParams(false, exclude, enable, {
				params: { database_list: JSON.stringify(list), sid: tableParam.sid, db_idx: Number(activeName.value) },
			})
			const res = await delBatchRedisValue(params)

			// 执行完毕的代码，刷新列表
			refreshTableList()

			// 处理结果
			const { data } = assembBatchResults(res.data)
			openResultView(data, { title: '删除键' })
			clearBatch?.()

			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			// await nextAll((data: any) =>
			// 	delRedisValue({
			// 		data: JSON.stringify({ sid: tableParam.sid, db_idx: Number(activeName), key: data.name }),
			// 	})
			// )

			// 返回false则不关闭弹窗
			// return false
		},
	})
}

/**
 * @description 打开备份列表
 */
const openBackView = () => {
	useDialog({
		title: '数据库备份',
		area: 78,
		compData: {
			sid: tableParam.sid,
			keyList: redisData.keyList,
		},
		component: () => import('./backup/index.vue'),
	})
}

/**
 * @description 清空数据库
 */
const openClearDbView = () => {
	useDialog({
		title: '清理数据库',
		area: 42,
		compData: {
			sid: tableParam.sid,
			keyList: redisData.keyList,
		},
		showFooter: true,
		component: () => import('./clear-redis/index.vue'),
	})
}

/**
 * @description 打开服务器列表
 * @param val
 */
const changeServerValue = async (val: string) => {
	const loading = Message.load('正在切换服务器,请稍后...')
	tableParam.sid = Number(val)
	await init()
	loading.close()
}

/**
 * @description 删除数据库值
 * @param row
 */
const deleteRedisEvent = async (row: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '提示',
		content: `此操作将删除选中的数据【${row.name}】, 是否继续?`,
	})

	await useDataHandle({
		request: delRedisValue({
			data: JSON.stringify({
				sid: tableParam.sid,
				db_idx: Number(activeName.value),
				key: row.name,
			}),
		}),
		message: true,
	})
	refreshTableList()
}

/**
 * @description tab切换
 * @param val
 */
const onTabChange = (val: string, test: any) => {
	tableParam.db_idx = Number(val)
	getDbValue()
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	const res: any = await useDataHandle({
		request: getModulesCloudServer({ data: JSON.stringify({ type: 'redis' }) }, 'redis'),
		data: Array,
	})
	redisData.serverList = res
	if (redisData.serverList.length) isHaveServer.value = true
	return res
}

/**
 * @description 获取数据库键，key列表
 * @param sid
 */
const getDbKey = async (sid: number | string) => {
	const res: any = await useDataHandle({
		request: getRedisKey({ data: JSON.stringify({ sid }) }),
		data: Array,
	})
	redisData.keyList = res
	return res
}

/**
 * @description 获取数据库值，value列表
 * @param sid
 */
const getDbValue = async () => {
	const res: any = await useDataHandle({
		request: getRedisKeyValue({
			data: JSON.stringify({
				...tableParam,
			}),
		}),
		data: { data: Array, page: useDataPage(valueTotal) },
	})
	redisData.valueList = res.data || []
}

const tableColumn = [
	useCheckbox({ type: 'page', key: 'name' }),
	{ label: '键', prop: 'name' },
	{
		label: '值',
		prop: 'val',
		width: 320,
		render: (row: any) => {
			return (
				<span class="truncate !w-[30rem]" title={row.val}>
					{row.val}
				</span>
			)
		},
	},
	{ label: '数据类型', prop: 'type' },
	{ label: '数据长度', prop: 'len' },
	{ label: '有效期', prop: 'showtime' },
	useOperate([
		{
			onClick: (row: any) => {
				useDialog({
					title: '编辑redis数据库',
					area: 44,
					compData: {
						refresh: () => getDbKey(tableParam.sid), // 数据库键列表
						row: { ...row, db_idx: Number(activeName.value) },
					},
					showFooter: true,
					component: () => import('@database/views/redis/add-redis/index.vue'),
				})
			},
			title: '编辑',
		},
		{ onClick: deleteRedisEvent, title: '删除' },
	]), // 操作
] as TableColumnProps[]

// 批量操作
const batchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
]

/**
 * @description 初始化
 */
const init = async () => {
	try {
		// 检查服务器连接
		const res = await useCheckServerConnection(tableParam.sid)
		redisStatus.value = res
		getServerList() // 获取服务器列表
		if (!res.db_status) {
			redisData.valueList = []
			redisData.keyList = []
			isHaveServer.value = false
			return false
		}
		getDbKey(tableParam.sid) // 获取数据库键
		getDbValue() // 获取数据库值
	} catch (error) {
		console.log(error)
	}
}

// 监听表格刷新
watch(
	() => isRefreshTable.value,
	async (value: boolean) => {
		if (value) {
			await getDbKey(tableParam.sid)
			await getDbValue()
		}
		resetRefresh() // 重置
	}
)

onMounted(init)
</script>

<style scoped></style>
