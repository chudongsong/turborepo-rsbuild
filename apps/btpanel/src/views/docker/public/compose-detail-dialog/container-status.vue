<template>
	<div class="container-dialog">
		<div class="pb-[3rem] border-b border-dark">
			<div class="flex items-center ml-[2rem]">
				<span>当前状态：</span>
				<span class="ml-[1rem]">{{ currentStatus ? '运行中' : '已停止' }} </span>
				<span :class="currentStatus ? 'svgtofont-icon-start text-primary' : 'svgtofont-icon-stop text-danger'"></span>
			</div>
			<div class="flex mt-[2rem] ml-[2rem]">
				<el-button v-if="!currentStatus" @click="openStatus('start')"> 启动 </el-button>
				<el-button v-if="currentStatus" @click="openStatus('stop')">停止</el-button>
				<el-button @click="openStatus('restart')">重启</el-button>
			</div>
		</div>
		<div class="table ml-[2rem] mt-[2rem]">
			<div v-for="msg in commonInfo" :key="msg.key" class="item">
				<div class="w-[30%]">{{ msg.label }}</div>
				<div v-if="!msg.tag" class="w-[70%] truncate">
					<el-tooltip ref="tlp" :content="commonComputed[`${msg.key}Tip`]" :disabled="!msg.tooltip" placement="top">
						<span>{{ commonComputed[msg.key] }}</span>
					</el-tooltip>
				</div>
				<div
					v-if="msg.tag"
					class="w-[70%] relative"
					:class="{
						'cursor-pointer': commonComputed[msg.key].length > (msg.key === 'ipv6' ? 2 : 3),
					}"
					@click="openExpand(msg)">
					<div
						class="py-[1rem] pr-[2rem] min-h-[5rem] grid gap-[1rem]"
						:style="`grid-template-columns: repeat(auto-fill, minmax(${msg.key === 'ipv6' ? '16' : '13'}rem, 1fr))`"
						:class="{
							'h-[5rem]': !msg.expand.value,
							'items-center': !msg.expand.value,
						}"
						v-if="commonComputed[msg.key].length > 0">
						<template v-for="(port, portIndex) in commonComputed[msg.key]" :key="port">
							<span class="custom-success-tag" v-show="(msg.key === 'ipv6' ? portIndex < 2 : portIndex < 3) || msg.expand.value">{{ port }}</span>
						</template>
						<!-- <span class="custom-success-tag" v-for="port in commonComputed[msg.key].slice(0, msg.expand ? commonComputed[msg.key].length : (msg.key === 'ipv6' ? 2 : 3))" :key="port">{{ port }}</span> -->
						<span v-if="commonComputed[msg.key].length > (msg.key === 'ipv6' ? 2 : 3)" class="absolute top-[50%] right-[0rem] text-extraLarge" style="transform: translateY(-50%)" :class="msg.expand.value ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'"></span>
					</div>
					<div v-if="!commonComputed[msg.key].length" class="h-[5rem] flex items-center">--</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { setContainerStatus } from '@/api/docker'
import { formatTime } from '@utils/index'
import { getDockerStore } from '@docker/useStore'
import { useDataHandle } from '@hooks/tools/data'

const {
	refs: { currentConDetail },
	getCurrentCon,
	refreshActiveTable,
} = getDockerStore()

// 容器基础信息
const commonInfo = [
	{ key: 'name', label: '容器名称' },
	{ key: 'id', label: '容器ID', tooltip: true },
	{ key: 'image', label: '使用的镜像' },
	{ key: 'run', label: '运行时间' },
	{ key: 'created', label: '创建时间' },
	{ key: 'start', label: '启动时间' },
	{ key: 'port', label: '端口', tag: true, expand: toRef(false) },
	{ key: 'ip', label: 'IP', tag: true, expand: toRef(false) },
	{ key: 'ipv6', label: 'IPV6', tag: true, expand: toRef(false) },
]

const commonComputed = computed<any>(() => getCheckInfo(currentConDetail.value))
const currentStatus = computed(() => currentConDetail.value?.State?.Status === 'running')

/**
 * @description 计算两个时间戳之间相差的小时数
 * @param {number} timestamp1 第一个时间戳
 * @param {number} timestamp2 第二个时间戳
 * @returns {number} 两个时间戳之间相差的小时数
 */
const calculateHourDifference = (timestamp1: number, timestamp2: number): number => {
	// 将时间戳转换为毫秒数
	const millisecondsPerHour = 1000 * 60 * 60

	// 计算两个时间戳之间的毫秒数差异
	const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2)

	// 计算小时数差异并返回
	return Math.floor(differenceInMilliseconds / millisecondsPerHour)
}

/**
 * @description 时间转换
 * @param {string} date 时间
 * @returns {string} 格式化后的时间 yyyy-MM-dd hh:mm:ss
 */
const dateConvert = (date: string) => {
	const timestamp = new Date(date).getTime()
	return formatTime(timestamp)
}

/**
 * @description 展开/收起端口信息
 * @param {any} msg 信息
 */
const openExpand = (msg: any) => {
	if (!msg.tag || commonComputed.value[msg.key]?.length <= (msg.key === 'ipv6' ? 2 : 3)) return
	msg.expand.value = !msg.expand.value
}

/**
 * @description 获取容器检查信息
 */
const getCheckInfo = (info: any) => {
	if (!info.Id)
		return {
			name: '正在获取...',
			id: '正在获取...',
			idTip: '正在获取...',
			run: '正在获取...',
			created: '正在获取...',
			start: '正在获取...',
			image: '正在获取...',
			port: [],
			ip: [],
			ipv6: [],
		}
	const name = info.Name
	const id = info.Id.slice(0, 12)
	const image = info.Config?.Image || '--'
	const run = calculateHourDifference(new Date().getTime(), new Date(currentConDetail.value.State?.StartedAt).getTime())
	const created = dateConvert(info.Created)
	const start = dateConvert(info.State?.StartedAt)

	const arr = Object.entries(info.NetworkSettings?.Ports || {}) || []
	const port: string[] = []
	arr.forEach((item: any) => {
		if (item[1]) {
			port.push(`${item[1][0].HostPort}-->${item[0]} `)
		}
	})

	const netWorkArr: { IPAddress: string; GlobalIPv6Address: string }[] = Object.values(info.NetworkSettings?.Networks || {})
	const ip = netWorkArr.map((obj: { IPAddress: string }) => obj.IPAddress).filter((IPAddress: string) => IPAddress !== '') || []

	const ipv6 = netWorkArr.map((obj: { GlobalIPv6Address: string }) => obj.GlobalIPv6Address).filter((GlobalIPv6Address: string) => GlobalIPv6Address !== '') || []
	return {
		name,
		id,
		idTip: info.Id,
		image,
		run: run > 0 ? `${run}小时` : '不到1小时',
		created,
		start,
		port,
		ip,
		ipv6,
	}
}

/**
 * @description 设置容器状态
 * @param {string} type 状态类型
 */
const openStatus = async (type: string) => {
	const title = type == 'start' ? '启动' : type == 'stop' ? '停止' : '重启'
	const params = { id: currentConDetail.value.Id, status: type }
	await useDataHandle({
		request: setContainerStatus({ data: JSON.stringify(params) }),
		message: true,
		loading: `正在${title}容器，请稍候...`,
		success: (res: any) => {
			if (res.status) {
				getCurrentCon(currentConDetail.value.Id)
				refreshActiveTable() // 刷新表格
			}
		},
	})
}
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col lib-box min-h-[58rem] pt-[2rem];
}
.table .item {
	@apply flex items-center min-h-[5rem] overflow-hidden;
}
.table .item:not(:last-child) {
	@apply border-b border-dark;
}
.custom-success-tag {
	@apply text-primary border border-[var(--el-color-primary-light-8)] rounded-base bg-[var(--el-color-primary-light-9)] px-[0.7rem] text-center leading-[2rem] whitespace-nowrap inline-block w-full;
}
</style>
