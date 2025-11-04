<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取站点防篡改信息，请稍侯'">
		<Masker v-if="!ruleData?.path" :compData="{ ...compData, init: getTamperList }"></Masker>

		<bt-tabs ref="tamperRef" type="" v-model="tabActive" :options="tabComponent" @change="handleTabClick"></bt-tabs>

		<bt-table-group>
			<template #header-left>
				<div class="flex gap-col-1rem">
					<bt-input v-model="fileType" width="30rem" placeholder="文件类型"></bt-input>
					<el-button type="primary" @click="addFileType">添加</el-button>
				</div>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getTamperList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="protectTableRef" :column="tableColumns" :max-height="360" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="protectTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right></template>
		</bt-table-group>

		<bt-help class="ml-2rem mt-2rem tamper-help-info" list-style="disc" :options="helpList"> </bt-help>
		<bt-dialog :title="'批量同步到其他站点'" v-model="applyPopup" :area="50" show-footer @confirm="applyConfirm">
			<div class="p-2rem">
				<el-form v-bt-loading="applyFormLoading" ref="applyFormRef" :model="applyForm" :rules="applyRules" :disabled="formDisabled">
					<el-form-item label="同步站点" prop="sites">
						<el-select v-model="applyForm.sites" multiple collapse-tags class="w-30rem" placeholder="请选择站点">
							<template v-for="item in applyForm.list">
								<el-option v-if="item.id !== siteInfo.id" :key="item.id" :label="item.rname" :value="item.id"></el-option>
							</template>
						</el-select>
					</el-form-item>
				</el-form>
				<bt-help list-style="disc" class="mt-2rem ml-2rem" :options="applyHelpList"> </bt-help>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { getPageTotal } from '@/utils'
import { openResultDialog, tamperCoreLogDialog } from '@/views/site/useController'
import { useSiteStore } from '@/views/site/useStore'
import { addBlackExts, getActionLogsForExts, getSiteInfo, getTamperRuleByPath, releaseFileExt, removeBlackExts, syncBlackExts } from '@api/site'
import Masker from '@site/views/php-model/tamper-proof-core/tamper-core/masker.vue'
import { ElSwitch } from 'element-plus'

interface TabProps {
	title: string
	type: string
	active?: true
	component: any
}

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()

const tabActive = ref<string>('file')
const protectTableRef = ref<any>()
const loading = ref<boolean>(false)
const fileType = ref<string>('') // 文件类型
const tableLoading = ref<boolean>(false) // 表格loading
const ruleData = ref<any>({}) // 当前规则数据
const tableData = ref<any[]>([]) // 表格数据
const checkedList = ref<any[]>([]) // 选中的数据

const applyPopup = ref<boolean>(false) // 批量同步到其他站点弹窗
const applyFormLoading = ref<boolean>(false)
const applyFormRef = ref<any>()
const formDisabled = ref<boolean>(false)
const applyForm = reactive<any>({
	sites: [],
	list: [],
})
const applyRules = reactive<any>({
	sites: [{ required: true, message: '请选择同步配置', trigger: 'blur' }],
})

const tabComponent = ref<any[]>([
	{
		label: '受保护的文件类型',
		name: 'file',
		lazy: true,
		render: () => <span></span>,
	},
	{
		label: '受保护的文件目录',
		name: 'directory',
		lazy: true,
		render: () => <span></span>,
	},
])

const helpList = computed(() => {
	return tabActive.value === 'file'
		? [
				{
					content: '所谓文件类型是指文件名结尾的字符串，不一定是扩展名',
				},
				{
					content: (
						<>
							例如
							<code>.php</code>,<code>.html</code>,<code>.js</code>,<code>index.php</code>等
						</>
					),
				},
				{
					content: (
						<>
							例1：
							<code>.php</code>
							匹配：
							<code>./1.php</code>
							<code>./test/2.php</code>
							不匹配：
							<code>./1.php/1.txt</code>
						</>
					),
				},
				{
					content: (
						<>
							例2：
							<code>index.php</code>
							匹配：
							<code>./index.php</code>
							<code>./test/index.php</code>
							<code>./abc_index.php</code>
							不匹配：
							<code>./index.php.tar.gz</code>
						</>
					),
				},
		  ]
		: [
				{
					content: '支持以下4种方式',
				},
				{
					content: (
						<>
							1、完整文件路径，如：
							<code>/www/wwwroot/test/123.php</code>
						</>
					),
				},
				{
					content: (
						<>
							2、相对于网站的相对路径，如：全路径是
							<code>/www/wwwroot/test/app/123.php</code>
							相对路径
							<code>./app/123.php</code>
						</>
					),
				},
				{
					content: (
						<>
							3、指定目录下的所有文件，如：
							<code>/www/wwwroot/test/app/*</code>
							相对路径
							<code>./app/*</code>
						</>
					),
				},
				{
					content: (
						<>
							4、指定目录下的指定文件类型，如：
							<code>/www/wwwroot/test/app/*.php</code>
							相对路径
							<code>./app/*.php</code>
						</>
					),
				},
				{
					content: <span class="text-danger">注意，已经在【受保护的文件类型】中被包含的文件无需专门设置规则</span>,
				},
		  ]
})
const applyHelpList = [
	{
		content: (
			<>
				【一键应用】将当前网站已配置的
				<span class="text-danger">排除目录</span>，<span class="text-danger">防护文件</span>
				，同步配置到其他网站
			</>
		),
	},
]

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['open', '批量开启受保护文件类型'],
		['close', '批量关闭受保护文件类型'],
		['delete', '批量删除受保护文件类型'],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['open', releaseFileExt],
			['close', releaseFileExt],
			['delete', removeBlackExts],
		])
		const { exts } = item
		const { pid: path_id, path } = ruleData.value
		const fn = requestList.get(value)
		switch (value) {
			case 'open':
			case 'close':
				if (fn) {
					let params: any = {
						path_id,
						exts,
						release: value !== 'open' ? 1 : 0,
					}
					return fn(params)
				}
			case 'delete':
				if (fn) {
					let params: any = {
						path_id,
						exts,
						path,
					}
					return fn(params)
				}
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `批量${label}，是否继续操作？`,
		column: [{ label: `${tabActive.value === 'file' ? '文件类型' : '文件全路径 或 相对路径'}`, prop: 'exts' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getTamperList()
			return false
		},
	})
}

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '开启受保护文件类型',
			value: 'open',
			event: useBatchEventHandle,
		},
		{
			label: '关闭受保护文件类型',
			value: 'close',
			event: useBatchEventHandle,
		},
		{
			label: '同步到其他站点',
			value: 'sync',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				checkedList.value = selectedList.value
				applyForm.sites = []
				applyPopup.value = true
				getSiteList()
				watch(
					() => applyPopup.value,
					val => {
						if (!val) clearSelection()
					}
				)
			},
		},
		{
			label: '删除受保护文件类型',
			value: 'delete',
			event: useBatchEventHandle,
		},
	]
}

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		useCheckbox(),
		{
			prop: 'exts',
			label: '文件路径',
		},
		{
			prop: 'limit_status',
			label: '状态',
			render: (row: any, index: number) => {
				let status = row.limit_status === 1
				return <ElSwitch size="small" v-model={status} onChange={(val: boolean) => limitStatus(row, val)}></ElSwitch>
			},
		},
		useOperate([
			{
				title: '日志',
				onClick: logEvent,
			},
			{
				title: '删除',
				onClick: deleteEvent,
			},
		]),
	])
}

/**
 * @description: 获取防篡改列表
 */
const getTamperList = async (isLoad: boolean = false) => {
	try {
		isLoad && (loading.value = true)
		const { data } = await getTamperRuleByPath({ path: siteInfo.value.path })
		let data2: any = []
		if (data.hasOwnProperty('status')) {
			ruleData.value = data
			let blackExts = data.black_exts || [],
				whiteExts = data.white_exts || []
			blackExts?.forEach((item: any) => {
				data2.push({
					exts: item,
					limit_status: 1,
				})
			})
			whiteExts?.forEach((item: any) => {
				data2.push({
					exts: item,
					limit_status: 0,
				})
			})
		}
		tableData.value = data2.filter((item: any) => (tabActive.value === 'file' ? item.exts.indexOf('/') === -1 : item.exts.indexOf('/') !== -1))
	} catch (error) {
		useHandleError(error)
	} finally {
		isLoad && (loading.value = false)
	}
}

/**
 * @description: 添加文件类型
 */
const addFileType = async () => {
	if (fileType.value === '') return Message.error('文件类型不能为空')
	try {
		const res = await addBlackExts({
			path_id: ruleData.value.pid,
			path: ruleData.value.path,
			exts: fileType.value,
		})
		Message.request(res)
		if (res.status) {
			fileType.value = ''
			getTamperList()
		}
	} catch (error) {}
}

/**
 * @description: 修改限制状态
 * @param {any} row 当前行数据
 * @param {boolean} val 当前状态
 */
const limitStatus = async (row: any, val: boolean) => {
	try {
		row.limit_status = val ? 1 : 0
		await useConfirm({
			title: `${val ? '开启' : '关闭'}【${row.exts}】`,
			content: `${val ? '开启该受保护文件类型后，该类型后缀文件将被保护，是否继续？' : '关闭该受保护文件类型后，该类型后缀文件将不被保护，是否继续？'}`,
			icon: 'warning',
		})
		const res: AnyObject = await useDataHandle({
			loading: '正在设置保护文件状态，请稍后...',
			request: releaseFileExt({
				path_id: ruleData.value.pid,
				exts: row.exts,
				release: val ? 0 : 1,
			}),
			message: true,
		})
		if (res.status) getTamperList()
	} catch (error) {
		if (error === 'cancel') {
			row.limit_status = !val ? 1 : 0
		}
	}
}

/**
 * @description: 获取站点列表
 */
const getSiteList = async () => {
	const res = await useDataHandle({
		loading: applyFormLoading,
		request: getSiteInfo(),
		data: Array,
	})
	applyForm.list = res
}

/**
 * @description 批量同步到其他站点
 */
const applyConfirm = async () => {
	await applyFormRef.value.validate()
	try {
		let exts: any = {}
		checkedList.value.forEach((item: any) => {
			exts[item.exts] = item.limit_status
		})
		let params: any = {
			site_ids: JSON.stringify(applyForm.sites),
			exts: JSON.stringify(exts),
		}
		const res = await syncBlackExts(params)
		applyPopup.value = false
		openResultDialog({
			title: '批量同步到其他站点',
			resultData: res.data?.map((item: any) => ({
				name: item.name,
				status: item.msg === '同步成功' ? true : false,
				msg: item.msg,
			})),
			resultTitle: '批量同步到其他站点操作',
			showMult: false,
		})
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description: 删除事件
 * @param {any} row 当前行数据
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		title: '删除受保护的文件类型【' + row.exts + '】',
		content: '删除受保护的文件类型后，文件名以该后缀结尾的文件将失去保护，是否继续操作？',
		icon: 'warning',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除受保护的文件类型，请稍后...',
		request: removeBlackExts({
			path_id: ruleData.value.pid,
			path: ruleData.value.path,
			exts: row.exts,
		}),
		message: true,
	})
	if (res.status) getTamperList()
}

/**
 * @description: 日志事件
 * @param {any} row 当前行数据
 */
const logEvent = async (row: any) => {
	try {
		let params = {
			path_id: ruleData.value.pid,
			exts: row.exts,
			row: 10,
			p: 1,
			pid: ruleData.value.pid,
		}
		const { data: res } = await getActionLogsForExts(params)
		if (res.data?.length) {
			tamperCoreLogDialog({
				title: `受保护的文件类型【${row.exts}】日志`,
				row: row,
				data: res,
				params: {
					...params,
					total: getPageTotal(res.page),
				},
			})
		} else {
			Message.error('暂无日志')
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description: tab切换事件
 * @param {string} val 当前tab的type
 */
const handleTabClick = (val: string) => {
	fileType.value = ''
	tabActive.value = val
	tableColumns.value[1].label = val === 'file' ? '文件类型' : '文件全路径 或 相对路径'
	getTamperList()
}

const tableColumns = useTableColumn()
const TableBatchOptions = batchOptions()

onMounted(() => {
	getTamperList(true)
})

defineExpose({
	init: () => {
		getTamperList(true)
	},
})
</script>

<style lang="css" scoped>
.tamper-help-info code {
	@apply text-supplement py-2px px-4px bg-darker rounded-base mx-[2px];
}
</style>
