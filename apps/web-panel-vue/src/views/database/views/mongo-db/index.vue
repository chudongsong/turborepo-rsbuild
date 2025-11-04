<template>
	<div>
		<bt-install-mask v-if="showMask">
			<template #content><MaskTip type="MongoDB"></MaskTip> </template>
		</bt-install-mask>

		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="openAddDatabaseView(getServerList)">添加数据库</el-button>
					<el-button v-if="safetyStatus" @click="openRootPwdView(rootPwdValue, () => getMongoConfigEvent())">root密码</el-button>
					<el-button @click="openServerView">远程数据库</el-button>
					<!-- 安全认证 -->
					<SafetyAuth class="mx-[10px]"></SafetyAuth>
					<!-- 同步数据库 -->
					<SyncData :comp-data="serverOptions"></SyncData>
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
				<bt-table ref="mongoDbTableRef" v-bt-loading="isLoading" :column="tableColumns" :data="tableData" />
			</template>
			<template #footer-left>
				<bt-table-batch :options="batchOptions" :table-ref="mongoDbTableRef" />
			</template>
			<template #footer-right>
				<bt-table-page :total="tablePageConfig.total" v-model:page="tablePageConfig.page" v-model:row="tablePageConfig.row" @change="refreshTableList" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import type { TableColumnProps } from '@components/data/bt-table/types'
import type { TablePageProps } from '@components/extension/bt-table-page/types'
import type { CloudServerItem, DatabaseTableItemProps } from '@database/types'

import { getModulesList, getModulesCloudServer, getMongodbConfig } from '@api/database'

import { useBackups, useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { getDatabaseStore } from '@database/useStore'
import { useDataPage, useDataHandle, useDialog } from '@hooks/tools'
import { useGeneralTableConfig, usePosition, useBatchConfig } from '@database/useMethod'
import { npsSurveyV2Dialog } from '@/public/index'

import { openServerView, openToolsView, openSetPwdView, openBackView, openDeleteDatabaseView, openAddDatabaseView, openRootPwdView } from '@database/useMethod'

import SafetyAuth from './safety-auth/index.vue'
import SyncData from '@database/public/sync-data/index.vue'
import MaskTip from '@database/public/mask-tip/index.vue'

const {
	refs: { isRefreshTable, isLoading, safetyStatus, envStatus, isHaveServer },
	resetRefresh,
	refreshTableList,
} = getDatabaseStore()

const tablePageConfig = reactive<TablePageProps>({ total: 0, page: 1, row: 10 }) // 表格分页配置
const tableData = ref([]) // 表格数据
const tableColumns = shallowRef<TableColumnProps[]>([]) // 表格配置

const mongoDbTableRef = ref(null) // 表格ref

const selectValue = ref<string | number>('all') // 表格右上方选择框
const searchValue = ref<string>('') // 搜索框
const rootPwdValue = ref<string>('') // root密码

const serverOptions = ref<Array<CloudServerItem>>([]) // 服务器列表
const batchOptions = useBatchConfig() // 批量操作配置

const showMask = computed(() => !envStatus.value.setup && !isHaveServer.value) // 是否显示遮罩层

/**
 * @description 打开mongodb权限设置
 */
const openPermissionView = (row: DatabaseTableItemProps) => {
	useDialog({
		title: `【${row.name}】权限配置`,
		area: 53,
		compData: row,
		showFooter: true,
		component: () => import('./permisstion-setting/index.vue'),
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
		useBackups({ event: (row, type) => openBackView(row, type) }), // 备份
		usePosition(serverOptions.value, 'mongodb'),
		usePs({ table: 'databases' }), // 备注
		useOperate([
			{ onClick: (row: DatabaseTableItemProps) => openPermissionView(row), title: '权限' },
			{ onClick: (row: DatabaseTableItemProps) => openToolsView(row), title: '工具' },
			{ onClick: (row: DatabaseTableItemProps) => openSetPwdView(row), title: '改密' },
			{ onClick: (row: DatabaseTableItemProps) => openDeleteDatabaseView(row), title: '删除' },
		]), // 操作
	]
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	await useDataHandle({
		request: getModulesCloudServer({ data: JSON.stringify({ type: 'mongodb' }) }, 'mongodb'),
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
		request: getModulesList({ data: JSON.stringify(params) }, 'mongodb'),
		data: {
			data: [Array, tableData],
			page: useDataPage(tablePageConfig),
		},
	})
}

/**
 * @description 获取MongoDB配置
 */
const getMongoConfigEvent = async () => {
	const data = await useDataHandle({
		request: getMongodbConfig(),
		data: {
			root: [String, rootPwdValue],
			authorization: [String, data => ({ status: data === 'enabled' || false })],
		},
	})
	safetyStatus.value = data.status
}

/**
 * @description 初始化
 */
const init = async () => {
	getDatabaseList() // 获取数据库列表
	!showMask.value && getMongoConfigEvent() // 获取MongoDB配置 有遮罩时不请求
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
