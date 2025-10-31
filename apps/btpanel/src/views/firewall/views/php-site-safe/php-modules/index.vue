<template>
	<div>
		<bt-table-group>
			<template #header-right>
				<bt-table-refresh @refresh="getPHPList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="Table" :column="tableColumn" :data="tableData" :description="'暂无木马文件'" v-bt-loading="tableLoading" v-bt-loading:title="'正在加载列表，请稍后...'" />
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { useGlobalStore } from '@store/global'
import { useDataHandle, useConfirm } from '@hooks/tools'
import { getPhpModuleList, setPhpModuleStatus } from '@/api/firewall'

const { mainHeight } = useGlobalStore()

const tableLoading = ref(false) // 表格loading
const tableData = shallowRef([]) // 表格数据

/**
 * @description 切换状态
 * @param row
 * @param value
 */
const toggleState = async (row: any): Promise<void> => {
	const value = !row.state
	await useConfirm({
		title: `${value ? '开启' : '关闭'}防护`,
		icon: 'warning-filled',
		content: `${value ? '开启' : '关闭'}后，${row.version}版本的站点将${value ? '' : '不再'}受到安全防护，是否继续？`,
	})
	await useDataHandle({
		loading: '正在' + (value ? '开启' : '关闭') + '防护状态，请稍后...',
		request: setPhpModuleStatus({ php_version: row.v, enable: Number(value) }),
		message: true,
	})
	getPHPList()
}

/**
 * @description 获取ip/url白名单表格数据
 */
const getPHPList = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getPhpModuleList(),
		data: { php_versions: [Array, tableData] },
	})
}

// 表格列
const tableColumn = [
	{ label: '版本', prop: 'version' },
	{ label: '站点数量', prop: 'site_count' },
	{
		label: '防护状态',
		render: (row: any) => {
			return (
				<ElSwitch
					size="small"
					modelValue={row.state == 1}
					onClick={(value: any) => {
						toggleState(row)
					}}
				/>
			)
		},
	},
]

onMounted(() => getPHPList())
</script>
