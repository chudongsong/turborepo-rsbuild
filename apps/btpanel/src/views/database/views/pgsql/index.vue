<template>
	<div>
		<bt-install-mask v-if="showMask">
			<template #content><MaskTip type="PgSql"></MaskTip></template>
		</bt-install-mask>

		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="openAddDatabaseView(getServerList)"> 添加数据库 </el-button>
					<el-button @click="openAdminPwdView">管理员密码</el-button>
					<el-button @click="openServerView">远程数据库</el-button>
					<!-- 同步数据库 -->
					<SyncData :comp-data="serverOptions" class="mx-12px"></SyncData>
					<bt-link @click="npsSurveyV2Dialog({ name: '数据库', type: 12 })" icon="desired" iconClass="text-medium"> 需求反馈 </bt-link>
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
				<bt-table ref="pgsqlDbTableRef" v-bt-loading="isLoading" :column="tableColumns" :data="tableData" />
			</template>
			<template #footer-left>
				<bt-table-batch :options="batchOptions" :table-ref="pgsqlDbTableRef" />
			</template>
			<template #footer-right>
				<bt-table-page :total="tablePageConfig.total" v-model:page="tablePageConfig.page" v-model:row="tablePageConfig.row" @change="refreshTableList" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import type { TableColumnProps } from '@components/data/bt-table/types.d'
import type { TablePageProps } from '@components/extension/bt-table-page/types.d'
import type { CloudServerItem, DatabaseTableItemProps } from '@database/types.d'

import { useBackups, useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { npsSurveyV2Dialog } from '@/public/index'
import { getModulesCloudServer, getModulesList } from '@api/database'
import { useBatchConfig, useGeneralTableConfig, usePosition } from '@database/useMethod'
import { getDatabaseStore } from '@database/useStore'
import { useDialog } from '@hooks/tools'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useHandleError } from '@hooks/tools'

import { openAddDatabaseView, openBackView, openDeleteDatabaseView, openPermissionView, openServerView, openSetPwdView } from '@database/useMethod'

import MaskTip from '@database/public/mask-tip/index.vue'
import SyncData from '@database/public/sync-data/index.vue'

const {
	refs: { isRefreshTable, isLoading, envStatus, isHaveServer },
	resetRefresh,
	refreshTableList,
} = getDatabaseStore()

const tablePageConfig = reactive<TablePageProps>({
	total: 0,
	page: 1,
	row: 10,
}) // 表格分页配置
const tableData = ref([]) // 表格数据
const tableColumns = shallowRef<TableColumnProps[]>([]) // 表格配置

const pgsqlDbTableRef = ref(null) // 表格ref

const selectValue = ref<string | number>('all') // 表格右上方选择框
const searchValue = ref<string>('') // 搜索框
const serverOptions = ref<Array<CloudServerItem>>([]) // 服务器列表
const batchOptions = useBatchConfig() // 批量操作配置

const showMask = computed(() => !envStatus.value.setup && !isHaveServer.value) // 是否显示遮罩层

/**
 * @description 打开管理员密码弹窗
 */
const openAdminPwdView = () => {
	useDialog({
		title: '管理员密码',
		area: 42,
		component: () => import('@database/views/pgsql/root-pwd/index.vue'),
		showFooter: true,
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
		usePosition(serverOptions.value, 'pgsql'),
		usePs({ table: 'databases' }), // 备注
		useOperate([
			{ onClick: openPermissionView, title: '权限' },
			{ onClick: openSetPwdView, title: '改密' },
			{ onClick: openDeleteDatabaseView, title: '删除' },
		]), // 操作
	] as TableColumnProps[]
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	try {
		await useDataHandle({
			request: getModulesCloudServer({ data: JSON.stringify({ type: 'pgsql' }) }, 'pgsql'),
			data: [Array, serverOptions],
		})
		if (!serverOptions.value.length) isHaveServer.value = false
		return serverOptions.value
	} catch (error) {
		useHandleError(error, 'pgsql-getServerList')
	}
}

/**
 * @description 获取数据库列表
 */
const getDatabaseList = async () => {
	try {
		let params: any = {
			p: tablePageConfig.page,
			limit: tablePageConfig.row,
			tables: 'databases',
			search: searchValue.value,
			sid: selectValue.value === 'all' ? '' : selectValue.value,
		}
		if (params.sid === '') delete params.sid
		const data = await useDataHandle({
			loading: isLoading,
			request: getModulesList({ data: JSON.stringify(params) }, 'pgsql'),
			data: {
				data: [Array, tableData],
				page: useDataPage(tablePageConfig),
			},
		})
	} catch (error) {
		useHandleError(error, 'pgsql-getDatabaseList')
	}
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
