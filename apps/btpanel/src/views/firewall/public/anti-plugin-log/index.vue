<template>
	<div class="p-[2rem]">
		<div class="flex items-center mb-[2rem]" v-if="compData.type == 'AntiScan'">
			<span class="mr-[.8rem]">防扫描开关</span>
			<el-switch v-model="antiScan" size="small" @change="antiScanSwitch" />
		</div>
		<div class="flex items-center justify-center mb-[1.2rem] bg-lighter border-1 border-base py-[1.2rem]">
			<div v-for="(item, index) in ipData" :key="index" class="flex flex-col items-center mx-[.4rem] p-[.8rem]">
				<span class="text-small">{{ item.title }}</span>
				<span class="font-bold text-large mt-[.8rem]">
					{{ item.num || 0 }}
				</span>
			</div>
		</div>
		<bt-table ref="antiTable" :column="tableColumn" :data="tableData" :max-height="220" v-bt-loading="loading" v-bt-loading:title="'正在加载中，请稍后...'" />
	</div>
</template>

<script setup lang="tsx">
import { delBlastIp, delScanIp, getAntiScanStatus, setAntiScanStatus } from '@/api/firewall'
import { useDataHandle } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const antiScan = ref(false) // 防扫描开关
const tableData = ref<any>() // 表格数据
const loading = ref(false) // 加载状态
const ipData = ref([
	{ title: '封锁的IP总数', value: 'total_banned', num: 0 },
	{ title: '连接失败总数', value: 'total_failed', num: 0 },
	{ title: '当前封锁IP数', value: 'currently_banned', num: 0 },
	{ title: '当前连接失败次数', value: 'currently_failed', num: 0 },
])

/**
 * @description 防扫描开关
 * @param { boolean } val 开关状态
 * @return { void }
 */
const antiScanSwitch = async (val: boolean) => {
	antiScan.value = !val
	await useDataHandle({
		loading: '正在设置防扫描开关，请稍候...',
		request: setAntiScanStatus({ status: val ? 1 : 0 }),
		message: true,
	})
	antiScan.value = val
}

/**
 * @description: 删除IP
 */
const delIpValue = async (ip: string) => {
	const isAntiScan = props.compData.type === 'AntiScan'
	await useDataHandle({
		loading: '正在解封,请稍后...',
		request: isAntiScan ? delScanIp({ data: JSON.stringify({ ip }) }) : delBlastIp({ ip }),
		message: true,
	})
	init()
}

/**
 * @description: 获取防暴破日志
 */
const getAntiLog = async () => {
	const res = await useDataHandle({
		loading: loading,
		request: props.compData.requestFn(),
	})
	// 将对应键值的值赋值给ipData中对应value的num
	ipData.value.forEach((item: any) => {
		item.num = Number(res.data[item.value]) || 0
	})
	tableData.value = res.data.banned_ip_list
}

/**
 * @description: 获取防扫描开关状态
 */
const getAntiScanLogsStatus = async () => {
	try {
		const { data: res } = await useDataHandle({
			loading: '正在获取防扫描开关状态，请稍候...',
			request: getAntiScanStatus(),
		})
		antiScan.value = Boolean(res.status)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 初始化
 */
const init = async () => {
	if (props.compData.type == 'AntiScan') getAntiScanLogsStatus()
	getAntiLog()
}

const tableColumn = [
	{
		label: 'IP',
		prop: 'ip',
		render: (row: any) => {
			return h('span', row)
		},
	},
	useOperate([{ onClick: (row: any) => delIpValue(row), title: '删除' }]), // 操作
] // 表格列

onMounted(init)
</script>
