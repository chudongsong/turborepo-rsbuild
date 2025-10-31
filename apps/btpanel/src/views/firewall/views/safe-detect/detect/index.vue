<template>
	<div id="safeDetectList" v-bt-loading="loading">
		<div class="progress-header">
			<div class="progress-header-cot">
				<div :class="'progresscirclebar ' + (!scanDetect.status ? '' : 'security ') + 'text-[' + (scanDetect.msg?.security_count === 100 ? ' var(--el-color-primary) ' : ' var(--el-color-warning)') + ']'">
					<bt-image class="w-[10rem]" v-if="!scanDetect.status" src="/firewall/icon-safe-detect.svg" />
					<template v-else>
						<div v-if="scanParam.scanStatus && !scanParam.isEnd" class="relative">
							<el-progress class="animate-spin" type="circle" :percentage="70" :show-text="false" :stroke-width="4" :define-back-color="'var(--el-color-white)'" :color="scanParam.warn || scanParam.error ? 'var(--el-color-warning)' : 'var(--el-color-primary)'" :width="100"></el-progress>
							<div class="absolute top-[1.6rem] left-[2.6rem] flex flex-col">
								<bt-image class="w-[full] px-[.4rem]" :src="`/firewall/icon-safe-detect${scanParam.warn || scanParam.error ? '-org' : ''}.svg`" />
								<span class="text-small font-bold py-[.4rem] leading-none"> 安全检测 </span>
							</div>
						</div>
						<el-progress v-else type="circle" :percentage="scanDetect.msg?.security_count" :format="format" :color="scanDetect.msg?.security_count === 100 ? 'var(--el-color-primary)' : 'var(--el-color-warning)'" :width="100"></el-progress>
					</template>
				</div>
			</div>
			<div class="progress-header-cot">
				<div class="scanning-progress-title">
					<template v-if="!scanParam.isEnd">
						{{ progressTitle }}
					</template>
					<template v-else>
						检测已完成
						<template v-if="scanParam.error > 0 || scanParam.warn > 0">
							，一共发现
							<template v-if="scanParam.warn > 0">
								<span class="color-org">{{ scanParam.warn }}</span>
								项风险项
							</template>
							<template v-if="scanParam.error > 0">
								（包含
								<span class="color-red">{{ scanParam.error }}</span>
								项危险项，请立即处理）
							</template>
						</template>
					</template>
				</div>
				<el-progress v-if="scanParam.scanStatus" :percentage="scanParam.progress" :color="scanParam.warn || scanParam.error ? 'var(--el-color-warning)' : 'var(--el-color-primary)'" :stroke-width="10"></el-progress>
				<div class="scanning-progress-cont">{{ progressSubTitle }}</div>
			</div>
			<div class="progress-header-cot">
				<el-button :type="scanParam.scanStatus && !scanParam.isEnd ? 'warning' : 'primary'" @click="scanDetectEvent" :plain="scanParam.scanStatus && !scanParam.isEnd ? true : false">
					{{ scanParam.scanStatus && !scanParam.isEnd ? '取消扫描' : scanParam.isEnd ? '重新检测' : '立即检测' }}
				</el-button>
				<!-- <bt-btn v-if="scanParam.isEnd" type="default" @click="onlineServiceDialog">联系客服</bt-btn> -->
				<bt-link class="!absolute -bottom-[2.5rem] right-[1.4rem]" href="https://www.bt.cn/bbs/thread-126643-1-1.html"> 需求反馈>> </bt-link>
			</div>
		</div>
		<div class="progress-cont-list">
			<div v-for="(value, key) in progressType" :key="key" :class="key + '_item ' + (scanParam.active[key] ? 'active' : '')" class="progress_item">
				<div class="progress_item_header" @click="titleClick(key)">
					<div class="progress_type">
						<bt-image class="title-icon" :src="'/firewall/icon-' + key + '.svg'" />
						<span>{{ value }}</span>
					</div>
					<div class="progress_status">
						<template v-if="scanParam.statusTotal[key]">
							<template v-if="scanParam.statusTotal[key]['3'] || scanParam.statusTotal[key]['2']">
								<span v-if="scanParam.statusTotal[key]['3']" class="text-danger"> 发现{{ scanParam.statusTotal[key]['3'] }}项危险 </span>
								<span v-if="scanParam.statusTotal[key]['2']" class="text-warning"> {{ (scanParam.statusTotal[key]['3'] ? '' : '发现') + scanParam.statusTotal[key]['2'] }}项警告 </span>
							</template>
							<span v-else-if="scanParam.scanStatus && checkTopic == key"> 正在扫描... </span>
							<span v-else class="text-secondary">无风险项</span>
						</template>
						<template v-else>
							<span v-if="scanParam.scanStatus && !scanParam.statusTotal[key]"> 等待扫描 </span>
						</template>
					</div>
					<div class="progress_fold">
						<bt-image :src="'/firewall/arrow-down.svg'" />
					</div>
				</div>
				<div class="progress_item_body">
					<template v-if="scanParam.progressConfig[key] && scanParam.progressConfig[key].length">
						<div v-for="(item, index) in scanParam.progressConfig[key]" :key="index" :class="item.info ? 'active' : ''" class="progress_item_info">
							<div class="info_cont">
								<div>{{ item.name.replace('分析网站', '') }}</div>
								<div :class="'text-[' + statusType[item.status < 0 ? 0 : item.status].color + ']'">
									{{ statusType[item.status < 0 ? 0 : item.status].text }}
								</div>
							</div>
							<div class="info_cont_desc">{{ item.info || '' }}</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getSafeCount } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools'
import { useHandleError } from '@hooks/tools'
import { Socket, useSocket } from '@hooks/tools/socket'
import { formatTime, getSimplifyTime } from '@utils/index'

const loading = ref<boolean>(false)

const statusType = [
	{ color: 'var(--el-color-text-tertiary)', text: '未安装' },
	{ color: 'var(--el-color-text-secondary)', text: '良好' },
	{ color: 'var(--el-color-warning', text: '警告' },
	{ color: 'red', text: '危险' },
]
const progressType = {
	system_account: '系统账户',
	sshd_service: 'SSHD远程服务',
	file_mode: '重要文件权限及属性',
	software: '重点软件检测',
	other: '其他项目检测',
	backdoor: '后门检测',
	proc: '恶意进程',
	history: '历史命令',
	log: '日志排查',
	rootkit: 'rootkit检测',
}
const initData = {
	scanStatus: false,
	isEnd: false,
	error: 0, // 危险项
	warn: 0, // 风险项
	time: 0, // 扫描时间
	progress: 0,
	progressColor: 'var(--el-color-primary)',
	progressConfig: {
		system_account: [],
		sshd_service: [],
		file_mode: [],
		software: [],
		other: [],
		backdoor: [],
		proc: [],
		history: [],
		log: [],
		rootkit: [],
	},
	statusTotal: {},
	allArr: [],
	result: {},
	progressStatus: {},
	active: {
		// 是否展开
		system_account: false,
		sshd_service: false,
		file_mode: false,
		software: false,
		other: false,
		backdoor: false,
		proc: false,
		history: false,
		log: false,
		rootkit: false,
	},
}
const scanDetect = ref<any>({})

const scanParam = reactive<any>({ ...initData })

const format = (percentage: number) => {
	return percentage + ' 分'
}

let socketInfo: Socket | null = null
/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	socketInfo = useSocket({
		route: '/ws_project',
		onMessage: onWSReceive,
	})
}
/**
 * @description 安全检测标题
 */
const progressTitle = computed(() => {
	return scanParam.scanStatus && !scanParam.isEnd ? '正在扫描' : !scanDetect.value.status ? '当前未进行安全检测' : '上次检测时间 ' + (getSimplifyTime(scanDetect.value.msg.time) === '刚刚' ? '一分钟内' : getSimplifyTime(scanDetect.value.msg.time))
})
const checkName = ref('')
const checkTopic = ref('')
/**
 * @description 安全检测副标题
 */
const progressSubTitle = computed(() => {
	return scanParam.scanStatus && !scanParam.isEnd ? `正在扫描-${checkName.value}` : !scanParam.isEnd ? (!scanDetect.value.status ? '当前安全风险未知，请立即检测' : '若长时间未检测，服务器可能存在安全风险，建议立即检测') : '检测时间：' + formatTime(scanParam.time / 1000, 'yyyy-MM-dd')
})
/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	if (e.data) {
		const msg = JSON.parse(e.data.replace(/'/g, '"'))
		// 首次接收消息，发送给后端，进行同步适配
		if (msg.hasOwnProperty('callback')) {
			socketInfo?.close()
			scanParam.scanStatus = false // 扫描结束
			scanParam.isEnd = true // 扫描结束
			scanParam.time = new Date().getTime()
		} else {
			checkName.value = msg.name

			checkTopic.value = msg.topic

			scanParam.progress = parseInt(msg.progress)
			scanParam.progressConfig[msg.topic].push(msg)
			scanParam.statusTotal[msg.topic] = getArrNum(scanParam.progressConfig[msg.topic]) // 获取每个类型的status数量
			scanParam.allArr.push(msg)
			if (msg.status === 3) {
				scanParam.error++
			} else if (msg.status === 2) {
				scanParam.warn++
			}
			if (msg.status !== 1) {
				scanParam.progressColor = 'var(--el-color-warning)'
			}
		}
	}
}

const getArrNum = (arr: any[]) => {
	const obj = {} as any
	arr.forEach(item => {
		if (obj[item.status]) {
			obj[item.status]++
		} else {
			obj[item.status] = 1
		}
	})
	return obj
}

/**
 * @description 每项点击事件
 */
const titleClick = (key: any) => {
	scanParam.active[key] = !scanParam.active[key]
}

/**
 * @description 扫描检测
 */
const scanDetectEvent = () => {
	scanParam.scanStatus && !scanParam.isEnd ? '取消扫描' : scanParam.isEnd ? '重新检测' : '立即检测'
	if (scanParam.scanStatus && !scanParam.isEnd) {
		// 取消扫描
		socketInfo?.close()
		resetData()
		return
	} else if (scanParam.isEnd) {
		// 重新检测
		resetData()
	}
	scanParam.scanStatus = true
	createWebSocket()
	// 处理数据格式
	socketInfo?.send({
		mod_name: 'safe_detect',
		def_name: 'get_safe_scan',
		ws_callback: '',
	})
}

/**
 * @description 重置数据
 */
const resetData = () => {
	scanParam.scanStatus = false
	scanParam.isEnd = false
	scanParam.error = 0
	scanParam.warn = 0
	scanParam.time = 0
	scanParam.progress = 0
	scanParam.progressColor = 'var(--el-color-primary)'
	scanParam.progressConfig = {
		system_account: [],
		sshd_service: [],
		file_mode: [],
		software: [],
		other: [],
		backdoor: [],
		proc: [],
		history: [],
		log: [],
		rootkit: [],
	}
	scanParam.statusTotal = {}
	scanParam.allArr = []
	scanParam.result = {}
	scanParam.progressStatus = {}
	scanParam.active = {
		system_account: false,
		sshd_service: false,
		file_mode: false,
		software: false,
		other: false,
		backdoor: false,
		proc: false,
		history: false,
		log: false,
		rootkit: false,
	}
}

/**
 * @description 获取上次安全检测数量
 */
const getSafeCountEvent = async () => {
	try {
		const res = await getSafeCount()
		scanDetect.value = res.data
	} catch (error) {
		useHandleError(error)
	}
}

onMounted(() => {
	getSafeCountEvent()
})
</script>

<style lang="css" scoped>
.progress-header {
	display: flex;
	align-items: center;
	height: 140px;
	padding: 20px 20px;
	text-align: center;
}

.progresscircle {
	position: absolute;
	top: 8px;
	left: 25px;
}

.progresscircle p {
	padding: 5px 0;
	font-size: var(--el-font-size-base);
	font-weight: 700;
}

.progresscirclebar {
	position: relative;
	width: 100px;
	height: 100px;
	line-height: 100px;
	font-size: var(--el-font-size-large);
}

.progresscirclebar.security svg {
	position: absolute;
	width: 100px;
	height: 100px;
	left: 0;
	font-weight: 600;
}

.progresscirclebar span:nth-child(1) {
	font-size: var(--el-font-size-subtitle-large);
}

.progresscirclebar.active svg {
	-webkit-animation: load8 1.1s infinite linear;
	animation: load8 1.1s infinite linear;
}

.progress-header-cot:nth-child(1),
.progress-header-cot:nth-child(3) {
	min-width: 100px;
	position: relative;
}

.progress-header-cot:nth-child(3) {
	display: flex;
}

.progress-header-cot:nth-child(2) {
	width: 100%;
	padding: 0 40px;
}

.progress-header-cot button,
.scan-header-cont button {
	height: 40px;
	width: 120px;
	font-size: var(--el-font-size-medium);
	border-radius: var(--el-border-radius-medium);
}

.progress-header-cot button.cancel_detect {
	border-color: var(--el-base-tertiary);
	color: var(--el-color-text-secondary);
	background-color: var(--el-color-white);
	font-size: var(--el-font-size-medium);
}

.progress-header-cot button.cancel_detect:hover {
	color: var(--el-color-warning);
	background: rgba(var(--el-color-warning), 0.1);
	border-color: rgba(var(--el-color-warning), 0.2);
}

.scanning-progress-title {
	text-align: left;
	font-weight: 700;
	margin: 15px 0;
	font-size: var(--el-font-size-extra-large);
}

.scanning-progress-title img {
	margin-right: 10px;
	vertical-align: sub;
	width: 24px;
}

.scanning-progress-title .color-red {
	color: red;
}

.scanning-progress-title span {
	color: var(--el-color-warning);
}

.color-org {
	color: var(--el-color-warning);
}

.scanning-progress-cont {
	text-align: left;
	margin: 15px 0;
	font-size: var(--el-font-size-base);
}

.scanning-progress-bar {
	display: flex;
	align-items: center;
}

.scanning-progress-bar .progress-bar {
	width: 100%;
	height: 10px;
	border-radius: var(--el-border-radius-circle);
	background-color: var(--el-fill-color-dark);
	box-shadow: none;
}

.scanning-progress-bar .progress-bar .progressbar {
	width: 0;
	height: 10px;
	border-radius: var(--el-border-radius-circle);
	background-color: var(--el-color-primary);
	transition: width 300ms;
}

.scanning-progress-bar .progressbar_text {
	margin-left: 10px;
	width: 32px;
	font-size: var(--el-font-size-base);
}

.progress_item {
	margin: 0 20px 20px 20px;
	padding: 0 20px;
	background-color: var(--el-fill-color-light);
	border-radius: var(--el-border-radius-base);
	border: 1px solid transparent;
}

.progress_item_header {
	height: 55px;
	line-height: 55px;
	display: flex;
	justify-content: space-between;
	border-radius: var(--el-border-radius-base);
	cursor: pointer;
	font-size: var(--el-font-size-medium);
	color: var(--el-color-text-secondary);
}

.progress_item_header .progress_type {
	display: flex;
	align-items: center;
	width: 59.5%;
	font-weight: bold;
	line-height: 22px;
}

.progress_item_header .progress_type .title-icon {
	width: 20px;
	margin-right: 10px;
}

.progress_item_header .progress_status {
	flex: 1;
}

.progress-cont-list {
	margin-top: 20px;
}

.progress_item_body {
	line-height: 30px;
	display: none;
	font-size: var(--el-font-size-base);
}

.progress_item.active .progress_item_body {
	display: block;
}

.progress_item_info {
	margin-bottom: 15px;
}

.progress_item_info .info_cont {
	display: flex;
	color: var(--el-color-text-secondary);
	padding: 10px 30px;
}

.progress_item_info .info_cont div:nth-child(1) {
	width: 60%;
}

.progress_item_info .info_cont div:nth-child(2) {
	width: 40%;
}

.progress_item_info .info_cont div:nth-child(2) span {
	font-weight: 600;
}

.progress_item_info.active {
	background-color: rgba(var(--el-color-warning), 0.1);
	padding: 10px 0;
}

.progress_item_info.active .info_cont {
	margin: 0 20px;
	padding: 0 10px 5px 10px;
	border-bottom: 1px dashed var(--el-color-border-dark);
}

.progress_item_info.active .info_cont_desc {
	color: var(--el-color-text-tertiary);
	border-radius: var(--el-border-radius-base);
	padding: 5px 30px 0 30px;
}

.progress_item_info.active:hover {
	background-color: rgba(var(--el-color-warning), 0.2);
}

.progress_item_info:hover {
	background-color: var(--el-fill-color-darker);
}

.btn_red {
	font-weight: bold;
	margin-left: 5px;
	padding: 1px 5px;
	text-align: center;
	border-radius: var(--el-border-radius-base);
	color: var(--el-color-white);
	background: red;
}

.btn_normal {
	font-weight: bold;
	margin-left: 5px;
	padding: 1px 5px;
	text-align: center;
	border-radius: var(--el-border-radius-base);
	color: var(--el-color-white);
	background: var(--el-color-warning-light-5);
}

:deep(.el-progress__text) {
	font-size: var(--el-font-size-medium) !important;
	font-weight: bold;
}
</style>
