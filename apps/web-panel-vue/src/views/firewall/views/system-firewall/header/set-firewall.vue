<template>
	<div class="p-[2rem]">
		<BtAlert type="warning" description="开启系统防火墙会放行以下端口配置，如需调整，请手动关闭相应端口。" show-icon :closable="false" class="mb-[1rem]" />
		<BtTableGroup>
			<template #header>
				<div class="flex items-center gap-4 mb-2">
					<el-button size="small" @click="selectAllPorts(true)">全选</el-button>
					<el-button size="small" @click="selectAllPorts(false)">反选</el-button>
				</div>
			</template>
			<template #content>
				<BtTable :max-height="350" />
			</template>
		</BtTableGroup>
		<ul class="mt-20px leading-8 text-small list-disc ml-24px">
			<li>此操作将重载防火墙，未持久化的 iptables 规则会清空，请先备份保存！</li>
		</ul>
	</div>
</template>

<script lang="tsx" setup>
import { useTable, useDataHandle, useConfirm } from '@/hooks/tools'
import { setFirewallStatus } from '@/api/firewall'

interface Props {
	compData: {
		fireStatus: boolean
		callback: AnyFunction
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		fireStatus: false,
		callback: () => {},
	}),
})

const { compData } = toRefs(props)

// 默认端口列表
const defaultPorts = ref([
	{ port: '21', enabled: true },
	{ port: 'SSH', enabled: true, description: 'SSH端口(默认：22)' },
	{ port: '80', enabled: true },
	{ port: '443', enabled: true },
	{ port: '39000-40000', enabled: true },
	{ port: 'PanelPort', enabled: true, description: '面板端口' },
])

/**
 * @description 全选/反选端口
 */
const selectAllPorts = (isSelectAll: boolean) => {
	if (isSelectAll) {
		// 全选
		defaultPorts.value.forEach(item => {
			item.enabled = true
		})
	} else {
		// 反选
		defaultPorts.value.forEach(item => {
			item.enabled = !item.enabled
		})
	}
	refresh()
}

/**
 * @description 表格数据处理
 */
const tableDataHandling = async () => {
	// 这里可以添加从接口获取端口数据的逻辑
	return { data: defaultPorts.value, total: defaultPorts.value.length }
}

/**
 * @description 创建列
 */
const createColumn = () => {
	return [
		{
			label: '端口',
			prop: 'port',
			render: (row: { port: string; description: string }) => <span class="text-tertiary">{row.description || row.port}</span>,
		},
		{
			label: '放行',
			width: 80,
			render: (row: { port: string; enabled: boolean }) => (
				<el-switch
					size="small"
					modelValue={row.enabled}
					onChange={(val: boolean) => {
						row.enabled = val
					}}
				/>
			),
		},
	]
}

// 表格
const { BtTable, refresh } = useTable({
	request: tableDataHandling,
	columns: createColumn(),
})

/**
 * @description 获取端口信息
 */
const getEnabledPorts = () => {
	// 获取启用的端口
	const enabledPorts = defaultPorts.value
		.filter(item => item.enabled)
		.map(item => item.port)
		.join(',')

	// 获取关闭的端口
	const disabledPorts = defaultPorts.value
		.filter(item => !item.enabled)
		.map(item => item.port)
		.join(',')

	return {
		enabledPorts,
		disabledPorts,
	}
}

/**
 * @description 提交防火墙配置
 */
const submitFirewallConfig = async () => {
	try {
		const { disabledPorts, enabledPorts } = getEnabledPorts()
		const ports = disabledPorts

		// 添加确认框
		await useConfirm({
			icon: 'question-filled',
			title: '启用系统防火墙',
			content: `启用系统防火墙，将放行以下【${enabledPorts}】端口，是否继续操作？`,
		})

		await useDataHandle({
			loading: '正在启用系统防火墙，请稍后...',
			message: true,
			request: setFirewallStatus({ status: 1, ports }),
			success: () => {
				// 完成后调用回调函数
				compData.value.callback()
			},
		})
		return true
	} catch (error) {
		console.error(error)
		return false
	}
}

defineExpose({ onConfirm: submitFirewallConfig })
</script>
