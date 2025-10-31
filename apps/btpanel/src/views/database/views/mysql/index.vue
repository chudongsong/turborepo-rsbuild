<template>
	<div>
		<!-- 安装插件 -->
		<bt-install-mask v-if="showMask" :options="softData">
			<template #content>
				<MaskTip type="Mysql"></MaskTip>
			</template>
		</bt-install-mask>

		<!-- 错误遮罩 -->
		<bt-error-mask v-if="errorData.status" :options="errorData" />

		<el-alert type="info" :closable="false" class="!mb-[12px]" show-icon>
			<template #title>
				<div class="inline-flex items-center mr-2rem">
					<div class="mr-4 min-w-max text-secondary text-small">自动备份数据库</div>
					<el-switch size="small" class="mr-8px" v-model="isBackupDb" :width="36" @change="onChangeBackupDb"></el-switch>
					<template v-if="!isBackupDb">
						<div class="text-small">
							添加数据库后，可开启自动备份，保证数据安全。
							<!-- <br class="xl:hidden 2xl:hidden" /> -->
							<!-- 通过第三方/Mysql命令行创建的数据库，可点击"从服务器同步到面板"，同步后再进行备份。 -->
						</div>
					</template>
					<template v-else>
						<span>{{ backupCycle }}</span>
						<span class="bt-link" @click="goCrontab">[前往计划任务]</span>
					</template>
				</div>
			</template>
		</el-alert>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button type="primary" @click="openAddDatabaseView(getServerList)"> 添加数据库 </el-button>
					<!-- 未安装本地数据库时不展示 -->
					<el-button @click="getRootPwd" v-if="softData.setup">root密码</el-button>
					<el-button @click="openServerView">远程数据库</el-button>
					<el-button @click="openPHpPlugin">phpMyAdmin</el-button>

					<el-dropdown class="ml-10px" split-button type="default" @click.stop="handleClickDropdown('route')" @command="handleClickDropdown">
						高级设置
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="route">数据库备份</el-dropdown-item>
								<!-- <el-dropdown-item command="increment"> 企业增量备份 </el-dropdown-item> -->
								<el-dropdown-item command="user"> 用户管理 </el-dropdown-item>
								<!-- <el-dropdown-item command="sensitive"> 敏感词检测 </el-dropdown-item> -->
								<el-dropdown-item command="service">关联服务</el-dropdown-item>
								<el-dropdown-item command="process"> 守护进程 </el-dropdown-item>
								<el-dropdown-item command="reinforce"> 等保加固 </el-dropdown-item>
								<!-- <el-dropdown-item command="audit"> <i class="svgtofont-icon-ltd text-medium !mr-0 text-ltd"></i>日志审计 </el-dropdown-item> -->
							</el-dropdown-menu>
						</template>
					</el-dropdown>

					<!-- 同步数据库 -->
					<SyncData :comp-data="serverOptions" class="mx-[1rem]"></SyncData>

					<!-- 回收站 -->
					<el-tooltip content="点击跳转数据库回收站" placement="top">
						<el-button type="default" @click="openRecycle">
							<i class="svgtofont-el-delete mr-2px"></i>
							<span class="<2xl:hidden">回收站</span>
						</el-button>
					</el-tooltip>

					<!-- 状态 -->
					<BtSoftStateBtn v-if="softData.setup && mainWidth > 1200" class="ml-[1rem]" :plugin-name="'mysql'" :is-request="false" :pluginInfo="softData"></BtSoftStateBtn>
					<bt-link @click="npsSurveyV2Dialog({ name: '数据库', type: 12, id: 17 })" icon="desired" class="ml-[12px] <2xl:hidden" iconClass="text-medium"> 需求反馈 </bt-link>
				</div>
			</template>

			<template #header-right>
				<!-- 分类设置 -->
				<bt-table-class class="mr-[10px] !w-[14rem]" v-model="mysqlTableType" @change="searchClass" :name="'Mysql'" :options="tableTypeList" :config="getClassOption()" :ignore="ignoreClass" />

				<BtInputSearch :class="`!w-[${searchWidth}px]`" :disabledPopover="false" v-model="searchValue" clearable placeholder="请输入数据库名称/备注" @search="search">
					<BtSearchHistory
						:list="{
							historyList: historyList,
							recommendList: recommendList,
						}"
						name="databases"
						keys="databases"
						@update="refreshTableList"
						@search="search"></BtSearchHistory>
				</BtInputSearch>

				<!-- 刷新按钮 -->
				<bt-table-refresh class="ml-[10px]" @refresh="refreshTableList" />

				<!-- 列显示 -->
				<bt-table-column name="database_mysql" class="ml-[10px]" :table-ref="mysqlDbTableRef" :column="tableColumns" />
			</template>

			<template #content>
				<bt-table ref="mysqlDbTableRef" v-bt-loading="isLoading" :column="tableColumns" :data="tableData" :total="tablePageConfig.total" />
			</template>

			<template #footer-left>
				<bt-table-batch :options="batchOptions" :table-ref="mysqlDbTableRef" />
			</template>

			<template #footer-right>
				<bt-table-page :total="tablePageConfig.total" v-model:page="tablePageConfig.page" v-model:row="tablePageConfig.row" @change="refreshTableList" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import type { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types.d'
import type { TableColumnProps } from '@components/data/bt-table/types.d'
import type { TablePageProps } from '@components/extension/bt-table-page/types.d'
import type { SelectOptionProps } from '@components/form/bt-select/types.d'
import type { CloudServerItem, DatabaseTableItemProps, MysqlTableProps } from '@database/types.d'

import { useBackups, useCheckbox, useOperate, usePs, useQuota } from '@/hooks/tools/table/column'
import { addDbTypes, delDbTypes, getAutoConfig, getDbTypes, getMysqlCloudServer, getMysqlList, getMysqlRootPwd, modifyDbTypes, setAutoConfig } from '@api/database'
import { openToolsView, useBatchConfig, useGeneralTableConfig, usePosition, openPHpPlugin, setBatchClass, dataBak } from '@database/useMethod'
import { getDatabaseStore } from '@database/useStore'
import { Message, useDataHandle, useDataPage, useDialog } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

import { getPluginInfo } from '@/api/global'
import { delayExecAsync, productPaymentDialog } from '@/public/index'
import { npsSurveyV2Dialog } from '@/public/index'
import { openAddDatabaseView, openBackView, openDeleteDatabaseView, openPermissionView, openRootPwdView, openServerView, openSetPwdView } from '@database/useMethod'
import { imitatePhpAdminForm, imitatePhpAdminPanelForm, setColumnCustom } from '@utils/index'
import { useRouter } from 'vue-router'

import BtSoftStateBtn from '@components/extension/bt-soft-state/index.vue'
import MaskTip from '@database/public/mask-tip/index.vue'
import SyncData from '@database/public/sync-data/index.vue'

const {
	refs: { isRefreshTable, isLoading, softData, isHaveServer, isRefreshClassList },
	resetRefresh,
	refreshTableList,
} = getDatabaseStore()

const router = useRouter() // 路由

const { payment, mainWidth } = useGlobalStore()
const authType = computed(() => payment.value.authType) // 授权类型
// 监听插件安装状态，安装状态和显示方式相反，所以取反
// 错误信息
const errorData = reactive({
	status: false,
	code: '',
})
const isBackupDb = ref(false) // 是否自动备份数据库
const backupCycle = ref('') // 备份信息

const tablePageConfig = reactive<TablePageProps>({
	total: 0,
	page: 1,
	row: 10,
}) // 表格分页配置
const tableData = ref([]) // 表格数据
const tableColumns = ref<TableColumnProps[]>([]) // 表格列配置
const mysqlDbTableRef = ref(null) // 表格ref

const mysqlTableType = ref('all') // 表格右上方选择框
const searchValue = ref('') // 搜索框
const serverOptions = ref<Array<CloudServerItem>>([]) // 服务器列表

const tableTypeList = ref<SelectOptionProps[]>([]) // 分类列表
const historyList = ref([]) // 搜索历史

const searchWidth = computed(() => {
	if (mainWidth.value > 1530) return 280
	if (mainWidth.value > 1440) return 200
	if (mainWidth.value > 1200) return 150
	return 120
})

const showMask = computed(() => !softData.value.setup && !isHaveServer.value) // 是否显示遮罩层

watch(isRefreshClassList, val => {
	if (val) {
		isRefreshClassList.value = false
		getClassList()
	}
})

const batchOptions: TableBatchOptionsProps[] = [
	{
		label: '设置权限',
		value: 'permission',
		event: async (batchConfirm, nextAll, selectedList, options, clearBatch, config) => openPermissionView(selectedList.value, 'multlples', { ...config, clearBatch }),
	},
	{
		label: '设置分类',
		value: 'class',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			setBatchClass(selectedList, clearSelection, classList, config)
		},
	},
	...useBatchConfig(),
] // 批量操作配置

const classList = ref<SelectOptionProps[]>([]) // 分类列表
const ignoreClass = ref<any>([])

/**
 * @description 搜索
 * @param val
 */
const search = (val: string) => {
	searchValue.value = val
	tablePageConfig.page = 1
	refreshTableList()
}

const searchClass = () => {
	tablePageConfig.page = 1
	refreshTableList()
}

/**
 * @description 获取分类数据
 * @returns {void} void
 */
const getClassList = async (): Promise<SelectOptionProps[]> => {
	await useDataHandle({
		request: getDbTypes({ db_type: 'mysql' }),
		data: { msg: Array },
		success: ({ msg: data }: { msg: { ps: string; id: number }[] }) => {
			classList.value = [
				...data.map((item: any) => ({
					label: item.ps,
					value: String(item.id),
				})),
			]
			tableTypeList.value = [
				{ label: '全部分类', value: 'all' },
				...data.map((item: any) => ({
					label: item.ps,
					value: String(item.id),
				})),
			]
			ignoreClass.value = tableTypeList.value.map((item: any) => item.value).filter((item: any) => Number(item) >= 0 || item === 'all')
		},
	})
	return Promise.resolve(tableTypeList.value || [])
}

/**
 * @description 获取分类选项
 */
const getClassOption = () => ({
	getClassList,
	addClass: ({ ps }: { ps: string }) => addDbTypes({ ps, db_type: 'mysql' }),
	editClass: ({ ps, id }: { ps: string; id: number }) => modifyDbTypes({ ps, id, db_type: 'mysql' }),
	deleteClass: ({ id }: { id: number }) => delDbTypes({ id, db_type: 'mysql' }),
})

/**
 * @description 获取root密码,并打开弹窗
 */
const getRootPwd = async () => {
	const rootPwd: string = await useDataHandle({
		loading: '正在获取密码，请稍后...',
		request: getMysqlRootPwd({ table: 'config', id: 1, key: 'mysql_root' }),
		data: String,
	})
	openRootPwdView(rootPwd)
}

/**
 * @description 点击下拉框
 */
const handleClickDropdown = (name: string) => {
	useDialog({
		title: '高级设置',
		area: [96, 62],
		compData: name,
		component: () => import('@database/views/mysql/advanced-setting/index.vue'),
	})
}

/**
 * @description 设置Mysql配额
 * @param row 当前行信息
 */
const setQuotaEvent = (row: DatabaseTableItemProps): void => {
	if (authType.value !== 'ltd') {
		productPaymentDialog({ sourceId: 52 }) // 弹出支付界面
		return
	}
	if (row.sid !== 0) {
		Message.error('仅本地数据库支持设置容量配额')
		return
	}
	useDialog({
		title: '数据库配额',
		area: 50,
		component: () => import('@database/views/mysql/quota-setting/index.vue'),
		compData: row,
		showFooter: true,
	})
}

/**
 * @description 跳转php界面
 * @param { string } type 操作类型 panel:面板访问 public:公共访问
 */
const goPhpAdminEvent = async (row: DatabaseTableItemProps, type?: string) => {
	let loading = Message.success('正在跳转phpMyAdmin，请稍后...')

	try {
		const { data } = await getPluginInfo({ sName: 'phpmyadmin' })
		if (type === 'panel') {
			// 面板访问
			if (data?.ext.auth) {
				return Message.error('当前phpMyAdmin已开启密码访问，请使用【通过公共访问】进行访问')
			}
			if (data?.setup === 'false') {
				return Message.error('当前phpMyAdmin未安装，请先安装phpMyAdmin')
			}
			await imitatePhpAdminPanelForm(row.username, row.password) // 模拟表单提交
		} else {
			//公共访问
			if (data?.status) {
				const load = Message.success('正在跳转phpMyAdmin，请稍后...')
				await imitatePhpAdminForm(row.name, row.username, row.password, data.ext.url) // 模拟表单提交
				load.close()
			} else {
				Message.error('未开启公共访问权限，请开启后再访问')
			}
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	await useDataHandle({
		request: getMysqlCloudServer(),
		data: [Array, serverOptions],
	})
	if (!serverOptions.value.length) isHaveServer.value = false
	return serverOptions.value
}

/**
 * @description 获取数据库列表
 */
const getDatabaseList = async (
	params: MysqlTableProps = {
		p: tablePageConfig.page,
		limit: tablePageConfig.row,
		table: 'databases',
		search: searchValue.value,
		sid: mysqlTableType.value === 'all' ? '' : mysqlTableType.value,
	}
) => {
	if (params.sid === '') delete params.sid
	if (Number(params.sid) < 0) {
		// 分类设置传参
		params['type_id'] = params.sid
		delete params.sid
	}
	await useDataHandle({
		loading: isLoading,
		request: getMysqlList(params),
		data: {
			data: [Array, tableData],
			page: useDataPage(tablePageConfig),
			search_history: [Array, historyList],
			error: String,
		},
		success: (data: AnyObject) => {
			dataBak.value = data.data
			if (data.error) {
				errorData.status = true
				errorData.code = data.error
			}
		},
	})
}

/**
 * @description: 获取自动备份数据库
 */
const getBackupDb = async () => {
	try {
		const { data } = await getAutoConfig({ name: 'mysql' })
		isBackupDb.value = data.status ? true : false
		backupCycle.value = data.cycle
	} catch (error) {}
}

/**
 * @description: 改变自动备份数据库状态
 * @param {boolean} val 是否自动备份数据库
 */
const onChangeBackupDb = async (val: boolean) => {
	isBackupDb.value = val
	let loadT: any
	try {
		await useDataHandle({
			loading: '正在设置自动备份数据库...',
			request: setAutoConfig({ name: 'mysql', status: val ? 1 : 0 }),
			message: true,
			success: (res: any) => {
				if (!res.status) isBackupDb.value = !val
			},
		})
	} catch (error) {
	} finally {
		loadT.close()
	}
}

/**
 * @description: 跳转计划任务
 */
const goCrontab = () => router.push({ path: '/crontab/task' })

/*
 * @description 打开回收站
 */
const openRecycle = () => {
	localStorage.setItem('MYSQL-RECYCLE', 'true')
	window.location.href = '/files'
}

/**
 * @description 初始化
 */
const init = async () => {
	tableColumns.value = useTableColumn()
	!showMask.value &&
		delayExecAsync({
			promises: [getClassList], // 获取分类数据
			delay: 1000,
		})
	getBackupDb() // 获取自动备份数据库
	getDatabaseList() // 获取数据库列表
	await getServerList() // 获取服务器列表
	tableColumns.value = useTableColumn()
	setColumnCustom(tableColumns.value, 'database_mysql_column')
}

const recommendList = [
	{
		name: '企业增量备份',
		ename: 'increment',
		callback: () => handleClickDropdown('increment'),
	},
	{ name: '远程数据库', ename: 'server', callback: () => openServerView() },
	{
		name: '关联服务',
		ename: 'service',
		callback: () => handleClickDropdown('service'),
	},
	{
		name: '容量限制',
		ename: 'capacity',
		callback: () => {
			if (!tableData.value.length) return Message.error('暂无数据库，请先添加数据库')
			// isSearchClick.value = true
			// 是否存在本地数据库
			const haveLocal = tableData.value.some((item: any) => item.sid === 0)
			if (!haveLocal) return Message.error('当前页暂无本地数据库进行容量配额！')
			// 是本地数据库的行数据
			const row = tableData.value.filter((item: any) => item.sid === 0)[0]
			setQuotaEvent(row)
		},
	},
	{ name: '敏感词检测', ename: 'sensitive', callback: () => handleClickDropdown('sensitive') },
	{ name: 'Mysql用户管理', ename: 'user', callback: () => handleClickDropdown('user') },
]

/**
 * @description 表格配置
 * @returns {Promise<void>} void
 */
const useTableColumn = () => {
	return [
		useCheckbox({ type: 'page', key: 'id' }),
		...useGeneralTableConfig(openSetPwdView),
		// useQuota({ event: setQuotaEvent }), // 容量   10.0下架
		useBackups({ event: (row, type) => openBackView(row, type) }), // 备份
		usePosition(serverOptions.value, 'mysql'),
		usePs({ table: 'databases' }), // 备注
		useOperate([
			{
				// 当为远程数据库时,隐藏
				isHide: (row: any) => (row.sid ? true : false),
				onClick: (row: DatabaseTableItemProps) => goPhpAdminEvent(row, 'panel'),
				title: '管理',
			},
			{ onClick: openPermissionView, title: '权限' },
			{
				onClick: (row: DatabaseTableItemProps) => openToolsView(row),
				title: '工具',
			},
			{
				onClick: (row: DatabaseTableItemProps) => openSetPwdView(row),
				title: '改密',
			},
			{
				onClick: (row: DatabaseTableItemProps) => openDeleteDatabaseView(row),
				title: '删除',
			},
		]), // 操作
	]
}

// 监听表格刷新
watch(
	() => isRefreshTable.value,
	async (value: boolean) => {
		if (value) await getDatabaseList()
		resetRefresh() // 重置
	}
)

provide('serverList', serverOptions) // 服务器列表

onMounted(init)
</script>

<style scoped></style>
