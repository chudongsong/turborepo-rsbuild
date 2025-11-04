<template>
	<div class="pb-2rem" v-bt-loading="loading" v-bt-loading:title="'正在获取防篡改配置信息，请稍侯'">
		<bt-table-group>
			<template #header-left>
				<div class="flex gap-col-1rem">
					<bt-input v-model="excludePath" type="textarea" :rows="4" resize="none" width="38rem" :placeholder="`${childType ? '受保护的文件或扩展名' : '排除文件或目录'}，每行一条`"></bt-input>
					<div class="flex flex-col justify-between">
						<span>
							<el-button type="default" @click="onPathChange">
								<i class="svgtofont-el-folder"></i>
							</el-button>
						</span>
						<el-button type="default" @click="addExclude"> 添加{{ childType ? '保护' : '排除' }} </el-button>
					</div>
				</div>
			</template>
			<template #header-right></template>
			<template #content>
				<bt-table ref="excludeTableRef" :column="tableColumns" :maxHeight="childType ? 380 : 420" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="excludeTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right></template>
		</bt-table-group>

		<ul class="mt-8px leading-8 text-small list-disc ml-20px tamper-help-info">
			<li v-if="!childType" class="text-danger">排除规则具备最高优先级，在此列表中的目录或文件名将不受保护</li>
			<template v-else>
				<li class="leading-2rem">
					<div>支持以下4种方式</div>
					<div>
						<span>
							1. 文件扩展名，如：
							<code>php jsp</code>
						</span>
						<span>
							2. 文件名，如：
							<code>bt.php、 index.php</code>
						</span>
					</div>
					<div>
						<span>
							3. 文件全路径，如：
							<code>/bt.cn/1.txt</code>
						</span>
						<span>
							4. 文件相对路径，如：
							<code>app/test.php</code>
						</span>
					</div>
				</li>
				<li>一般添加常见容易被篡改的扩展名即可，如html,php,js等</li>
			</template>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useHandleError } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import { useSiteStore } from '@/views/site/useStore'
import { addExcloud, addProtectExt, getProofFind, removeExcloud, removeProtectExt } from '@api/site'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()

const excludeTableRef = ref<any>() // 获取表格实例
const loading = ref<boolean>(false)
const tableLoading = ref<boolean>(false)
const tableData = ref<any>([])
const excludePath = ref<any>('')
const checkedList = ref<any>([])

const childType = ref<number>(0)

const useTableColumn = () => {
	return ref<TableColumnProps[]>([
		useCheckbox(),
		{
			label: `${childType.value ? '扩展名/文件名' : '名称或路径'}`,
			prop: 'path',
		},
		useOperate([{ title: '删除', onClick: deleteData }]),
	])
}

/**
 * @description: 删除排除/保护
 * @param {any} row 删除的数据
 * @param {boolean} isMult 是否是批量删除
 */
const deleteData = async (row: any) => {
	const params = {
		siteName: siteInfo.value.name,
		[childType.value ? 'protectExt' : 'excludePath']: row.path,
	}

	const requestFun = childType.value ? removeProtectExt : removeExcloud

	const res = await useDataHandle({
		loading: `正在删除${childType.value ? '保护文件名' : '排除路径'}，请稍后...`,
		request: requestFun(params),
		message: true,
	})
	if (res.status) getExcludeData()
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'all',
		path: siteInfo.value.path,
		change: (path: string) => {
			let arr: any = excludePath.value ? excludePath.value.split('\n') : []
			if (!arr.includes(path)) arr.push(path)
			excludePath.value = arr.join('\n')
		},
	})
}

/**
 * @description: 获取排除/保护数据
 */
const getExcludeData = async () => {
	loading.value = true
	try {
		const { data } = await getProofFind({ siteName: siteInfo.value.name })
		if (data) {
			tableData.value = (childType.value ? data.protectExt : data.excludePath).map((item: any) => ({ path: item }))
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.value = false
	}
}

const addExclude = async () => {
	if (excludePath.value === '') return Message.error(`${childType.value ? '保护文件' : '排除路径'}不能为空`)
	let params: any = {
		siteName: siteInfo.value.name,
	}
	if (childType.value) {
		params.protectExt = excludePath.value
	} else {
		params.excludePath = excludePath.value
	}
	const res: AnyObject = await useDataHandle({
		loading: `正在添加${childType.value ? '保护' : '排除'}，请稍后...`,
		request: childType.value ? addProtectExt(params) : addExcloud(params),
		message: true,
	})
	if (res.status) {
		excludePath.value = ''
		getExcludeData()
	}
}

const init = () => {
	childType.value = props.compData.childType === 'protect' ? 1 : 0
	getExcludeData()
}

const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			const requestHandle = async (item: any) => {
				let params: any = {
					siteName: siteInfo.value.name,
					[childType.value ? 'protectExt' : 'excludePath']: item.path,
				}
				console.log(params)
				const res = childType.value ? await removeProtectExt(params) : await removeExcloud(params)
				return res
			}
			await batchConfirm({
				title: `批量删除`,
				content: `批量删除选中的名称或路径，防篡改开启时该路径将受保护，是否继续操作？`,
				column: [
					{
						label: `${childType.value ? '扩展名/文件名' : '名称或路径'}`,
						prop: 'path',
					},
					useBatchStatus(),
				] as TableColumnProps[], // 弹窗配置
				onConfirm: async () => {
					// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
					await nextAll(requestHandle)
					// 执行完毕的代码，刷新列表
					getExcludeData()
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
] as TableBatchOptionsProps[]

const tableColumns = useTableColumn()

onMounted(init)

defineExpose({
	init,
})
</script>

<style lang="css" scoped>
.tamper-help-info code {
	@apply py-2px px-4px rounded-small;
	color: var(--el-color-danger);
	background-color: var(--el-color-danger-light-9);
}
</style>
