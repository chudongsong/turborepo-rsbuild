<template>
	<div>
		<div class="flex items-center">
			<div class="flex items-center mr-[16px]">
				<span class="mr-[16px] w-[4rem]">域名</span>
				<bt-input v-model="domainValue" placeholder="请输入域名"></bt-input>
			</div>
			<div class="flex items-center mr-[16px]">
				<span class="mr-[16px]">子目录</span>
				<el-select class="!w-[15rem]" filterable v-model="pathValue">
					<el-option v-for="(item, index) in pathData" :key="index" :value="item" :label="item"></el-option>
				</el-select>
			</div>
			<el-button type="primary" @click="addPath">添加</el-button>
		</div>
		<bt-table-group>
			<template #header-left></template>
			<template #header-right></template>
			<template #content>
				<!-- @selection-change="handleSelect" -->
				<bt-table ref="subTableRef" max-height="500" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="subTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right></template>
			<template #popup>
				<bt-dialog title="伪静态规则" v-model="staticPopup" :area="50">
					<div class="p-[20px]">
						<div class="flex items-center justify-between">
							<el-select class="!w-[15rem]" v-model="textValue" @change="handleChange">
								<el-option v-for="(item, index) in optionData" :key="index" :value="item" :label="item"></el-option>
							</el-select>
							<span class="flex items-center">
								规则转换工具：
								<bt-link class="flex items-center" href="https://www.bt.cn/Tools" target="_blank">Apache转Nginx <i class="svgtofont-el-link"></i></bt-link>
							</span>
						</div>
						<bt-editor v-bt-loading="textLoading" id="statictRef" class="!h-[40rem] !w-full my-[12px]" v-model="staticContent" @save="saveData" />
						<div>
							<el-button type="primary" @click="saveData">保存</el-button>
						</div>
						<bt-help :options="helpList" class="ml-[20px] mt-[20px]"></bt-help>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { openResultDialog } from '@/views/site/useController'
import { SITE_STORE, useSiteStore } from '@/views/site/useStore'
import { addDirBinding, delDirBinding, deleteDirBindMultiple, getDirBinding, getDirRewrite, getFileBody } from '@api/site'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const { saveFileEvent } = SITE_STORE()
const { plugin } = useGlobalStore()

const { siteInfo } = useSiteStore()

const subTableRef = ref<any>() // 获取表格实例
const domainValue = ref('') // 域名值
const pathData = ref<any[]>([]) // 子目录列表
const pathValue = ref('') // 子目录值
const checkedList = ref<any[]>([]) // 选中列表s

const staticPopup = ref(false) // 伪静态弹窗
const staticContent = ref('') // 静态内容\
const textValue = ref('') // 文本值
const optionData = ref<any[]>([]) // 下拉列表
const staticPath = ref('') // 静态路径
const textLoading = ref(false) // 文本加载

const helpList = [
	{
		content: '请选择您的应用，若设置伪静态后，网站无法正常访问，请尝试设置回default',
	},
	{
		content: '您可以对伪静态规则进行修改，修改完后保存即可。',
	},
] // 帮助列表

const tableData = ref([]) //  表格数据
const tableLoading = ref(false) // 表格loading

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除',
			value: 'delete',
			event: async (batchCofirm, nextAll, selectedList, options, clearSelection) => {
				await useConfirm({
					title: `批量删除`,
					width: '35rem',
					icon: 'warning-filled',
					content: `批量删除，该操作可能会存在风险，是否继续？`,
				})
				let data_id = [selectedList.value.map((item: any) => item.id)]
				const { data: res } = await deleteDirBindMultiple({
					bind_ids: data_id,
					id: siteInfo.value.id,
				})
				let result: any = []
				await res.success.forEach((item: any) => {
					result.push({
						name: item,
						msg: '删除成功',
						status: true,
					})
				})
				await Object.keys(res.error).forEach((item: any) => {
					result.push({
						name: item,
						msg: res.data.error[item],
						status: false,
					})
				})
				await openResultDialog({
					resultData: result,
					resultTitle: '删除',
					resultColumn: [
						{
							label: '域名',
							prop: 'name',
						},
						{
							label: '结果',
							render: (row: any) => {
								return h('span', { class: row.status ? 'text-primary' : 'text-danger' }, row.status ? row.msg || '操作成功' : row.msg || '操作失败')
							},
						},
					],
				})
				getSubdirectiry()
				clearSelection()
			},
		},
	]
}

/**
 * @description 获取子目录
 */
const getSubdirectiry = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getDirBinding({
			id: siteInfo.value.id,
		}),
		data: {
			dirs: [Array, pathData],
			binding: [Array, tableData],
		},
	})
	pathValue.value = pathData.value[0] || ''
}

/**
 * 添加子目录
 */
const addPath = async () => {
	if (!pathValue.value || !domainValue.value) {
		Message.error('域名和子目录都不可为空！')
		return
	}
	const res: AnyObject = await useDataHandle({
		loading: '正在添加子目录中,清稍后...',
		request: addDirBinding({
			id: siteInfo.value.id,
			domain: domainValue.value,
			dirName: pathValue.value,
		}),
		message: true,
	})
	if (res.status) {
		domainValue.value = '' // 清空域名
		getSubdirectiry()
	}
}

/**
 * 删除子目录
 */
const delEvent = async (row: any) => {
	await useConfirm({
		title: `删除【${row.domain}】`,
		content: `删除选中的子目录绑定后，将无法访问该子目录绑定的域名，是否继续操作？`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: delDirBinding({ id: row.id }),
		message: true,
	})
	if (res.status) getSubdirectiry()
}

/**
 * @description 保存伪静态内容
 */
const saveData = async () => {
	const res: any = await saveFileEvent({
		data: staticContent.value,
		encoding: 'utf-8',
		path: staticPath.value,
	})
	// Message.msg({
	// 	dangerouslyUseHTMLString: true,
	// 	message: res.msg,
	// 	type: res.status ? 'success' : 'error',
	// 	duration: res.status ? 2000 : 0,
	// 	showClose: !res.status,
	// }); // 提示错误信息
}

const getDirRewriteEvent = async (row: any) => {
	// 获取子目录伪静态
	let loading = Message.load('正在获取伪静态内容，请稍候...')
	let params: any = { id: row.id }
	if (row.add) params['add'] = 1
	try {
		const res: any = await getDirRewrite(params)
		loading.close()
		if (!res.data.status) {
			await useConfirm({
				title: '创建伪静态',
				icon: 'warning-filled',
				content: `你真的要为这个子目录创建独立的伪静态规则吗？`,
			})
			getDirRewriteEvent({ ...row, add: 1 })
		} else {
			staticContent.value = res.data.data
			optionData.value = res.data.rlist
			textValue.value = res.data.rlist[0]
			staticPath.value = res.data.filename
			staticPopup.value = true
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.close()
	}
}

/**
 * @description 获取伪静态内容
 */
const handleChange = async (val: any) => {
	useDataHandle({
		loading: textLoading,
		request: getFileBody({
			path: `/www/server/panel/rewrite/${plugin.value.webserver}/${val}.conf`,
		}),
		data: {
			data: [String, staticContent],
		},
	})
}

const tableColumns = ref([
	useCheckbox(),
	{
		prop: 'domain',
		label: '域名',
		render: (row: any) => {
			return (
				<span
					class="cursor-pointer bt-link"
					onClick={() => {
						window.open(`http://${row.domain}:${row.port}`, '_blank', 'noopener,noreferrer')
					}}>
					{row.domain}
				</span>
			)
		},
	},
	{
		prop: 'port',
		label: '端口',
	},
	{
		width: 220,
		label: '子目录',
		render: (row: any) => {
			return <span>{row.path}</span>
		},
	},
	useOperate([
		{ onClick: getDirRewriteEvent, title: '伪静态', width: 60 },
		{ onClick: delEvent, title: '删除' },
	]),
]) // 响应式数据
const TableBatchOptions = batchOptions() // 批量操作

onMounted(getSubdirectiry)

defineExpose({
	init: getSubdirectiry,
})
</script>
