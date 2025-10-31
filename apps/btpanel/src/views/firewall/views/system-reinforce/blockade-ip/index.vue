<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<bt-input v-model="ipAddress" :placeholder="'IP地址'" @keyup.enter.native="addIpEvent"></bt-input>
				<el-button class="!ml-[.4rem]" type="primary" @click="addIpEvent"> 添加 </el-button>
			</template>
			<template #content>
				<bt-table ref="table" :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'封锁IP列表为空'" v-bt-loading:title="'正在加载封锁IP列表，请稍后...'"></bt-table>
			</template>
			<template #popup></template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { addSshLimit, getSshLimitInfo, removeSshLimit } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { SystemIpTableDataProps } from '@/types/firewall'
import { Message } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools/data'
import { getDuration } from '@utils/index'
import { checkIp } from '@utils/index'

const ipAddress = ref<string>('') //添加的IP地址
const loading = ref<boolean>(false) // 加载状态
const tableData = ref<Array<SystemIpTableDataProps>>() //列表数据

/**
 * @description 切换列表页面
 */
const getIpList = async () => {
	await useDataHandle({
		loading,
		request: getSshLimitInfo(),
		data: [Array, tableData],
	})
}

/**
 * @description 添加IP地址
 */
const addIpEvent = async () => {
	if (!ipAddress.value) return Message.error('请输入IP地址')
	if (!checkIp(ipAddress.value)) return Message.error('请输入正确的IP地址')
	await useDataHandle({
		loading: '正在添加IP地址，请稍后...',
		request: addSshLimit({ ip: ipAddress.value }),
		message: true,
	})
	ipAddress.value = ''
	getIpList()
}

/**
 * @description 立即解封
 */
const removeIpEvent = async (row: any) => {
	await useDataHandle({
		loading: '正在解封IP地址，请稍后...',
		request: removeSshLimit({ ip: row.address }),
		message: true,
	})
	getIpList()
}

const tableColumn = [
	{ label: '名称', prop: 'address' },
	{
		label: '封锁时间',
		prop: 'end',
		render: (row: any) => {
			if (row.end == 0) return '永久封禁'
			return getDuration(row.end - row.start)
		},
	},
	useOperate([{ onClick: removeIpEvent, title: '立即解封', width: 70 }]),
]

onMounted(() => getIpList())
</script>
