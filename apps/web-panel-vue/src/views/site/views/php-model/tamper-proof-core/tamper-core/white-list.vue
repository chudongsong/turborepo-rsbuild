<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取站点防篡改信息，请稍侯'">
		<Masker v-if="!ruleData?.path" :compData="{ ...compData, init: getTamperList }"></Masker>

		<bt-tabs ref="tamperRef" type="" v-model="tabActive" :options="tabComponent" @change="handleTabClick"></bt-tabs>

		<bt-table-group>
			<template #header-left>
				<div class="flex gap-col-1rem">
					<bt-input v-model="fileType" width="30rem" :placeholder="`${tabActive === 'dir' ? '目录名' : '文件名'}`"></bt-input>
					<el-button type="primary" @click="addFileType">添加</el-button>
				</div>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getTamperList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="whiteTableRef" :column="tableColumns" :maxHeight="350" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="whiteTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right></template>
		</bt-table-group>

		<bt-help :options="helpList" class="ml-2rem mt-2rem tamper-help-info leading-2rem"> </bt-help>
	</div>
</template>

<script setup lang="tsx">
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useHandleError, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate, usePs } from '@/hooks/tools/table/column'
import { formatTime, getPageTotal } from '@/utils'
import { addWhiteDirs, addWhiteFiles, getActionLogsForDirname, getActionLogsForFilename, getTamperRuleByPath, releaseWhiteDirname, releaseWhiteFileExt, removeWhiteDirs, removeWhiteFiles, setWhiteDirWithPs } from '@api/site'
import { tamperCoreLogDialog } from '@site/useController'
import { useSiteStore } from '@site/useStore'
import Masker from '@site/views/php-model/tamper-proof-core/tamper-core/masker.vue'
import { ElSwitch } from 'element-plus'

interface TabProps {
	title: string
	type: string
	active?: true
	component: any
	compData?: any
}

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { siteInfo } = useSiteStore()

const Message = useMessage() // 消息提示

const tabActive = ref<string>('dir')
const whiteTableRef = ref<any>()
const loading = ref<boolean>(false)
const fileType = ref<string>('') // 文件类型
const tableLoading = ref<boolean>(false) // 表格loading
const ruleData = ref<any>({}) // 当前规则数据
const tableData = ref<any[]>([]) // 表格数据

const applyPopup = ref<boolean>(false) // 批量同步到其他站点弹窗
const applyFormLoading = ref<boolean>(false)
const applyFormRef = ref<any>()
const formDisabled = ref<boolean>(false)
const applyForm = reactive<any>({
	sites: [],
	list: [],
})

const batchConfig = reactive({
	isRecurrence: false,
	describe: {
		title: '',
		th: '',
		message: '',
		propsValue: '',
	},
})

const helpList = computed(() => {
	return tabActive.value === 'dir'
		? [
				{
					content: (
						<>
							此处允许使用全路径或目录名或路径的一部分如：
							<code>/www/abc/cache/test/,test,cache/test/</code>
						</>
					),
				},
				{
					content: (
						<>
							全路径首位必需为
							<code>/</code>
							，如：
							<code>/www/abc/cache/test/</code>
						</>
					),
				},
				{
					content: (
						<>
							录名或路径的一部分首位不能是
							<code>/</code>
							，如：
							<code>cache/test/</code>或<code>test</code>
						</>
					),
				},
				{
					content: (
						<>
							例1：
							<code>/www/abc/</code>
							匹配:
							<code>/www/abc/*</code>
							不匹配：
							<code>/www/abc</code>
							<code>/www/abc123</code>
						</>
					),
				},
				{
					content: (
						<>
							例2：
							<code>test</code>
							匹配：
							<code>/www/test/1.txt</code>
							<code>/www/test_abc</code>
							不匹配：
							<code>/www/1.php</code>
						</>
					),
				},
				{
					content: (
						<>
							例3：
							<code>cache/test/</code>
							匹配：
							<code>/www/cache/test/1.txt</code>
							<code>/cache/test/</code>
							不匹配：
							<code>/www/cache/test</code>
							<code>/cache/</code>
						</>
					),
				},
		  ]
		: [
				{
					content: '支持以下5种方式',
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

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options) => {
	const isDir = tabActive.value === 'dir'
	const title = isDir ? '目录' : '文件'
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['start', `批量开启选中的${title}白名单`],
		['stop', `批量关闭选中的${title}白名单`],
		['delete', `批量删除选中的${title}白名单`],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', isDir ? releaseWhiteDirname : releaseWhiteFileExt],
			['stop', isDir ? releaseWhiteDirname : releaseWhiteFileExt],
			['delete', isDir ? removeWhiteDirs : removeWhiteFiles],
		])
		const fn = requestList.get(value)
		let params: any = {
			path_id: ruleData.value.pid,
			[isDir ? 'dirname' : 'filename']: item[isDir ? 'dir' : 'filename'],
		}
		switch (value) {
			case 'start':
			case 'stop':
				params.release = value === 'start' ? 1 : 0
				return fn(params)
			case 'delete':
				params.path = ruleData.value.path
				return fn(params)
		}
	}
	await batchCofirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [
			{
				prop: `${isDir ? 'dir' : 'filename'}`,
				label: `${!isDir ? '文件类型' : '文件全路径 或 相对路径'}`,
			},
			useBatchStatus(),
		] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getTamperList()
			return false
		},
	})
}

const batchOptions = () => {
	return ref<TableBatchOptionsProps[]>([
		{
			label: `开启${tabActive.value == 'dir' ? '目录' : '文件'}白名单`,
			value: 'start',
			event: useBatchEventHandle,
		},
		{
			label: `关闭${tabActive.value == 'dir' ? '目录' : '文件'}白名单`,
			value: 'stop',
			event: useBatchEventHandle,
		},
		{
			label: `删除${tabActive.value == 'dir' ? '目录' : '文件'}白名单`,
			value: 'delete',
			event: useBatchEventHandle,
		},
	])
}

const useTableColumn = () => {
	return ref<TableColumnProps[]>([
		useCheckbox({ key: 'dir' }),
		{
			label: tabActive.value == 'dir' ? '目录' : '文件名',
			prop: tabActive.value == 'dir' ? 'dir' : 'filename',
		},
		tabActive.value == 'dir'
			? usePs({
					minWidth: 150,
					width: 300,
					request: editEvent,
			  })
			: {
					label: '备注',
					prop: 'ps',
			  },
		{
			label: '状态',
			prop: 'limit_status',
			width: 50,
			render: (row: any) => {
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

const tabComponent = ref<any[]>([
	{
		label: '目录白名单',
		name: 'dir',
		lazy: true,
		render: () => <span></span>,
	},
	{
		label: '文件白名单',
		name: 'file',
		lazy: true,
		render: () => <span></span>,
	},
])

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
			if (tabActive.value == 'dir') {
				//目录白名单
				data?.unused_white_dirs?.forEach((item: any) => {
					data2.push({
						...item,
						ps: item.ps || '',
						limit_status: 0,
					})
				})
				data?.white_dirs?.forEach((item: any) => {
					let obj: any = {
						...item,
						ps: item.ps || '',
						limit_status: 1,
					}
					let temps = data?.temporarily_dirs?.find((temp: any) => temp.value === item.dir)
					if (temps) {
						obj.time = temps.time
						obj.ps = '临时放行截止至' + formatTime(temps.time, 'yyyy-MM-dd HH:mm:ss')
					}
					data2.push(obj)
				})
			} else {
				// 文件白名单
				let whiteFiles = data.white_files,
					unusedWhiteFiles = data.unused_white_files
				unusedWhiteFiles.forEach((item: any) => {
					data2.push({ filename: item, limit_status: 0, ps: '-' })
				})
				whiteFiles.forEach((item: any) => {
					let obj: any = {
						filename: item,
						limit_status: 1,
						ps: '-',
					}
					let temps = data?.temporarily_files?.find((temp: any) => temp.value === item)
					if (temps) {
						obj.time = temps.time
						obj.ps = '临时放行截止至' + formatTime(temps.time, 'yyyy-MM-dd HH:mm:ss')
					}
					data2.push(obj)
				})
			}
		}
		tableData.value = data2
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
		const res =
			tabActive.value == 'dir'
				? await addWhiteDirs({
						path_id: ruleData.value.pid,
						path: ruleData.value.path,
						dirnames: fileType.value,
				  })
				: await addWhiteFiles({
						path_id: ruleData.value.pid,
						path: ruleData.value.path,
						filename: fileType.value,
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
	const isDir = tabActive.value == 'dir'
	try {
		if (row.hasOwnProperty('time')) {
			nextTick(() => {
				row.limit_status = !val
				Message.error('临时放行文件无法修改状态')
			})
			return
		}
		row.limit_status = val ? 1 : 0
		await useConfirm({
			title: `${val ? '开启' : '关闭'}【${isDir ? row.dir : row.filename}】`,
			content: `${val ? '开启该文件白名单后，该文件将不被保护，是否继续？' : '关闭该文件白名单后，该文件将被保护，是否继续？'}`,
		})

		const params = {
			path_id: ruleData.value.pid,
			[isDir ? 'dirname' : 'filename']: row[isDir ? 'dir' : 'filename'],
			release: val ? 1 : 0,
		}

		const requestFun = isDir ? releaseWhiteDirname : releaseWhiteFileExt

		const res: AnyObject = await useDataHandle({
			loading: '正在设置白名单状态，请稍后...',
			request: requestFun(params),
			message: true,
		})
		if (res.status) getTamperList()
	} catch (error) {
		if (error === 'cancel') row.limit_status = !val ? 1 : 0
	}
}

/**
 * @description: 删除事件
 * @param {any} row 当前行数据
 */
const deleteEvent = async (row: any) => {
	let isDir = tabActive.value === 'dir'
	let title = isDir ? `目录` : `文件`
	await useConfirm({
		title: `删除【${isDir ? row.dir : row.filename}】`,
		content: `删除该${title}白名单后，该${title}将受到保护，是否继续操作？`,
	})

	const params = {
		path_id: ruleData.value.pid,
		path: ruleData.value.path,
		[isDir ? 'dirname' : 'filename']: row[isDir ? 'dir' : 'filename'],
	}

	const requestFun = isDir ? removeWhiteDirs : removeWhiteFiles

	const res: AnyObject = await useDataHandle({
		loading: `正在删除${title}白名单，请稍后...`,
		request: requestFun(params),
		message: true,
	})

	if (res.status) getTamperList()
}

/**
 * @description: 日志事件
 * @param {any} row 当前行数据
 */
const logEvent = async (row: any) => {
	const isDir = tabActive.value === 'dir'
	try {
		const params: any = {
			path_id: ruleData.value.pid,
			[isDir ? 'dirname' : 'filename']: row[isDir ? 'dir' : 'filename'],
			row: 10,
			pid: ruleData.value.pid,
			p: 1,
		}
		const requestFun = isDir ? getActionLogsForDirname : getActionLogsForFilename

		const { data: res } = await requestFun(params)

		if (res.data?.length) {
			tamperCoreLogDialog({
				title: `${tabActive.value === 'dir' ? `目录【${row.dir}】` : `文件【${row.filename}】`}白名单日志`,
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
 * @description: 编辑备注事件
 * @param {any} row 当前行数据
 */
const editEvent = async (row: any, value: string): Promise<void> => {
	useDataHandle({
		loading: '正在修改备注信息，请稍后...',
		request: setWhiteDirWithPs({
			path_id: ruleData.value.pid,
			dir_name: row.dir,
			ps: value,
		}),
		message: true,
	})
}

const tableColumns = useTableColumn()
const TableBatchOptions = batchOptions()

/**
 * @description: tab切换事件
 * @param {string} val 当前tab的type
 */
const handleTabClick = (val: string) => {
	fileType.value = ''
	tabActive.value = val
	tableColumns.value = useTableColumn().value
	TableBatchOptions.value = batchOptions().value
	tableData.value = []
	getTamperList()
}

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
