<template>
	<div>
		<bt-install-mask v-if="showMask">
			<template #content><MaskTip type="SqlServer"></MaskTip> </template>
		</bt-install-mask>

		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="openAddDatabaseView(getServerList)">添加数据库</el-button>
					<el-button @click="openServerView">远程数据库</el-button>
					<!-- 同步数据库 -->
					<SyncData :comp-data="serverOptions" class="ml-[10px]"></SyncData>
					<bt-link @click="npsSurveyV2Dialog({ name: '数据库', type: 12 })" icon="desired" class="ml-[12px]" iconClass="text-medium">需求反馈</bt-link>
				</div>
			</template>

			<template #header-right>
				<el-select v-model="selectValue" @change="refreshTableList" class="!w-[14rem] mr-[8px]" :class="{ 'custom-types-bg-green': selectValue !== 'all' }">
					<el-option label="全部" value="all"></el-option>
					<el-option v-for="(item, index) in serverOptions" :key="index" :label="`${selectValue !== 'all' ? '已选：' : ''}${item.ps}`" :value="item.id">
						<span class="w-[20rem] truncate inline-block">{{ item.ps }}</span>
					</el-option>
				</el-select>
				<bt-input-search class="w-[26rem]" v-model="searchValue" @search="refreshTableList" placeholder="请输入数据库名称/备注" />
			</template>

			<template #content>
				<bt-table ref="sqlTableRef" v-bt-loading="isLoading" :column="tableColumns" :data="tableData" />
			</template>
			<template #footer-left>
				<bt-table-batch :options="batchOptions" :table-ref="sqlTableRef" />
			</template>
			<template #footer-right>
				<bt-table-page :total="tablePageConfig.total" v-model:page="tablePageConfig.page" v-model:row="tablePageConfig.row" @change="refreshTableList" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import type { TablePageProps } from '@components/extension/bt-table-page/types.d'
import type { CloudServerItem, DatabaseTableItemProps } from '@database/types.d'
import type { TableColumnProps } from '@components/data/bt-table/types.d'

import { getDatabaseStore } from '@database/useStore'
import { useGeneralTableConfig, usePosition, openServerView, openSetPwdView, openDeleteDatabaseView, openAddDatabaseView, useBatchConfig } from '../../useMethod'
import { useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { useDataPage, useDataHandle } from '@hooks/tools'
import { getModulesCloudServer, getModulesList } from '@/api/database'
import { npsSurveyV2Dialog } from '@/public/index'

import SyncData from '@database/public/sync-data/index.vue'
import MaskTip from '@database/public/mask-tip/index.vue'

const {
	refs: { isRefreshTable, isLoading, isHaveServer },
	resetRefresh,
	refreshTableList,
} = getDatabaseStore()

const sqlTableRef = ref(null) // 表格实例
const tableData = ref([]) // 表格数据
const tablePageConfig = reactive<TablePageProps>({ total: 0, page: 1, row: 10 }) // 表格分页配置
const tableColumns = shallowRef<TableColumnProps[]>([]) // 表格配置

const selectValue = ref<string | number>('all') // 表格右上方选择框
const searchValue = ref('') // 搜索框

const serverOptions = ref<Array<CloudServerItem>>([]) // 服务器列表
const batchOptions = useBatchConfig().filter(item => item.value !== 'back') // 批量操作

const showMask = computed(() => !isHaveServer.value) // 是否显示遮罩层

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	await useDataHandle({
		request: getModulesCloudServer({ data: JSON.stringify({ type: 'sqlserver' }) }, 'mongodb'),
		data: [Array, serverOptions],
	})
	if (!serverOptions.value.length) isHaveServer.value = false
	return serverOptions.value
}

/**
 * @description 获取数据库列表
 */
const getDatabaseList = async () => {
	let params: any = {
		p: tablePageConfig.page,
		limit: tablePageConfig.row,
		tables: 'databases',
		search: searchValue.value,
		sid: selectValue.value === 'all' ? '' : selectValue.value,
	}
	if (params.sid === '') delete params.sid
	await useDataHandle({
		loading: isLoading,
		request: getModulesList({ data: JSON.stringify(params) }, 'sqlserver'),
		data: {
			data: [Array, tableData],
			page: useDataPage(tablePageConfig),
		},
	})
}

/**
 * @description 表格配置
 * @returns {Promise<void>} void
 */
const useTableColumn = () => {
	return [
		useCheckbox(),
		...useGeneralTableConfig(openSetPwdView),
		usePosition(serverOptions.value, 'sqlserver'),
		usePs({ table: 'databases' }), // 备注
		useOperate([
			{ onClick: (row: DatabaseTableItemProps) => openSetPwdView(row), title: '改密' },
			{ onClick: (row: DatabaseTableItemProps) => openDeleteDatabaseView(row), title: '删除' },
		]), // 操作
	]
}

/**
 * @description 初始化
 */
const init = async () => {
	getDatabaseList() // 获取数据库列表
	await getServerList() // 获取服务器列表
	tableColumns.value = useTableColumn() // 表格配置
}

// 监听表格刷新
watch(
	() => isRefreshTable.value,
	async (value: boolean) => {
		if (value) await getDatabaseList()
		resetRefresh() // 重置
	}
)

onMounted(() => init())
</script>

<style scoped></style>
