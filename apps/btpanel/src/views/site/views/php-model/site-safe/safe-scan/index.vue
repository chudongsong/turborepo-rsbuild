<template>
	<div id="safeDetectList" v-bt-loading="viewLoading">
		<div v-if="payment.authType === 'ltd'">
			<div class="progress-header">
				<div class="progress-header-cot">
					<div class="flex items-center">
						<!-- 扫描中转圈图标 -->
						<div v-if="scanParam.scanStatus && !scanParam.isEnd" class="scan-icon relative h-[8rem] w-[8rem] flex">
							<div class="animate-spin absolute top-0 border-warning border-b-2 rounded-full h-full w-full"></div>
							<bt-icon icon="scanning-danger" :size="60" color="var(--el-color-warning)" class="m-auto"></bt-icon>
						</div>

						<!-- 扫描结果+扫描前图标 -->
						<div v-else>
							<bt-icon icon="scanning-danger" :size="70" color="var(--el-color-danger)" v-if="scanParam.warn || scanParam.error"></bt-icon>
							<bt-icon :icon="'scanning-' + (scanParam.isEnd ? 'success' : 'danger')" :size="72" :color="scanParam.isEnd ? 'var(--el-color-primary)' : 'var(--el-color-warning)'" v-else></bt-icon>
						</div>
					</div>
				</div>
				<!-- 检测结果文字 -->
				<div class="progress-header-cot">
					<div class="scanning-progress-title">
						<template v-if="!scanParam.isEnd">
							{{ progressTitle }}
						</template>
						<template v-else>
							检测完成
							<template v-if="scanParam.error > 0 || scanParam.warn > 0">
								，共发现
								<template v-if="scanParam.error > 0">
									<span class="text-danger">{{ scanParam.error }}</span>
									项风险
								</template>
							</template>
						</template>
					</div>
					<div class="scanning-progress-cont">{{ progressSubTitle }}</div>
				</div>
				<!-- 检测按钮组 -->
				<div class="progress-header-cot">
					<el-button
						:class="{
							'warning-hover': scanParam.scanStatus && !scanParam.isEnd,
						}"
						:type="scanParam.scanStatus && !scanParam.isEnd ? 'warning' : 'primary'"
						@click="scanDetectEvent"
						:plain="scanParam.scanStatus && !scanParam.isEnd ? true : false">
						{{ scanParam.scanStatus && !scanParam.isEnd ? '取消扫描' : scanParam.isEnd ? '重新检测' : '立即检测' }}
					</el-button>
					<el-button v-if="scanParam.isEnd" type="default" @click="onlineServiceDialog"> 立即修复 </el-button>
				</div>
			</div>
			<el-divider class="!mt-0 !mb-20px !bg-base"></el-divider>
			<div class="progress-cont-list">
				<!-- 网站可扫描介绍 -->
				<div v-if="!scanParam.scanStatus && !scanParam.isEnd">
					<div class="font-bold text-medium text-secondary mb-[2rem]">支持网站以下安全扫描项:</div>
					<div class="inline-grid grid-cols-4 w-full mt-20px">
						<div v-for="(item, index) in scanIconData" :key="index" class="flex flex-col inline-block items-center mb-[20px]">
							<bt-image class="w-[4rem] inline-block mb-8px opacity-90" :src="'/scan/scanning-' + item.name + '-ico.svg'" />
							{{ item.title }}
						</div>
					</div>
				</div>

				<!-- 结果展示 -->
				<template v-if="scanParam.scanStatus || scanParam.isEnd">
					<div v-for="(value, key) in scanIconData" :key="key" :class="value.name + '_item ' + (scanParam.active[value.name] ? 'active' : '')" class="progress_item">
						<div class="progress_item_header" @click="titleClick(value.name)">
							<div class="progress_type">
								<!-- <bt-image class="mr-12px w-[2rem]" :src="'scan/scanning-' + value.name + '-ico.svg'" /> -->
								<span>{{ value.title }}</span>
							</div>
							<div class="flex-1">
								<span v-if="scanParam.statusTotal[value.name]" class="text-danger mr-4px"> 发现{{ scanParam.statusTotal[value.name] }}项危险 </span>
								<span v-if="scanParam.scanStatus && checkTopic == value.name"> 正在扫描... </span>
								<span v-if="!scanParam.scanStatus && !scanParam.statusTotal[value.name]" class="text-primary"> 无风险项 </span>
								<span v-if="scanParam.scanStatus && checkTopic != value.name && !scanParam.statusTotal[value.name]"> 等待扫描 </span>
							</div>
							<div class="progress_fold text-small flex items-center">
								<span class="mr-4px">
									{{ scanParam.active[value.name] ? '收起' : '展开' }}
								</span>
								<i :class="scanParam.active[value.name] ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'"></i>
							</div>
						</div>
						<div class="progress_item_body" v-show="scanParam.active[value.name]">
							<el-collapse accordion>
								<el-collapse-item v-for="(item, index) in scanParam.progressConfig[value.name]" :key="index" :disabled="authType == 'free'">
									<template #title>
										<div class="flex items-center justify-between w-full">
											<div class="flex items-center ml-12px">
												<span
													class="text-small h-[2.2rem] flex items-center px-[8px] rounded-small mr-[1rem]"
													:style="{
														color: levelData[item.dangerous || 0].color,
														backgroundColor: levelData[item.dangerous || 0].bg,
													}"
													>{{ levelData[item.dangerous || 0].text }}</span
												>
												<span v-html="item.name"></span>
											</div>
											<bt-link class="mb-2px mr-4px" @click="handleChangeDetail"> 详情 </bt-link>
										</div>
									</template>
									<div class="flex flex-col py-[1rem] px-[1.6rem] text-small progress_item_info">
										<div class="flex items-center">
											<span class="w-[6rem] flex-shrink-0 inline-block"> 详情： </span>
											<span class="leading-[1.6rem]" v-html="item.name"></span>
										</div>
										<el-divider class="!my-8px"></el-divider>
										<div class="flex">
											<span class="w-[6rem] flex-shrink-0 inline-block"> 修复方案： </span>
											<span v-html="item.repair"></span>
										</div>
									</div>
								</el-collapse-item>
							</el-collapse>
						</div>
					</div>
				</template>
			</div>
		</div>

		<bt-product-introduce v-else class="h-full max-h-[62.5rem] overflow-auto" :data="productData"></bt-product-introduce>
	</div>
</template>

<script lang="ts" setup>
import { Socket, useSocket as createSocket, useConfirm, useMessage } from '@/hooks/tools'
import { onlineServiceDialog, productPaymentDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { formatTime } from '@/utils'
import { scanSingleSite } from '@api/site'
import { useSiteStore } from '@site/useStore'
// import { Socket, useSocket as createSocket } from '@hooks/tools';

const Message = useMessage() // 消息提示

const { siteInfo } = useSiteStore()

const { payment } = useGlobalStore()
const { authType } = payment.value

const viewLoading = ref(false) // 加载状态
const scanIconData = ref([
	// { name: 'vulscan', title: '漏洞扫描' },
	{ name: 'webscan', title: '网站配置安全性' },
	{ name: 'filescan', title: '文件泄露' },
	{ name: 'backup', title: '备份文件' },
	// { name: 'webshell', title: '木马程序' },
	{ name: 'index', title: '首页内容风险' },
	{ name: 'webhorse', title: '挂马排查' },
	{ name: 'deadchain', title: '坏链检测' },
	{ name: 'database', title: '数据库安全' },
	{ name: 'ftps', title: '网站FTP风险' },
	{ name: 'backend', title: '网站后台安全' },
])
const scanIndex = ref(0) // 扫描索引
const checkName = ref('') // 检测名称
const checkTopic = ref('') // 当前正在检测的项目
const scanParam = reactive<any>({
	scanStatus: false,
	isEnd: false,
	error: 0, // 危险项
	warn: 0, // 风险项
	time: 0, // 扫描时间
	progress: 0,
	progressColor: 'var(--el-color-primary)',
	progressConfig: {},
	statusTotal: {},
	result: {},
	progressStatus: {},
	active: {},
})
let useSocket: Socket | null = null
// 风险等级展示
const levelData: any = reactive({
	0: {
		text: '警告',
		bg: 'rgba(var(--el-color-warning-rgb), 0.1)',
		color: 'var(--el-color-warning-light-3)',
	},
	1: {
		text: '低危',
		bg: 'rgba(var(--el-color-warning-rgb), 0.1)',
		color: 'var(--el-color-warning-light-3)',
	},
	2: {
		text: '中危',
		bg: 'rgba(var(--el-color-warning-rgb), 0.2)',
		color: 'var(--el-color-warning)',
	},
	3: {
		text: '高危',
		bg: 'rgba(var(--el-color-danger-rgb), 0.1)',
		color: 'var(--el-color-danger)',
	},
})

const productData = reactive({
	title: '安全扫描-功能介绍',
	height: 36,
	ps: '扫描服务器系统的漏洞，异常用户，已安装软件的安全问题并提供修复方案.',
	source: 66,
	desc: ['漏洞扫描', '网站配置安全性', '文件泄露', '备份文件', '木马程序'],
	tabImgs: ['https://www.bt.cn/Public/new/plugin/introduce/site/security-Introduction.png'],
})

/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	useSocket = createSocket({
		route: '/ws_project',
		onMessage: onWSReceive,
	})
}
// 详情购买
const handleChangeDetail = (key: string) => {
	if (authType == 'free') {
		//打开支付
		productPaymentDialog({
			sourceId: 65,
		})
	}
}

/**
 * @description 安全检测标题
 */
const progressTitle = computed(() => {
	return scanParam.scanStatus && !scanParam.isEnd ? '正在扫描' : '定期扫描网站，提升网站安全性'
})

/**
 * @description 安全检测副标题
 */
const progressSubTitle = computed(() => {
	return scanParam.scanStatus && !scanParam.isEnd ? `${checkName.value || ''}` : scanParam.time ? `上次检测时间：${scanParam.time}` : '当前安全风险未知，请立即检测'
})

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	if (e.data) {
		const msg = JSON.parse(e.data.replace(/'/g, '"'))
		if (msg.hasOwnProperty('end') && msg.end) {
			if (msg.webinfo?.result?.[msg.type].length > 0) {
				// 当存在危险项时
				scanParam.progressConfig[msg.type] = msg.webinfo.result[msg.type]
				// 若scanParam.statusTotal[msg.type]存在则+1，否则初始化为1
				scanParam.statusTotal[msg.type] = msg.webinfo.result[msg.type].length
			} else {
				scanParam.statusTotal[msg.type] = 0
			}
			// scanIndex === scanIconData.length时停止
			checkName.value = msg.info
			if (scanIndex.value === scanIconData.value.length - 1) {
				useSocket?.close()
				scanIndex.value = 0
				scanParam.scanStatus = false // 扫描结束
				scanParam.isEnd = true // 扫描结束
				return
			}
			let time = new Date().getTime()
			scanIndex.value++
			useSocket?.send({
				mod_name: 'webscanning',
				def_name: 'ScanSingleSite',
				ws_callback: time,
				name: siteInfo.value.name,
				scan_list: [scanIconData.value[scanIndex.value].name],
			})
		} else {
			checkName.value = msg.info // 储存当前正在检测的项目
			checkTopic.value = msg.type // 当前正在检测的项目名称
			if (msg.is_error) {
				scanParam.error++ // 危险项+1
			}
			// scanParam.allArr.push(msg)
		}
	}
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
const scanDetectEvent = async () => {
	scanParam.scanStatus && !scanParam.isEnd ? '取消扫描' : scanParam.isEnd ? '重新检测' : '立即检测'
	if (scanParam.scanStatus && !scanParam.isEnd) {
		// 取消扫描
		await useConfirm({
			title: '取消扫描',
			content: '确定取消扫描吗?',
			icon: 'warning',
		})
		useSocket?.close()
		scanIndex.value = 0

		resetData()
		return
	} else if (scanParam.isEnd) {
		await useSocket?.close()
		scanIndex.value = 0
		// 重新检测
		await resetData()
	}
	scanParam.scanStatus = true
	createWebSocket()
	// 处理数据格式
	let time = new Date().getTime()
	useSocket?.send({ 'x-http-token': window.vite_public_request_token })
	useSocket?.send({
		mod_name: 'webscanning',
		def_name: 'ScanSingleSite',
		ws_callback: time,
		name: siteInfo.value.name,
		scan_list: [scanIconData.value[scanIndex.value].name],
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
	scanParam.progressConfig = {
		vulscan: [],
		webscan: [],
		filescan: [],
		backup: [],
		webshell: [],
		index: [],
		webhorse: [],
		deadchain: [],
		database: [],
		ftps: [],
		backend: [],
	}
	scanParam.statusTotal = {}
	// scanParam.allArr = []
	scanParam.result = {}
	scanParam.progressStatus = {}
	scanParam.active = {
		// 重置active 展示
		vulscan: false,
		webscan: false,
		filescan: false,
		backup: false,
		webshell: false,
		index: false,
		webhorse: false,
		deadchain: false,
		database: false,
		ftps: false,
		backend: false,
	}
}

/**
 * 获取当前网站扫描时间
 */
const getScanNum = async () => {
	if (payment.value.authType !== 'ltd') return
	viewLoading.value = true
	try {
		const res = await scanSingleSite({
			data: JSON.stringify({ name: siteInfo.value.name }),
		})
		if (!res.status) {
			Message.request(res)
			return
		}
		scanParam.isEnd = scanParam.time || false
		scanParam.time = formatTime(res.data.time, 'yyyy-MM-dd')
	} catch (error) {
		console.log(error)
	} finally {
		viewLoading.value = false
	}
}

onMounted(() => {
	getScanNum()
	resetData()
})

defineExpose({
	onRefresh: async () => {
		getScanNum()
		resetData()
	},
})
</script>

<style lang="css" scoped>
.progress-header {
	@apply flex items-center text-center h-[10rem] p-8px;
}

.progress-header-cot:nth-child(1),
.progress-header-cot:nth-child(3) {
	position: relative;
}

.progress-header-cot:nth-child(3) {
	display: flex;
}

.progress-header-cot:nth-child(2) {
	width: 100%;
	padding: 0 20px;
}

button,
.scan-header-cont button {
	height: 36px;
	width: 100px;
	font-size: var(--el-font-size-base);
	border-radius: var(--el-border-radius-medium);
}

button:hover.warning-hover,
.scan-header-cont button:hover.warning-hover {
	color: var(--el-color-warning);
	background: rgba(var(--el-color-warning), 0.1);
	border-color: rgba(var(--el-color-warning), 0.2);
}

.scanning-progress-title {
	@apply text-left font-bold my-16px text-large;
}

.scanning-progress-title img {
	margin-right: 10px;
	vertical-align: sub;
	width: 24px;
}

.scanning-progress-cont {
	@apply text-left my-16px text-base truncate max-w-[40rem];
}

.progress_item {
	@apply mb-[20px] mt-0 px-20px bg-extraLight rounded-base;
	border: 1px solid transparent;
}

.progress_item_header {
	@apply text-secondary h-[46px] leading-[46px] rounded-base cursor-pointer text-base;
	@apply flex justify-between;
}

.progress_item_header .progress_type {
	@apply flex items-center font-bold w-[59.5%] leading-[22px];
}

.progress-cont-list {
	@apply max-h-[50rem] overflow-auto mt-20px;
}

.progress_item_body {
	@apply leading-[3rem] text-base display-none;
}

.progress_item.active .progress_item_body {
	display: block;
}

.progress_item_info {
	margin-bottom: 15px;
	background-color: rgba(var(--el-color-warning), 0.1);
}

.progress_item_info:hover {
	background-color: rgba(var(--el-color-warning), 0.2);
}
</style>
