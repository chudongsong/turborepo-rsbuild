<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
					<el-button type="default" class="!ml-[1.2rem]" @click="IsolationFileDialog">
						<span>隔离文件</span>
						<span :class="(webshellTotal > 0 ? 'bg-[red]' : 'bg-warning') + ' ml-[.4rem] py-[.1rem] px-[.4rem] text-white text-center font-bold'">
							{{ webshellTotal }}
						</span>
					</el-button>
					<div class="bg-darker w-[1px] h-2rem mx-8"></div>
					<div class="mr-4">动态查杀开关</div>
					<div>
						<el-switch v-model="isSpywareDetection" :width="36" @change="onChangeSpywareDetection"></el-switch>
					</div>
				</div>
			</template>
			<template #content>
				<bt-table ref="portTable" :column="tableColumn" :data="spywareTableData" v-bt-loading="loading" :description="'木马查杀列表为空'" v-bt-loading:title="'正在加载木马查杀列表，请稍后...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="portTable" :options="tableBatchData" />
			</template>
		</bt-table-group>
		<ul class="mt-8px leading-8 text-small list-disc ml-20px">
			<li>注意：隔离文件后的数字表示隔离文件总数</li>
			<li class="text-warning">动态查杀开启后，当查杀目录中的文件发生修改就会自动的进行木马查杀并进行隔离</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import { delMonitorDir, editMonitorDir, getMonitorDir, getServiceStatus, getWebshellTotal, setMonitorDir, setServiceStatus } from '@/api/firewall'
import type { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/data/bt-table'
import { useBatchStatus, useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { getFirewallStore } from '@firewall/useStore'
import { useDialog } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'

const {
	refs: { isRefreshSpywares },
} = getFirewallStore()

const webshellTotal = ref<number>(0) // 隔离文件总数
const portTable = ref() // 获取表格实例
const isSpywareDetection = ref(false) // 动态查杀开关
const spywareTableData = shallowRef([]) // 表格数据
const loading = ref(false) // 表格加载状态
// 表格左上方按钮组
const tableBtnGroup = [
	{
		active: true,
		content: '添加目录',
		event: () => {
			return useDialog({
				title: '添加安全检测目录',
				area: 50,
				component: () => import('./safa-detect-add-monitor-dir/index.vue'),
				showFooter: true,
			})
		},
	},
	{
		content: '白名单',
		event: () => {
			return useDialog({
				title: '白名单',
				area: [70, 55],
				component: () => import('@firewall/public/safa-detect-whitelist/index.vue'),
				showFooter: false,
			})
		},
	},
]

// 批量操作方法
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { value } = options
	let tips: string[] = []
	switch (value) {
		case 'startOpen':
			tips = ['开启监听', '开启后目录将会对自动的进行木马查杀并进行隔离']
			break
		case 'stopOpen':
			tips = ['关闭监听', '关闭后目录将不会对自动的进行木马查杀并进行隔离']
			break
		case 'deleteMonitorDir':
			tips = ['删除监听', '该目录将不在自动进行木马查杀和病毒文件隔离']
			break
	}
	const requestHandle = async (item: AnyObject, index: number) => {
		const { path } = item
		switch (value) {
			case 'startOpen':
			case 'stopOpen':
				return await setMonitorDir(value === 'startOpen' ? false : true, {
					data: JSON.stringify({
						path,
					}),
				})
				break
			case 'deleteMonitorDir':
				return await delMonitorDir({
					path,
				})
				break
		}
	}
	await batchConfirm({
		title: `批量${tips[0]}目录`,
		content: `批量${tips[0]}目录，${tips[1]}，是否继续操作！`,
		column: [
			{
				label: '目录',
				prop: 'path',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			spywareTableDataEvent()
			// 返回false则不关闭弹窗
			return false
		},
	})
}
// 批量操作列表
const tableBatchData: TableBatchOptionsProps[] = [
	{
		label: '开启监听目录',
		value: 'startOpen',
		event: useBatchEventHandle,
	},
	{
		label: '关闭监听目录',
		value: 'stopOpen',
		event: useBatchEventHandle,
	},
	{
		label: '删除监听目录',
		value: 'deleteMonitorDir',
		event: useBatchEventHandle,
	},
]

watch(
	() => isRefreshSpywares.value,
	(val: boolean) => {
		if (val) spywareTableDataEvent()
	}
)

/**
 * @description 扫描目录
 * @param {any} data 行数据
 */
const scanRow = async (data: any) => {
	return useDialog({
		title: `木马扫描【${data.path}】`,
		area: [84, 60],
		compData: { row: data },
		component: () => import('./safe-trojan-scan/index.vue'),
	})
}

/**
 * @description 删除监控
 * @param {any} data 行数据
 */
const deleteRow = async (data: any) => {
	await useConfirm({
		icon: 'question-filled',
		title: '删除监控【' + data.path + '】',
		width: '34rem',
		content: '删除后无法继续监控该网站，是否继续？',
	})
	useDataHandle({
		request: delMonitorDir({ path: data.path }),
		message: true,
		loading: '正在删除监控，请稍后...',
		success: spywareTableDataEvent,
	})
}

/**
 * @description 修改备注
 * @param {any} data 行数据
 */
const setPsEvent = async (data: any) => {
	useDataHandle({
		request: editMonitorDir({
			path: data.path,
			ps: data.ps,
		}),
		message: true,
		loading: '正在设置监控状态，请稍后...',
	})
}

/**
 * @description 切换监控状态
 * @param {boolean} status 监控状态
 */
const onChangeSpywareDetection = async (status: boolean) => {
	useDataHandle({
		request: setServiceStatus(!status),
		message: true,
		loading: '正在' + (status ? '开启' : '关闭') + '动态查杀开关，请稍后...',
	})
}

/**
 * @description 切换监控状态
 * @param {any} data 行数据
 */
const changeStatus = async (data: any) => {
	useDataHandle({
		request: setMonitorDir(data.open, {
			data: JSON.stringify({
				path: data.path,
			}),
		}),
		message: true,
		loading: '正在切换监控状态，请稍后...',
		success: spywareTableDataEvent,
	})
}

/**
 * @description 隔离文件
 */
const IsolationFileDialog = () => {
	return useDialog({
		title: '隔离文件',
		area: 70,
		component: () => import('./safe-isolation-file/index.vue'),
	})
}

// 表格配置
const tableColumn = [
	useCheckbox({ key: 'path' }),
	{
		label: '目录',
		prop: 'path',
	},
	useStatus({
		prop: 'open',
		event: changeStatus,
		data: ['已停止', '运行中'],
	}),
	// getPsConfig({})
	{
		label: '备注',
		prop: 'ps',
		minWidth: 200,
		isCustom: true,
		render: (row: any) => {
			const arrEntities: any = {
				lt: '<',
				gt: '>',
				nbsp: ' ',
				amp: '&',
				quot: '"',
			}
			row.ps = row.ps?.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
				return arrEntities[t]
			})
			return (
				<input
					type="text"
					value={row.ps}
					class="bt-table-input w-full"
					placeholder={`点击编辑备注`}
					// eslint-disable-next-line consistent-return
					onBlur={(e: any) => {
						if (row.ps === e.target.value) return false
						row.ps = e.target.value
						setPsEvent(row)
					}}
				/>
			)
		},
	},
	useOperate([
		{ onClick: scanRow, title: '扫描' },
		{ onClick: deleteRow, title: '删除' },
	]),
]
/**
 * @description 获取服务状态
 */
const getServiceStatusEvent = async () => {
	useDataHandle({
		request: getServiceStatus(),
		data: {
			status: [Boolean, isSpywareDetection],
		},
	})
}
/**
 * @description 木马查杀切换列表页面
 * @param {number} p 当前页码
 */
const spywareTableDataEvent = async () => {
	isRefreshSpywares.value = false
	useDataHandle({
		request: getMonitorDir(),
		data: [Array, spywareTableData],
		loading,
	})
}

/**
 * @description 获取隔离文件数量
 */
const getIsolationFileNum = async () => {
	useDataHandle({
		request: getWebshellTotal(),
		data: [Number, webshellTotal],
	})
}

// 页面加载完成
onMounted(() => {
	spywareTableDataEvent()
	getIsolationFileNum()
	getServiceStatusEvent()
})
</script>
<style scoped lang="css">
:deep(.el-table__fixed-right::before) {
	display: none;
}
</style>
