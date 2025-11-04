<template>
	<div class="py-[.8rem]">
		<bt-table-group>
			<template #content>
				<bt-table :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'防护配置列表为空'" v-bt-loading:title="'正在加载防护配置列表，请稍后...'"></bt-table>
			</template>
		</bt-table-group>
		<bt-help :options="helpList" class="mx-[1.6rem] my-[0.6rem]"></bt-help>
	</div>
</template>
<script lang="tsx" setup>
import type { SystemTableDataProps } from '@firewall/types'

import { getReinforceStatus, setSafeStatus } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { Message } from '@hooks/tools'
import { useDialog } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools/data'

import { getFirewallStore } from '@firewall/useStore'
import { useGlobalStore } from '@store/global'

const {
	refs: { reinforceStatus },
} = getFirewallStore()

const { mainHeight } = useGlobalStore()

// 页面数据
const loading = ref<boolean>(false) // 加载状态
const tableData = ref<Array<SystemTableDataProps>>([]) //列表数据

const helpList = [
	{ content: '【异常进程监控】与【SSH服务加固】会占用一定服务器开销' },
	{ content: '开启系统加固功能后，一些如软件安装等敏感操作将被禁止' },
	{
		content: '开启【SSH服务加固】之后，用户登录SSH的行为将受到监控，若连续多次登录失败，将采取封IP措施',
	},
	{
		class: 'text-warning',
		content: '【注意】如果您需要安装软件或插件，请先将系统加固关闭！',
	},
] // 帮助列表

/**
 * @description 列表页面
 */
const getReinforceConfig = async () => {
	await useDataHandle({
		loading: loading,
		request: getReinforceStatus(),
		data: {
			list: [Array, tableData],
			open: [Boolean, reinforceStatus],
		},
	})
}

/**
 * @description 修改防护配置状态
 * @param {any} row 防护配置行数据
 */
const changeRowReinforceStatus = async (row: any, val: boolean | string) => {
	if (!reinforceStatus.value) return Message.error('请先开启系统加固功能')
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '防护配置，请稍后...',
		request: setSafeStatus({ s_key: row.key }),
		message: true,
	})
	getReinforceConfig()
}

/**
 * @description 修改防护配置
 * @param row 行数据
 */
const settingRowReinforce = async (row: any) => {
	useDialog({
		title: `配置【${row.name}】`,
		component: () => {
			if (row.key === 'ssh') return import('./row-ssh-config.vue')
			if (row.key === 'process') return import('./row-process.vue')
			return import('./row-reinforce.vue')
		},
		compData: row,
		area: 72,
	})
}

const tableColumn = [
	{ label: '名称', prop: 'name' },
	{ label: '描述', prop: 'ps' },
	{
		label: '状态',
		render: (row: any) => <ElSwitch modelValue={row.open} size="small" onChange={(val: any) => changeRowReinforceStatus(row, val)} />,
	},
	useOperate([{ onClick: settingRowReinforce, title: '配置' }]),
]

watch(
	() => reinforceStatus.value,
	val => {
		if (!val) {
			tableData.value.forEach((item: any) => (item.open = false))
		} else {
			getReinforceConfig()
		}
	}
)

onMounted(getReinforceConfig)
</script>
