<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addProxy">添加反向代理</el-button>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getReverseProxy"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="reverseTableRef" :column="tableColumns" :max-height="520" :data="tableData" v-bt-loading="tableLoading" v-bt-loading:title="'正在获取列表，请稍候...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="reverseTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right></template>
			<template #popup>
				<bt-dialog :title="rowData.isEdit ? `修改反向代理【${rowData.proxyname}】` : '添加反向代理'" v-model="proxyPopup" :show-footer="true" :area="68" @confirm="editProxyConfirm">
					<div class="p-[20px]">
						<el-form ref="proxyForm" :model="rowData" :rules="proxyFormRules" :disabled="formDisabled" label-width="80px">
							<el-form-item label="开启代理">
								<div class="flex items-center">
									<el-switch v-model="rowData.type" />
									<el-form-item label="开启缓存" class="!mt-0">
										<el-switch v-model="rowData.cache" />
									</el-form-item>
									<el-form-item label="高级功能" class="!mt-0">
										<el-switch v-model="rowData.advanced" />
									</el-form-item>
								</div>
							</el-form-item>
							<el-form-item label="代理名称" prop="proxyname">
								<bt-input v-model="rowData.proxyname" :disabled="rowData.isEdit" placeholder="请输入代理名称" width="20rem" />
							</el-form-item>
							<el-form-item label="缓存时间" prop="cachetime" v-if="rowData.cache">
								<bt-input v-model="rowData.cachetime" placeholder="请输入缓存时间" width="20rem" textType="分钟">
									<template #append> 分钟 </template>
								</bt-input>
							</el-form-item>
							<el-form-item label="代理目录" prop="proxydir" v-if="rowData.advanced">
								<bt-input v-model="rowData.proxydir" placeholder="请输入代理目录" width="20rem" />
							</el-form-item>
							<el-form-item label="目标URL" prop="proxysite" label-width="80px">
								<div class="flex items-center">
									<bt-input v-model="rowData.proxysite" placeholder="请输入目标URL" width="20rem" @input="handelInputTodo" />
									<el-form-item label="发送域名" prop="todomain" label-width="50px">
										<bt-input v-model="rowData.todomain" placeholder="请输入发送域名" width="20rem" />
									</el-form-item>
								</div>
							</el-form-item>
							<el-form-item label="内容替换">
								<template v-for="(item, index) in rowData.subfilter" :key="item.id">
									<div class="flex items-center mb-1rem">
										<bt-input v-model="item.sub1" placeholder="被替换的文本，可留空" width="20rem" class="mr-2rem !w-20rem" />
										<bt-input v-model="item.sub2" placeholder="替换为，可留空" width="20rem" class="mr-1rem !w-20rem" />
										<span class="text-danger cursor-pointer" @click="delSub(item)">删除</span>
									</div>
								</template>
								<el-button :disabled="rowData.subfilter.length === 3" type="primary" class="!mt-1rem" @click="addSub">
									<span class="svgtofont-el-plus"></span>
									添加内容替换
								</el-button>
							</el-form-item>
						</el-form>
						<bt-help :options="helpList" class="mt-2rem pl-2rem"></bt-help>
					</div>
				</bt-dialog>
				<bt-dialog :title="`编辑配置文件【${rowData.proxyname}】`" v-model="configFilePopup" :area="55">
					<div class="p-2rem">
						<div class="text-secondary h-[2rem] leading-[2rem] mb-[1rem]">提示：Ctrl+S 保存</div>
						<bt-editor v-model="rowData.content" :filePath="rowData.path" :config="getAceConfig()" :request="false" class="!h-38rem" @save="saveFileEvent"></bt-editor>
						<el-button type="primary" class="!mt-2rem" @click="saveFileEvent">保存</el-button>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<ul class="mt-[20px] leading-8 text-small list-disc ml-[20px]">
			<li>设置了反向代理后，【访问限制】中的相应路径的规则将会失效</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@store/global'

import { asyncSaveProxyFile, createAsyncProxy, createProxy, createProxySite, getModulesProxyList, getProxyFile, getProxyList, modifyModulesProxy, modifyProxy, removeModulesProxy, removeProxy, saveRedirectFile } from '@api/site'

import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { useBatchStatus, useOperate, useStatus, useCheckbox } from '@/hooks/tools/table/column'
import { getAceConfig } from '@site/useController'
import { useSiteStore } from '@site/useStore'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { plugin } = useGlobalStore()

const { siteInfo } = useSiteStore()

const { webserver: webServerType } = plugin.value

const siteType = ref<string>(siteInfo.value?.project_type?.toLowerCase()) // 项目类型

const reverseTableRef = ref<any>() // 表格ref
const domainValue = ref('') // 域名值
const pathData = ref<any[]>([]) // 子目录列表
const pathValue = ref('') // 子目录值

const tableData = ref<any>([]) // 响应式数据
const tableLoading = ref(false) // 表格loading
const formDisabled = ref(false) // 表单禁用
const proxyForm = ref<any>({}) // 表单数据
const proxyFormRules = reactive({
	proxyname: [
		{ required: true, message: '请输入代理名称', trigger: ['blur', 'change'] },
		{
			trigger: ['blur', 'input', 'change'],
			validator: (rule: unknown, value: string, callback: any) => {
				// 代理名称必须大于3个字符串
				if (value.length < 3) {
					callback(new Error('代理名称必须大于3个字符串'))
				} else {
					callback()
				}
			},
		},
	],
	proxysite: [
		{
			required: true,
			message: '请输入目标url',
			trigger: 'blur',
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('目标URL不能为空'))
				} else {
					callback()
				}
			},
		},
	],
	todomain: [{ required: true, message: '请输入发送域名', trigger: ['blur', 'change'] }],
}) // 表单验证规则
const rowData = ref<any>({
	isEdit: false,
	type: true,
	cache: false,
	advanced: false,
	proxyname: '',
	cachetime: 1,
	proxydir: '/',
	proxysite: 'http://',
	todomain: '',
	subfilter: [
		{
			sub1: '',
			sub2: '',
			id: 1,
		},
	],
	subNum: 1,
	path: '',
	content: '',
}) // 行数据

const proxyPopup = ref(false) // 添加修改反向代理弹窗
const configFilePopup = ref(false) // 配置文件弹窗
const helpList = [
	{ content: '代理目录：访问这个目录时将会把目标URL的内容返回并显示(需要开启高级功能)' },
	{ content: '目标URL：可以填写你需要代理的站点，目标URL必须为可正常访问的URL，否则将返回错误' },
	{
		content: '发送域名：将域名添加到请求头传递到代理服务器，默认为目标URL域名，若设置不当可能导致代理无法正常运行',
	},
	{ content: '内容替换：只能在使用nginx时提供，最多可以添加3条替换内容,如果不需要替换请留空' },
]

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['start', '批量启动选中的规则后，配置的反向代理规则将继续生效'],
		['stop', '批量停用选中的规则后，配置的反向代理规则将会失效'],
		['delete', '批量删除选中的规则后，配置的反向代理规则将会彻底失效'],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const { proxyname, subfilter } = item
		const isSpecial = ['proxy', 'phpasync'].includes(siteType.value)
		switch (value) {
			case 'start':
			case 'stop':
				let params: any = {
					...item,
					subfilter: JSON.stringify(subfilter),
					type: value === 'start' ? 1 : 0,
				}
				const res1 = isSpecial ? await modifyModulesProxy(params, siteType.value) : await modifyProxy(params)
				return {
					...item,
					batchStatus: res1.status ? 1 : 2,
					message: res1.msg,
				}
			case 'delete':
				const params1 = {
					sitename: siteInfo.value.name,
					proxyname: siteType.value === 'phpasync' ? [proxyname] : proxyname,
				}
				const res = isSpecial ? await removeModulesProxy(params1, siteType.value) : await removeProxy(params1)
				return {
					...item,
					batchStatus: res.status ? 1 : 2,
					message: res.msg,
				}
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [
			{
				label: '名称',
				prop: 'proxyname',
			},
			useBatchStatus(),
		] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getReverseProxy()
			return false
		},
	})
}

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '启用反向代理规则',
			value: 'start',
			event: useBatchEventHandle,
		},
		{
			label: '停用反向代理规则',
			value: 'stop',
			event: useBatchEventHandle,
		},
		{
			label: '删除反向代理规则',
			value: 'delete',
			event: useBatchEventHandle,
		},
	]
}

const useTableColumn = () => {
	return shallowRef([
		useCheckbox({ key: 'proxydir' }),
		{ label: '名称', prop: 'proxyname' },
		{ label: '代理目录', prop: 'proxydir' },
		{
			label: '目标URL',
			width: 140,
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							window.open(row.proxysite)
						}}>
						{row.proxysite}
					</span>
				)
			},
		},
		{
			prop: 'cache',
			label: '缓存',
			width: 60,
			render: (row: any) => {
				const { cache } = row
				return (
					<span
						class={`${cache ? 'bt-link' : 'bt-danger'}`}
						onClick={() => {
							changeEvent(row, 'cache')
						}}>
						{cache ? '已开启' : '已关闭'}
					</span>
				)
			},
		},
		useStatus({ prop: 'type', event: changeEvent, data: ['已暂停', '运行中'] }),
		useOperate([
			{ onClick: configFileEvent, title: '配置文件', width: 56 },
			{ onClick: editDataEvent, title: '编辑' },
			{ onClick: deleteDataEvent, title: '删除' },
		]),
	]) // 响应式数据
}

const handelInputTodo = (val: string) => {
	let value = val.replace(/^http[s]?:\/\//, '')
	value = value.replace(/(:|\?|\/|\\)(.*)$/, '')
	rowData.value.todomain = value
}

/**
 * @description 修改缓存状态
 * @param row
 */
const changeEvent = async (row: any, type: string) => {
	let params: any = {
		...row,
		subfilter: JSON.stringify(row.subfilter),
	}
	if (type === 'cache') {
		params.cache = row.cache ? 0 : 1
	} else {
		params.type = row.type ? 0 : 1
	}
	const isSpecial = ['proxy', 'phpasync'].includes(siteType.value)
	const res: AnyObject = await useDataHandle({
		loading: '正在修改状态中，请稍后...',
		request: isSpecial ? modifyModulesProxy(params, siteType.value) : modifyProxy(params),
		message: true,
	})
	if (res.status) getReverseProxy()
}

/**
 * @description 配置文件
 * @param row
 */
const configFileEvent = async (row: any) => {
	try {
		if (row.type === 0) return Message.error('该规则已暂停，无法查看配置文件')
		const { data } = await getProxyFile({
			sitename: siteInfo.value.name,
			proxyname: row.proxyname,
			webserver: webServerType,
		})
		if (data.status === false) {
			Message.request(data)
		} else {
			rowData.value.content = data[0].data
			rowData.value.path = data[1]
			rowData.value.proxyname = row.proxyname
			configFilePopup.value = true
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 保存文件
 */
const saveFileEvent = async () => {
	const isAsync = siteType.value === 'phpasync'
	const requestFun = isAsync ? asyncSaveProxyFile : saveRedirectFile
	const params = {
		path: rowData.value.path,
		[isAsync ? 'config' : 'data']: rowData.value.content,
		encoding: 'utf-8',
	}
	const res: AnyObject = await useDataHandle({
		loading: '正在保存配置文件，请稍后...',
		request: requestFun(params),
		message: true,
	})
	if (res.status) {
		configFilePopup.value = false
		resetProxy()
		getReverseProxy()
	}
}

/**
 * @description 编辑
 * @param row
 */
const editDataEvent = async (row: any) => {
	rowData.value.isEdit = true
	rowData.value.proxyname = row.proxyname
	rowData.value.proxydir = row.proxydir
	rowData.value.proxysite = row.proxysite
	rowData.value.todomain = row.todomain
	rowData.value.type = row.type ? true : false
	rowData.value.cache = row.cache ? true : false
	rowData.value.advanced = row.advanced ? true : false
	rowData.value.cachetime = row.cachetime
	rowData.value.subfilter = row.subfilter
		.map((item: any, index: number) => {
			return {
				sub1: item.sub1,
				sub2: item.sub2,
				id: index, // 用于删除
			}
		})
		.filter((item: any) => item.sub1 !== '')
	proxyPopup.value = true
}

/**
 * @description 添加反向代理
 */
const addProxy = async () => {
	resetProxy()
	proxyPopup.value = true
}

/**
 * @description 重置反向代理表单数据
 */
const resetProxy = async () => {
	rowData.value.isEdit = false
	rowData.value.proxyname = ''
	rowData.value.proxydir = '/'
	rowData.value.proxysite = 'http://'
	rowData.value.todomain = ''
	rowData.value.type = true
	rowData.value.cache = false
	rowData.value.advanced = false
	rowData.value.cachetime = 1
	rowData.value.subfilter = [
		{
			sub1: '',
			sub2: '',
			id: 1,
		},
	]
	rowData.value.subNum = 1
}
/**
 * @description 添加内容替换
 */
const addSub = async () => {
	if (rowData.value.subfilter.length === 3) {
		Message.error('最多添加三条内容替换')
		return
	}
	rowData.value.subfilter.push({
		sub1: '',
		sub2: '',
		id: Math.random() * 100,
	})
}
/**
 * @description 删除内容替换
 */
const delSub = async (item: any) => {
	if (rowData.value.subfilter.length === 1) {
		Message.error('至少保留一条内容替换')
		return
	}
	// 过滤要删除的数据
	rowData.value.subfilter = rowData.value.subfilter.filter((i: any) => i.id !== item.id)
}
/**
 * @description 内容替换数组处理
 */
const subfilterHandle = (arr: { sub1: string; sub2: string; id?: number | string }[]) => {
	const newArr = [...arr]
	// 不足3个补足
	while (newArr.length < 3) {
		newArr.push({
			sub1: '',
			sub2: '',
		})
	}
	// 加上id用于删除
	return newArr.map((item, index) => {
		return {
			sub1: item.sub1,
			sub2: item.sub2,
			id: Math.random() * 100,
		}
	})
}

/**
 * @description 添加修改反向代理
 */
const editProxyConfirm = async () => {
	// 检测是否通过校验
	await proxyForm.value.validate()
	const { isEdit, type, subfilter, cache, advanced, proxyname, proxydir, proxysite, todomain, cachetime } = rowData.value
	// 不足3个补足
	let data = {
		subfilter: JSON.stringify(
			subfilterHandle(subfilter).map(item => {
				return {
					sub1: item.sub1,
					sub2: item.sub2,
				}
			})
		),
		type: type ? 1 : 0,
		cache: cache ? 1 : 0,
		advanced: advanced ? 1 : 0,
		sitename: siteInfo.value.name,
		proxyname,
		proxydir,
		proxysite,
		todomain,
		cachetime,
	}
	const isSpecial = ['proxy', 'phpasync'].includes(siteType.value)

	// 反代和异步项目
	const requestFun = isEdit ? modifyModulesProxy : createProxySite
	// 默认项目
	const requestDefFun = isEdit ? modifyProxy : createProxy

	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: isSpecial ? requestFun(data, siteType.value) : requestDefFun(data),
		message: true,
	})
	if (res.status) {
		getReverseProxy()
		proxyPopup.value = false
	}
}

/**
 * @description 删除
 * @param row
 */
const deleteDataEvent = async (row: any) => {
	await useConfirm({
		title: `删除反向代理规则【${row.proxyname}】`,
		content: `删除选中的规则后，配置的反向代理规则将会彻底失效，是否继续操作？`,
		icon: 'warning-filled',
	})
	const isSpecial = ['proxy', 'phpasync'].includes(siteType.value)

	const paramsType: AnyObject = {
		phpasync: {
			sitename: siteInfo.value.name,
			proxyname: row.proxyname,
		},
		default: {
			sitename: siteInfo.value.name,
			proxyname: [row.proxyname],
		},
	}
	const params = paramsType[siteType.value] || paramsType.default

	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: isSpecial ? removeModulesProxy(params, siteType.value) : removeProxy(paramsType.default),
		message: true,
	})
	if (res.status) getReverseProxy()
}

/**
 * @description 获取反向代理
 */
const getReverseProxy = async () => {
	const params = {
		sitename: siteInfo.value.name,
	}
	const isSpecial = ['proxy', 'phpasync'].includes(siteType.value)
	await useDataHandle({
		loading: tableLoading,
		request: isSpecial ? getModulesProxyList(params, siteType.value) : getProxyList(params),
		data: [Array, tableData],
	})
}

const TableBatchOptions = batchOptions()
const tableColumns = useTableColumn()

onMounted(getReverseProxy)

defineExpose({
	init: getReverseProxy,
})
</script>
