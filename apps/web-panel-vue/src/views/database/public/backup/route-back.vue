<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<!-- mysql下拉选择框类型 -->
				<template v-if="tabActive == 'mysql'">
					<el-dropdown split-button type="primary" @command="handleBackCommand" @click="handleBackCommand('databaseBack')">
						备份数据库
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="databaseBack"> 备份数据库 </el-dropdown-item>
								<el-dropdown-item command="databasePwdBack"> 加密备份数据库 </el-dropdown-item>
								<el-dropdown-item command="tableBack">表备份</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</template>
				<!-- 其他模块 直接备份 -->
				<template v-else>
					<el-button type="primary" @click="routeBackEvent(false)"> 备份数据库 </el-button>
					<el-button type="default" @click="openTableBackView()"> 表备份 </el-button>
				</template>
			</template>

			<!-- 备份路径调整,涉及到未完成的公共方法，先隐藏 -->
			<template #header-right>
				<!-- <el-dropdown :hide-on-click="false" @command="handleBackCommand">
					<el-button><i class="svgtofont-el-setting text-base" /> </el-button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="backPath">备份目录</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown> -->
			</template>
			<template #content>
				<bt-table ref="routeBackupRef" :data="tableData" v-bt-loading="tableLoading" v-bt-loading:title="'正在加载中，请稍后...'" description="暂无数据" :max-height="460" :column="tableColumns"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :options="batchOptions" :table-ref="routeBackupRef" />
			</template>
			<template #footer-right>
				<bt-table-page :total="tableParam.total" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getRouteBackList" />
			</template>

			<template #popup>
				<bt-dialog title="更换默认备份目录" v-model="pathPopup" :area="42" @confirm="setDefaultPath" showFooter>
					<div class="p-20px">
						<el-form
							ref="ruleFormData"
							class="mr-[16px] w-[80%]"
							:model="pathForm"
							:rule="{
								backupPath: [
									{
										required: true,
										message: '请输入默认备份目录',
										trigger: 'blur',
									},
								],
							}">
							<el-form-item label="默认备份目录" prop="backupPath">
								<bt-input-icon icon="icon-file_mode" v-model="pathForm.backupPath" @icon-click="onPathChange" width="26rem" />
							</el-form-item>
						</el-form>
					</div>
				</bt-dialog>

				<bt-dialog :title="isOther ? '数据库加密密码' : '加密备份数据库'" v-model="pwdBackPopup" :area="42" @confirm="setPwdBack" showFooter @cancel="() => (pwdBackForm.pwd = '')">
					<div class="p-20px">
						<el-form
							ref="pwdBackFormRef"
							class="mr-[16px] w-[80%]"
							:model="pwdBackForm"
							:rules="{
								pwd: [
									{
										required: true,
										message: '请输入压缩密码',
										trigger: 'blur',
									},
								],
							}">
							<el-form-item label="压缩密码" prop="pwd">
								<bt-input-icon v-if="!isOther" v-model="pwdBackForm.pwd" icon="el-refresh" width="26rem" @icon-click="() => (pwdBackForm.pwd = getRandomChart(16))" :is-active="true" />
								<bt-input v-else v-model="pwdBackForm.pwd" width="26rem"></bt-input>
							</el-form-item>
						</el-form>
						<ul class="mt-4px leading-8 text-small list-disc ml-[20px]" v-show="isOther">
							<li class="text-warning">设置密码后请注意保存密码，以防忘记密码导致无法恢复备份数据</li>
						</ul>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>

		<ul class="mt-8px leading-8 text-small list-disc ml-20px">
			<!-- <li>如需从云存储(如: 阿里云OSS)恢复数据库，请到指定云存储下载后上传服务器恢复</li> -->
			<li>
				定时备份请前往【
				<span title="点击前往【计划任务】" class="bt-link" @click="jumpPage"> 计划任务 </span>
				】增加【备份数据库】
			</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import { backDatabase, backModuleDatabase, backupDownload, checkDatabasePass, delBackup, restoreBack, restoreModuleBack } from '@/api/database'
import { getDataInfo } from '@/api/global'
import { getDatabaseStore } from '@database/useStore'
import { useGlobalStore } from '@store/global'

import { Message } from '@hooks/tools'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDialog } from '@hooks/tools'
import { useBatchStatus, useCheckbox, useOperate, usePathSize, usePs } from '@hooks/tools/table/column'
import { getRandomChart, isArray, isString } from '@utils/index'

import { fileSelectionDialog } from '@/public/index'
import { useHandleError } from '@hooks/tools'
import { openProgressView, storageData } from '../../useMethod'

interface Props {
	compData: {
		id: number
		name: string
	}
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		id: 0,
		name: '',
	}),
})

const {
	refs: { tabActive },
	refreshTableList,
} = getDatabaseStore()

const { panel } = useGlobalStore()
const popupClose = inject<any>('popupClose') //     弹窗关闭

const isOther = ref() // 是否为其他模块
const rowData = ref() // 行数据

const routeBackupRef = ref() // 表格实例
const tableData = ref([]) // 表格数据
const tableLoading = ref<boolean>(false) // 表格loading
const maskLoading = ref<any>(false) // 遮罩loading

const { id, name } = props.compData // 组件传递的数据
const tableParam = reactive({
	search: id,
	type: 1,
	table: 'backup',
	total: 0,
	p: 1,
	limit: 10,
})

const pathPopup = ref(false) // 备份目录弹窗
const pathForm = reactive({ backupPath: '' }) // 备份目录表单

const pwdBackFormRef = ref() // 加密备份表单实例
const pwdBackPopup = ref(false) // 加密备份弹窗
const pwdBackForm = reactive({ pwd: '' }) // 加密备份表单

const batchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			await batchConfirm({
				title: `批量删除备份文件`,
				content: `批量删除已选备份文件，是否继续操作？`,
				column: [{ prop: 'filename', label: '文件名' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
				onConfirm: async () => {
					await nextAll(delBackEvent) // 递归操作所有选中的数据
					getRouteBackList() // 执行完毕的代码，刷新列表
					refreshTableList()
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
]

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: pathForm.backupPath,
		change: (path: string) => {
			pathForm.backupPath = path
		},
	})
}

/**
 * @description 设置默认备份目录
 */
const setDefaultPath = async () => {
	await useConfirm({
		title: '提示',
		content: '修改默认备份目录，会导致网站和站点默认备份会备份到该目录下，是否继续操作？',
	})
	// 要先提取设置方法到全局store中，不使用config中的方法
	panel.value.backupPath = pathForm.backupPath
	// await useDataHandle({
	// 	loading: '正在设置默认备份目录，请稍后...',
	// 	request: setBackupPath({ path: pathForm.backupPath }),
	// 	message: true,
	// })
}

/**
 * @description 云存储类型
 */
const unLocalExistRow = ({ filename }: any) => (isArray(filename) || isString(filename)) && filename.indexOf('|') !== -1

/**
 * @description 打开表备份弹窗
 */
const openTableBackView = () => {
	useDialog({
		title: '表备份',
		area: 60,
		component: () => import('./table-back.vue'),
		compData: { ...props.compData, refreshFn: getRouteBackList },
		showFooter: true,
	})
}

/**
 * @description: 跳转到计划任务
 */
const jumpPage = async () => {
	const { router } = await import('@/router')
	popupClose()
	router.push({ name: 'crontab' })
}

/**
 * @description: 常规备份数据库 - 模块
 */
const routeBackEvent = async (isPwdBack?: boolean) => {
	let backupView = null
	if (tabActive.value === 'mysql') {
		backupView = openProgressView({
			type: 'backup',
			config: {
				path: '/tmp/import_sql.log',
				id: props.compData.id,
				name: props.compData.name,
			},
		})
	}
	let params = { id: props.compData.id } as { id: number; password?: string }
	if (isPwdBack) params.password = pwdBackForm.pwd
	// 其他模块不需要打开进度框
	await useDataHandle({
		loading: tabActive.value === 'mysql' ? undefined : '正在备份数据库，请稍后...',
		request:
			tabActive.value === 'mysql'
				? backDatabase(params) // mysql备份
				: backModuleDatabase(
						{ data: JSON.stringify(params) }, // 模块备份
						tabActive.value
				  ),
		message: true,
		success: async (res: any) => {
			const popup = await backupView
			popup?.unmount()
			if (res.status) {
				getRouteBackList() // 刷新列表
				refreshTableList() // 更新外部列表
			}
		},
	})
}

/**
 * @description: 删除备份
 * @param {any} row 行数据
 * @param {boolean} notMult 非批量删除
 */
const delBackEvent = async (row: any, notMult: boolean = false) => {
	try {
		// 非批量删除时，弹窗确认
		if (notMult) {
			await useConfirm({
				title: '删除备份',
				content: '<p>删除备份后，<span class="text-danger">备份数据将无法恢复</span>，是否继续？</p>',
				icon: 'warning-filled',
				isHtml: true,
			})
		}
		const res = await delBackup({ id: row.id })
		// 批量删除时，不发送提醒
		if (notMult) {
			Message.request(res)
			getRouteBackList() // 刷新列表
		}
		return res
	} catch (error) {
		useHandleError(error, 'delBackEvent')
	} finally {
		maskLoading.value && maskLoading.value.close()
	}
}

/**
 * @description: 下载备份
 * @param {any} row 行数据
 */
const downBackEvent = async (row: any) => {
	if (tabActive.value === 'mysql' && !row.localexist) {
		if (unLocalExistRow(row)) {
			Message.error('不支持从此处下载云存储备份，如需下载请在备份时勾选同时保留本地备份')
			return
			// const res = await useDataHandle({
			// 	loading: '正在下载数据库,请稍后...',
			// 	request: backupDownload({
			// 		filename: row.filename,
			// 		cron_id: row.cron_id,
			// 	}),
			// })
			// window.open(res.data.path, '_blank')
		} else {
			Message.error('备份文件不存在')
		}
	} else {
		window.open('/download?filename=' + row.local, '_blank')
	}
}

/**
 * @description: 恢复备份
 */
const restoreBackEvent = async (row: any, disk_check: boolean = false) => {
	rowData.value = row
	await useConfirm({
		title: '恢复数据库',
		content: `恢复备份文件将会覆盖当前数据库[${props.compData.name}]，是否继续？`,
		type: 'calc',
		icon: 'warning-filled',
	})
	let params: any = {
		file: row.localexist ? row.local : row.filename,
		name: props.compData.name,
	}
	if (disk_check) params['disk_check'] = true
	if (tabActive.value === 'mysql') {
		const { data } = await checkDatabasePass({ file: row.localexist ? row.local : row.filename })
		if (data) {
			// 打开密码弹窗
			isOther.value = true
			pwdBackPopup.value = true
			return
		}
		// mysql导入
		handleMysqlRestore(params, row)
	} else {
		params.file = row.local
		// 模块导入
		useDataHandle({
			loading: '正在恢复数据库,请稍后...',
			request: restoreModuleBack({ data: JSON.stringify(params) }, tabActive.value),
			message: true,
		})
	}
}

/**
 * @description mysql恢复
 * @param params
 * @param row
 */
const handleMysqlRestore = async (params: any, row: any) => {
	const importView = openProgressView({
		type: 'import',
		config: {
			path: '/tmp/import_sql.log',
			id: row.id,
			name: props.compData.name,
		},
	})
	await useDataHandle({
		request: restoreBack(params),
		message: true,
		success: async (res: any) => {
			if (res.msg?.indexOf('警告') !== -1) {
				await continueImportData(res.msg, '恢复')
				restoreBackEvent(row, true)
				return
			}
		},
	})
	const popup = await importView
	popup?.unmount()
}

/**
 * @description 继续备份数据提示
 * @param {string} msg 提示信息
 */
const continueImportData = (msg: string, type: string) => {
	return useConfirm({
		title: '提示',
		isHtml: true,
		width: '50rem',
		confirmText: `继续${type}`,
		content: `<div class="flex"><i class="svgtofont-el-warning-filled text-[4rem] text-warning mr-4"></i><div><div>${msg}</div><div>
			<p>如继续${type}可能会有以下影响：</p>
			<p>1.${type}数据不完整</p>
			<p>2.系统运行缓慢</p>
			<p>3.面板无法正常工作</p>
			<p>4.mysql无法正常运行</p></div></div></div>`,
	})
}
/**
 * @description: 处理备份数据库/表备份
 * @param {string} command 命令
 */
const handleBackCommand = (command: string) => {
	switch (command) {
		case 'databaseBack':
			routeBackEvent(false)
			break
		case 'backPath':
			break
		case 'databasePwdBack':
			pwdBackPopup.value = true
			break
		case 'tableBack':
			openTableBackView()
			break
	}
}

/**
 * @description: 加密备份数据库
 */
const setPwdBack = async () => {
	await pwdBackFormRef.value.validate()
	if (isOther.value) {
		// 其他模块
		const params = {
			file: rowData.value.localexist ? rowData.value.local : rowData.value.filename,
			name: props.compData.name,
			password: pwdBackForm.pwd,
		}
		handleMysqlRestore(params, rowData.value)
		pwdBackPopup.value = false
		isOther.value = false
	} else {
		routeBackEvent(true)
		pwdBackPopup.value = false
	}
}

/**
 * @description 初始化
 */
const getRouteBackList = async () => {
	useDataHandle({
		request: getDataInfo({ ...tableParam }),
		loading: tableLoading,
		data: {
			data: [Array, tableData],
			page: useDataPage(tableParam),
		},
	})
}

/**
 * @description: 表格列
 */
const useTableColumn = () => {
	return [
		useCheckbox(), // 复选框
		{
			label: '文件名称',
			prop: 'name',
			width: 220,
			showOverflowTooltip: true,
		},
		{
			label: '存储对象',
			render: (row: any) => {
				let isCloud: boolean = false
				let cloudName: string = '' // 当前云存储类型
				if (unLocalExistRow(row)) {
					isCloud = true
					cloudName = row.filename.match(/\|(.+)\|/, '$1')
				}
				return <span>{isCloud ? storageData[cloudName[1]] : '本地'}</span>
			},
		},
		usePathSize({ prop: 'size', width: 100 }),
		{
			width: 160,
			prop: 'addtime',
			label: '备份时间',
		},
		usePs({ table: 'backup' }), // 备注
		useOperate([
			{ isHide: (row: any) => unLocalExistRow(row), onClick: (row: any) => restoreBackEvent(row), title: '恢复' },
			{ onClick: (row: any) => downBackEvent(row), title: '下载' },
			{ onClick: (row: any) => delBackEvent(row, true), title: '删除' },
		]), // 操作
	]
}

const tableColumns = useTableColumn()

onMounted(getRouteBackList)
</script>

<style scoped lang="css">
/* :deep(.active-route .el-button) {
	border: 1px solid #20a53a !important;
	background-color: #20a53a;
} */
/* :deep(.active-route .el-dropdown__icon) {
	color: white !important;
} */
</style>
