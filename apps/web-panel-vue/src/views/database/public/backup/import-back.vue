<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-button @click="uploadFile">从本地上传</el-button>

					<!-- 以下按钮为mysql特殊 -->
					<div v-if="tabActive === 'mysql'" class="ml-[1.2rem]">
						<el-button @click="onPathChange">从本机导入</el-button>
						<el-divider direction="vertical" class="!h-2rem !mx-1.2rem"></el-divider>
						<el-button @click="showLogEvent">显示日志</el-button>
					</div>
				</div>
			</template>
			<template #header-right>
				<bt-input-search v-model="tableParam.search" placeholder="请输入搜索关键字" @search="getImportBackList"> </bt-input-search>
			</template>

			<template #content>
				<bt-table :column="importTableColumn" :data="tableData" max-height="360" v-bt-loading="tableLoad"> </bt-table>
			</template>

			<template #footer-right>
				<bt-table-page :total="total" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getImportBackList" />
			</template>
		</bt-table-group>

		<bt-help :options="tipList" class="ml-[20px] mt-[20px]"> </bt-help>

		<bt-dialog title="导入数据库" v-model="showInputMysql" :area="40" showFooter @confirm="inputMysqlDbEvent">
			<el-form :model="importForm" ref="inputMysqlForm" class="p-[20px]" :rules="inputMysqlRules" @submit.native.prevent>
				<div class="flex items-center mt-[1rem] mb-[2rem]">
					<i class="el-icon-warning text-[4rem] text-warning"></i>
					<div class="ml-[1rem] text-medium leading-[2.2rem] text-secondary">当前文件存在压缩密码，请输入压缩密码进行导入</div>
				</div>
				<el-form-item label="压缩密码" prop="password">
					<bt-input v-focus placeholder="如未设置压缩密码，可为空" v-model="importForm.password" />
				</el-form-item>
			</el-form>
		</bt-dialog>

		<bt-dialog title="显示日志" v-model="showLogPopup" :area="70">
			<div class="p-2rem flex flex-col" v-bt-loading="logLoading">
				<div>
					<el-button @click="refreshLog(true)" type="default" class="!mb-1rem">刷新日志</el-button>
				</div>
				<bt-log
					class="h-41rem"
					:content="logContent"
					:isHtml="true"
					:fullScreen="{
						title: '全屏查看【数据库导入】日志',
						onRefresh: refreshLog,
					}" />
			</div>
		</bt-dialog>
	</div>
</template>
<script lang="ts" setup>
import type { ImportFileProps } from '@database/types'

import { getBackup, getImportLog, getModulesBackup, restoreBack, restoreModuleBack } from '@api/database'
import { deleteFile } from '@api/global'
import { getDatabaseStore } from '@database/useStore'

import { useOperate, usePathSize } from '@hooks/tools/table/column'
import { formatDate } from '@vueuse/core'
import { fileSelectionDialog } from '@/public/index'
import { openDataBaseUploadView, openProgressView } from '@database/useMethod'
import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDataPage, useDataHandle } from '@hooks/tools'

interface Props {
	compData?: any
}

const {
	refs: { tabActive },
} = getDatabaseStore()

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const total = ref<number>(0) // 总数
const tableData = ref([]) // 表格数据
const tableLoad = ref<boolean>(false) // 表格加载状态

const rowData = ref<any>({}) // 行数据

const showInputMysql = ref<boolean>(false) // Mysql导入弹窗
const inputMysqlForm = ref() // Mysql备份数据库表单
const importForm = reactive({ password: '' }) // 导入参数
const showLogPopup = ref<boolean>(false) // 打开导入弹窗

const logLoading = ref<boolean>(false) // 日志加载状态
const logContent = ref<string>('') // 日志内容

const tipList = [
	{ content: '仅支持sql、zip、sql.gz、(tar.gz|gz|tgz)' },
	{ content: 'zip、tar.gz压缩包结构：test.zip或test.tar.gz压缩包内，必需包含test.sql' },
	{ content: '若文件过大，您还可以使用SFTP工具，将数据库文件上传到您设置的默认备份目录' },
	{ content: '若未设置默认备份目录，默认路径为/www/backup/database' },
] // 提示列表

const inputMysqlRules = reactive({
	password: [{ required: true, message: '请输入压缩密码', trigger: 'blur' }],
}) // 表单验证

const tableParam = reactive({
	p: 1,
	limit: 10,
	search: '',
}) // 表格参数

/**
 * @description: 从本机导入 - 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: '/www/backup',
		change: async (path: string) => {
			importBackFileEvent({ path: path })
		},
		confirmText: '导入',
	})
}

/**
 * @description 导入弹窗 导入数据库文件
 * @param {ImportFileProps} row 行文件信息
 * @returns {Promise<void>}
 */
const importBackFileEvent = async (row: ImportFileProps, disk_check: boolean = false): Promise<void> => {
	rowData.value = row
	await useConfirm({
		title: '导入数据库',
		content: `<div class="text-base leading-2rem">【${props.compData.name}】数据库将被覆盖，是否继续操作？</div>`,
		isHtml: true,
		icon: 'warning-filled',
		type: 'calc',
	})
	let params: any = {
		file: row.path,
		name: props.compData.name,
	}
	if (tabActive.value !== 'mysql') {
		// 模块导入
		await useDataHandle({
			request: restoreModuleBack({ data: JSON.stringify(params) }, tabActive.value),
			loading: '正在导入数据库,请稍后...',
			message: true,
		})
		return
	} else {
		// mysql导入
		if (disk_check) params['disk_check'] = true
		handleImportMysqlEvent(params, () => importBackFileEvent(row, true)) // mysql导入
	}
}

/**
 * @description 导入数据库 - mysql
 * @param params
 */
const handleImportMysqlEvent = async (params: any, request: () => {}) => {
	// mysql 打开进度弹窗
	const importView = openProgressView({
		type: 'import',
		config: { name: props.compData.name },
	})
	const popup = await importView

	const res = await useDataHandle({
		request: restoreBack(params),
		message: true,
	})

	// 结果处理
	if (res.msg === '请您输入密码') {
		popup?.unmount() // 关闭弹窗
		showInputMysql.value = true // 打开输入密码弹窗
		return
	}

	if (res.msg?.indexOf('警告') !== -1) {
		await continueImportData(res.msg)
		request() // 继续导入
		return
	}
	popup?.unmount() // 关闭弹窗
}

/**
 * @description 继续导入数据提示
 * @param {string} msg 提示信息
 * @returns {Promise<void>}
 */
const continueImportData = (msg: string) => {
	return useConfirm({
		title: '提示',
		isHtml: true,
		width: '50rem',
		iconColor: 'error',
		confirmText: '继续导入',
		content: `<div class="flex"><div><div>${msg}</div><div>
			<p>如继续导入可能会有以下影响：</p>
			<p>1.导入数据不完整</p>
			<p>2.系统运行缓慢</p>
			<p>3.面板无法正常工作</p>
			<p>4.mysql无法正常运行</p></div></div></div>`,
	})
}

/**
 * @description 导入数据库 - mysql
 * @param {boolean} disk_check 是否检查磁盘
 */
const inputMysqlDbEvent = async (disk_check: boolean = false) => {
	await inputMysqlForm.value.validate()
	let params: any = {
		file: rowData.value.path,
		name: props.compData.name,
		password: importForm.password,
	}
	if (disk_check) params['disk_check'] = true
	handleImportMysqlEvent(params, () => inputMysqlDbEvent(true))
}

/**
 * @description 显示日志
 */
const showLogEvent = () => {
	showLogPopup.value = true
	refreshLog()
}

/**
 * @description 刷新日志
 * @param {boolean} isRefresh 是否刷新,刷新时提示刷新成功
 */
const refreshLog = async (isRefresh?: boolean) => {
	const res = await useDataHandle({
		loading: logLoading,
		request: getImportLog(),
		data: { msg: [String, logContent] },
	})
	if (res.msg?.indexOf('Database recovery successful') !== -1) Message.success('导入已完成')
	if (isRefresh) Message.success('刷新成功')
}

/**
 * @description 删除数据库文件
 * @param {ImportFileProps} row 行文件信息
 * @returns {Promise<void>}
 */
const delBackFileEvent = async (row: ImportFileProps): Promise<void> => {
	await useConfirm({
		title: '删除文件',
		content: `删除文件【${row.name}】后，该数据库文件将迁至回收站，是否继续操作？`,
		icon: 'warning-filled',
	})

	await useDataHandle({
		request: deleteFile({ path: row.path }),
		loading: '正在删除文件，请稍后...',
		message: true,
	})

	getImportBackList()
}

/**
 * @description 上传文件
 * @returns {Promise<void>}
 */
const uploadFile = () => {
	openDataBaseUploadView(() => getImportBackList())
}

/**
 * @description 获取数据库导入文件列表
 * @returns {Promise<void>}
 */
const getImportBackList = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: tabActive.value === 'mysql' ? getBackup({ ...tableParam }) : getModulesBackup({ data: JSON.stringify({ ...tableParam }) }, tabActive.value),
		data: {
			data: [Array, tableData],
			page: useDataPage(total),
		},
	})
}

const importTableColumn = [
	{ label: '文件名', prop: 'name' },
	{
		label: '修改时间',
		width: 200,
		render: (row: ImportFileProps) => {
			const date = new Date(Math.floor(row.mtime * 1000))
			return h('span', formatDate(date, 'YYYY-MM-DD HH:mm:ss'))
		},
	},
	usePathSize({ prop: 'size', width: 100 }),
	useOperate([
		{ onClick: (row: ImportFileProps) => importBackFileEvent(row), title: '导入' },
		{ onClick: (row: ImportFileProps) => delBackFileEvent(row), title: '删除' },
	]), // 操作
]

/**
 * @description 获取数据库导入状态
 */
const checkImportStatus = async () => {
	const res = await useDataHandle({
		request: getImportLog(),
		data: { db_name: String },
	})
	if (res?.db_name) {
		openProgressView({
			type: 'import',
			config: { name: res?.db_name },
		})
	}
}

onMounted(() => {
	getImportBackList() // 获取数据库导入文件列表
	checkImportStatus() // 检查导入状态
})
</script>
