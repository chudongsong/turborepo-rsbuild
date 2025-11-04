<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button @click="openDatabaseBackView" type="primary">数据库备份</el-button>
				<el-button @click="openDataBaseUploadView(() => getMysqlAllBackList(), path)">从本地上传</el-button>
			</template>
			<template #content>
				<bt-table :column="allBackTableColumn" :data="allBackTableData" v-bt-loading="tableLoading"> </bt-table>
			</template>
			<template #footer-right>
				<bt-table-page :total="tableParam.total" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getMysqlAllBackList()" />
			</template>
			<template #popup>
				<bt-dialog title="数据库备份" v-model="backPopup" @confirm="submitBackEvent" showFooter :area="60">
					<div class="p-20px">
						<bt-table-group>
							<template #header-right>
								<el-select class="!w-[16rem]" v-model="serverId" @change="changeServerEvent">
									<el-option v-for="(item, index) in serverOptions" :key="index" :label="item.ps" :value="item.id"></el-option>
								</el-select>
							</template>
							<template #content>
								<bt-table ref="backupTableRef" :column="serverBackColumn" v-bt-loading="backLoading" v-bt-loading:title="'正在加载列表，请稍后...'" :data="backTableData" max-height="360"> </bt-table>
							</template>
						</bt-table-group>
					</div>
				</bt-dialog>

				<bt-dialog :title="operateType === 'restore' ? '恢复数据库' : '数据库详情'" v-model="detailPopup" showFooter :area="60" @confirm="confirmRestoreEvent" @cancel="checkRestore = ''">
					<div class="p-20px flex flex-col">
						<bt-table :column="detailColumn" :data="detailTableData" max-height="360"> </bt-table>
						<div v-if="operateType === 'restore'">
							<div class="flex items-center my-12px text-base">
								<i class="text-warning svgtofont-el-warning-filled !text-titleLarge mr-8px"></i>
								<span>恢复后会覆盖当前数据库数据，此操作不可逆，是否继续操作？</span>
							</div>
							<div class="p-16px flex flex-col bg-base">
								<span class="mb-4px">请手动输入 <span class="text-danger">"我已知晓"</span> ，完成验证</span>
								<bt-input v-model="checkRestore" v-focus width="52rem" @paste.native.capture.prevent></bt-input>
							</div>
						</div>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<ul class="mt-16px leading-8 text-small list-disc ml-20px">
			<li>恢复仅限于在本页面进行的备份进行恢复，非本页面的备份数据可能无法正确恢复，请注意。</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import type { CloudServerItem } from '@database/types'

import { formatTime, getByteUnit } from '@utils/index'

import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'

import { useCheckbox, useOperate, usePathSize } from '@/hooks/tools/table/column'
import { usePosition, openDataBaseUploadView } from '@/views/database/useMethod'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { backupDatabase, getBackupDatabase, getMysqlAllBackup, getMysqlBackupInfo, getMysqlCloudServer, inputDatabase } from '@/api/database'
import { deleteFile } from '@/api/global'
import { useGlobalStore } from '@/store/global'

const { panel } = useGlobalStore()

const serverOptions = shallowRef<CloudServerItem[]>([]) // 服务器列表
const serverId = ref(serverOptions.value[0]?.id) // 服务器id

const tableLoading = ref(false) // 数据库备份列表loading -高级设置层
const allBackTableData = ref([]) // 数据库备份列表
const tableParam = reactive({
	p: 1,
	limit: 10,
	total: 0,
}) // 表格参数

const rowData = ref<any>({}) // 行数据
const checkRestore = ref('') // 恢复数据库验证
const operateType = ref<'restore' | 'detail'>('detail') // 操作类型

const backPopup = ref(false) // 数据库备份弹窗
const backTableData = ref([]) // 数据库备份列表
const backLoading = ref(false) // 数据库备份列表loading
const backupTableRef = ref<any>() // 备份表格

const detailPopup = ref(false) // 详情弹窗
const detailTableData = ref([]) // 数据库详情列表
const detailColumn = [
	{ label: '数据库名称', prop: 'name' },
	{ label: '大小', prop: 'size', render: (row: any) => getByteUnit(row.size) },
] // 详情列表

const path = (panel.value.backupPath + '/database/mysql/all_backup/').replace(/\/\//g, '/') // 上传路径

/**
 * @description 数据库备份
 * @returns {Promise<void>}
 */
const changeServerEvent = async () => {
	const res = await useDataHandle({
		request: getBackupDatabase({ sid: serverId.value }),
		loading: backLoading,
		data: { status: Boolean, msg: String, data: [Array, backTableData] },
	})
	if (!res.status) {
		Message.error(res.msg || '获取数据库备份列表失败')
		backTableData.value = []
	}
}

/**
 * @description 打开数据库备份弹窗
 */
const openDatabaseBackView = async () => {
	await getServerList()
	await changeServerEvent()
	serverBackColumn.value = [useCheckbox(), { label: '数据库名称', prop: 'name', width: 200 }, { label: '表数量', prop: 'table_num' }, usePosition(serverOptions.value, 'mysql'), { label: '大小', prop: 'size' }]
	backPopup.value = true
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	await useDataHandle({
		loading: '正在获取服务器数据，请稍后...',
		request: getMysqlCloudServer(),
		data: [Array, serverOptions],
	})
	serverId.value = serverOptions.value[0]?.id
}

/**
 * @description 详情展示
 * @param {any} row 行文件信息
 */
const onDetailBackEvent = async (row: any): Promise<void> => {
	await useDataHandle({
		request: getMysqlBackupInfo({ file: row.path }),
		loading: '正在获取数据库详情，请稍后...',
		data: { data: [Array, detailTableData], msg: String },
		success: (res: any) => {
			if (res.msg !== 'ok') {
				Message.error(res.msg)
			} else {
				operateType.value = 'detail'
				detailPopup.value = true // 详情弹窗
			}
		},
	})
}

/**
 * @description 删除数据库备份文件
 * @param {any} row 行文件信息
 */
const onDelBackEvent = async (row: any): Promise<void> => {
	await useConfirm({
		title: '删除文件',
		content: `删除选中数据库备份文件后，该数据库备份文件将永久消失，是否继续操作？`,
		icon: 'warning-filled',
	})
	await useDataHandle({
		request: deleteFile({ path: row.path }),
		loading: '正在删除文件，请稍后...',
		message: true,
	})
	getMysqlAllBackList()
}

/**
 * @description 恢复弹窗
 * @param {any} row 行文件信息
 * @returns {Promise<void>}
 */
const onRestoreBackEvent = async (row: any): Promise<void> => {
	rowData.value = row
	await useDataHandle({
		request: getMysqlBackupInfo({ file: row.path }),
		loading: '正在获取数据库详情，请稍后...',
		data: {
			data: [Array, detailTableData],
		},
	})
	detailPopup.value = true
	operateType.value = 'restore'
}

/**
 * @description 确认恢复数据库
 * @returns {Promise<void>}
 */
const confirmRestoreEvent = async (close: AnyFunction) => {
	if (operateType.value === 'detail') return close()
	if (checkRestore.value !== '我已知晓') {
		Message.error('输入错误，请重新输入！')
		return false
	}
	await useDataHandle({
		request: inputDatabase({ file: rowData.value.path }),
		loading: '正在导入数据库，请稍后...',
		message: true,
	})
	checkRestore.value = ''
}

/**
 * @description 下载备份文件
 * @param {any} row 行文件信息
 */
const onDownBackEvent = async (row: any): Promise<void> => {
	window.open('/download?filename=' + encodeURIComponent(row.path), '_blank', 'noopener,noreferrer')
}

/**
 * @description 获取数据库备份列表
 * @returns {Promise<void>}
 */
const getMysqlAllBackList = async () => {
	await useDataHandle({
		request: getMysqlAllBackup({ ...tableParam }),
		loading: tableLoading,
		data: {
			data: [Array, allBackTableData],
			page: useDataPage(tableParam),
		},
	})
}

/**
 * @description 提交数据库备份
 */
const submitBackEvent = async () => {
	// 已选的数据库
	const selectedData = backupTableRef.value.tableSelectList
	if (!selectedData.length) {
		Message.error('请选择需要备份的数据库')
		return false
	}

	await useDataHandle({
		request: backupDatabase({
			sid: serverId.value,
			db_list: JSON.stringify(selectedData.map((item: any) => item.name)),
		}),
		loading: '正在备份中，请稍后...',
		message: true,
	})

	backPopup.value = false
	getMysqlAllBackList()
}

const allBackTableColumn = [
	{ label: '文件名称', prop: 'name' },
	{
		label: '备份时间',
		prop: 'mtime',
		width: 200,
		render: (row: any) => {
			const date = new Date(row.mtime * 1000)
			return h('span', formatTime(date))
		},
	},
	usePathSize({ prop: 'size', width: 100 }),
	useOperate([
		{ onClick: onDetailBackEvent, title: '详情' },
		{ onClick: onRestoreBackEvent, title: '恢复' },
		{ onClick: onDownBackEvent, title: '下载' },
		{ onClick: onDelBackEvent, title: '删除' },
	]), // 操作
]

const serverBackColumn = ref()

onMounted(getMysqlAllBackList)

defineExpose({
	init: getMysqlAllBackList,
})
</script>

<style lang="css" scoped>
:deep(.el-select .el-input--small input.el-input__inner) {
	padding-right: 2.4rem;
}
:deep(.el-table__fixed-right:before) {
	@apply h-0;
}
</style>
