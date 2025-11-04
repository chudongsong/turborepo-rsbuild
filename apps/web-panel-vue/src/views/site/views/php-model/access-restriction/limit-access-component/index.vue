<!--  -->
<template>
	<div class="relative">
		<BtInstallMask v-if="maskLayer">
			<template #content>
				<div class="content-mask">
					<i class="svgtofont-el-warning text-warning !text-subtitleLarge mr-4px"></i>
					不支持nginx之外的服务器
				</div>
			</template>
		</BtInstallMask>

		<!-- 访问限制 -->
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="handleOpenPopup()">添加{{ props.tabActive === 'encryptedAccess' ? '加密' : '禁止' }}访问</el-button>
			</template>
			<template #header-right></template>
			<template #content>
				<bt-table v-bt-loading="tableLoading" :column="tableColumn" ref="encryptedAccessRef" :data="tableData" />
			</template>
			<template #footer-left>
				<bt-table-batch v-if="props.tabActive === 'encryptedAccess'" :table-ref="encryptedAccessRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { getDirAuth, getFileDeny } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useMessage } from '@/hooks/tools'
import { useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { openResultDialog } from '@/views/site/useController'
import { useSiteStore } from '@/views/site/useStore'
import { delFileDeny, deleteDirAuth, deleteDirAuthMultiple } from '@api/site'

interface Props {
	tabActive: string
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	tabActive: 'encryptedAccess',
	compData: () => ({}),
})

const { plugin } = useGlobalStore()

const { siteInfo } = useSiteStore()

const Message = useMessage() // 消息提示

const encryptedAccessRef = ref<any>() // 获取表格实例
const tableLoading = ref<boolean>(false) // 表格加载状态
const tableData = ref<any>([]) // 表格数据
const maskLayer = ref<boolean>(false) // 遮罩层

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除加密访问',
			value: 'delete',
			event: async (batchCofirm, nextAll, selectedList, options, clearSelection) => {
				await useConfirm({
					title: '批量删除加密访问规则',
					content: '批量删除选中的加密访问规则，该操作可能会存在风险，是否继续？',
				})
				let loading = Message.load('正在删除,请稍后...')
				try {
					const res = await deleteDirAuthMultiple({
						site_id: siteInfo.value.id,
						names: selectedList.value.map((item: any) => item.name),
					})
					let result = res.data.success?.map((item: any) => {
						return {
							name: item,
							status: true,
						}
					})
					Object.keys(res.data.error).forEach((item: any) => {
						result.push({
							name: item,
							status: false,
							msg: res.data.error[item],
						})
					})
					openResultDialog({ resultData: result, resultTitle: '删除加密访问规则' })
					getDataList()
					clearSelection()
				} catch (error) {
					useHandleError(error)
				} finally {
					loading.close()
				}
			},
		},
	]
}

const usePassTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		useCheckbox(), // 复选框
		{
			label: '加密访问',
			prop: 'site_dir',
		},
		{
			label: '名称',
			prop: 'name',
		},
		{
			label: '用户',
			prop: 'user_list',
			render: (row: any) => {
				return row.user_list.join(',')
			},
		},

		useOperate([
			{ onClick: handleOpenPopup, title: '编辑' },
			{ onClick: delRule, title: '删除' },
		]), // 操作
	])
}

const useForbidTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{
			label: '名称',
			prop: 'name',
		},
		{
			label: '保护的目录',
			prop: 'dir',
		},
		{
			label: '规则',
			prop: 'suffix',
		},
		useOperate([
			{ onClick: handleOpenPopup, title: '编辑' },
			{ onClick: delRule, title: '删除' },
		]), // 操作
	])
}

/**
 * @description 删除规则
 * @param row
 */
const delRule = async (row: any) => {
	let flag = props.tabActive === 'encryptedAccess'
	await useConfirm({
		title: `删除${flag ? '加密' : '禁止'}访问规则【${row.name}】`,
		content: `删除选中的规则后，${flag ? `访问${row.site_dir}将不再需要安全验证，` : '该保护目录将失去防护，'}是否继续操作？`,
		icon: 'warning-filled',
		type: 'calc',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: flag ? deleteDirAuth({ id: siteInfo.value.id, name: row.name }) : delFileDeny({ website: siteInfo.value.name, deny_name: row.name }),
		message: true,
	})
	if (res.status) getDataList()
}

/**
 * @description 打开弹窗
 * @param data
 */
const handleOpenPopup = (data?: any) => {
	const isEncrypted = props.tabActive === 'encryptedAccess'
	useDialog({
		isAsync: true,
		title: `${data ? '编辑' : '添加'}${isEncrypted ? '加密访问' : '禁止访问'}`,
		area: isEncrypted && data ? 58 : 46,
		showFooter: isEncrypted && data ? false : true,
		compData: {
			...data,
			id: siteInfo.value.id,
			website: siteInfo.value.name,
			refresh: getDataList,
		},
		component: () => {
			if (isEncrypted) {
				if (data) return import('./edit-pass-limit.vue')
				else return import('./add-pass-limit.vue')
			}
			return import('./add-forbid-limit.vue')
		},
	})
}

/**
 * @description 获取禁止访问数据
 */
const getForbidData = async () => {
	useDataHandle({
		loading: tableLoading,
		request: getFileDeny({ website: siteInfo.value.name }),
		data: [Array, tableData],
	})
}

/**
 * @description 获取加密访问数据

 */
const getPassData = async () => {
	try {
		tableLoading.value = true
		const res = await getDirAuth({ id: siteInfo.value.id })
		tableData.value = res.data[siteInfo.value.name]
	} catch (error) {
		useHandleError(error)
	} finally {
		tableLoading.value = false
	}
}

const getDataList = () => {
	if (props.tabActive === 'encryptedAccess') {
		getPassData()
	} else if (props.tabActive === 'forbidAccess') {
		getForbidData()
	}
}

const tableColumn = props.tabActive === 'encryptedAccess' ? usePassTableColumn() : useForbidTableColumn()
const TableBatchOptions = batchOptions()

onMounted(() => {
	if (plugin.value.webserver != 'nginx') {
		Message.error('不支持nginx之外的服务器!')
		maskLayer.value = true
	} else {
		// 获取数据
		maskLayer.value = false
		getDataList()
	}
})
</script>
