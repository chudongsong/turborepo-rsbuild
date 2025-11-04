<template>
	<div id="safeDetectList" class="p-[2rem]" v-bt-loading="viewLoading">
		<div class="progress-header">
			<div class="progress-header-cot">
				<div class="flex items-center">
					<!-- 扫描中转圈图标 -->
					<div v-if="scanParam.scanStatus" class="scan-icon relative h-[8rem] w-[8rem] flex">
						<div class="animate-spin absolute top-0 border-primary border-b-2 rounded-full h-full w-full"></div>
						<bt-icon icon="scanning-danger" :size="60" color="#F39C12" class="m-auto"></bt-icon>
					</div>

					<!-- 扫描结果+扫描前图标 -->
					<div v-else>
						<bt-icon icon="scanning-danger" :size="70" color="#ef0808" v-if="scanParam.warn || scanParam.error"></bt-icon>
						<bt-icon :icon="'scanning-' + (scanParam.isEnd ? 'success' : 'danger')" :size="72" :color="scanParam.isEnd ? 'var(--el-color-primary)' : '#F39C12'" v-else></bt-icon>
					</div>
				</div>
			</div>
			<!-- 扫描结果文字 -->
			<div class="progress-header-cot h-[8rem]">
				<div class="scanning-progress-title" v-html="scanParam.title"></div>
				<div class="scanning-progress-cont">
					{{ scanParam.msg.length > 35 ? scanParam.msg.substring(0, 35) + '...' : scanParam.msg }}
				</div>
			</div>
			<!-- 扫描按钮组 -->
			<div class="progress-header-cot">
				<!-- <el-button type="text" @click="hanelChangeScanSiteList" v-if="scanParam.isFirst || scanParam.isEnd"> 选择网站 </el-button> -->
				<el-button :class="{ 'warning-hover': scanParam.scanStatus }" :plain="scanParam.scanStatus ? true : false" :type="scanParam.btnObj.type" @click="scanDetectEvent">
					{{ scanParam.btnObj.text }}
				</el-button>
				<!-- <el-button type="default" v-if="scanParam.isEnd" @click="rPlanEvent"> 联系客服 </el-button> -->
			</div>
		</div>
		<el-progress v-show="scanParam.scanStatus" class="!w-full" :color="scanParam.progressColor" :show-text="false" :stroke-width="2" :percentage="scanParam.progress"></el-progress>
		<el-divider class="!mt-0 !mb-20px !bg-base" v-show="!scanParam.scanStatus"></el-divider>
		<div class="progress-cont-list">
			<!-- 网站可扫描介绍 -->
			<div v-if="!scanParam.scanStatus && !scanParam.isEnd">
				<div class="font-bold text-medium text-secondary my-[4rem]">支持网站以下安全扫描项:</div>
				<div class="inline-grid grid-cols-4 w-full mt-20px">
					<div v-for="(item, index) in scanIconData" :key="index" class="flex flex-col inline-block items-center mb-20px">
						<bt-image class="w-[4rem] inline-block mb-8px opacity-90" :src="'/scan/scanning-' + item.name + '-ico.svg'" />
						{{ item.title }}
					</div>
				</div>
			</div>

			<!-- 结果展示 -->
			<div v-if="scanParam.scanStatus || scanParam.isEnd" v-for="(value, key) in scanIconData" :key="key" :class="value.name + '_item ' + (scanParam.active[value.name] ? 'active' : '')" class="progress_item">
				<div class="progress_item_header" @click="titleClick(value.name)">
					<div class="progress_type">
						<bt-image class="mr-12px w-[2rem]" :src="'/scan/scanning-' + value.name + '-ico.svg'" />
						<span>{{ value.title }}</span>
					</div>
					<div class="flex-1">
						<span v-if="scanParam.scanStatus && checkTopic == value.name"> 正在扫描... </span>
						<span v-else-if="scanParam.scanStatus && checkTopic != value.name && !scanParam.statusTotal[value.name] && scanParam.scanTypeStatus[value.name]"> 等待扫描 </span>
						<span v-else-if="scanParam.statusTotal[value.name]" class="text-danger mr-[4px]"> 发现{{ scanParam.statusTotal[value.name] }}项危险 </span>
						<span v-else class="text-primary">无风险项</span>
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
										<span v-html="item.info"></span>
									</div>
									<bt-link class="mb-2px mr-4px" @click="handleChangeDetail"> 详情 </bt-link>
								</div>
							</template>
							<div class="flex flex-col py-[1rem] px-[1.6rem] text-small progress_item_info">
								<div class="flex items-center">
									<span class="w-[6rem] flex-shrink-0 inline-block"> 详情： </span>
									<span class="leading-[1.6rem]" v-html="item.detail"></span>
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
		</div>
		<bt-dialog title="选择扫描网站" v-model="siteListDialog" ref="scanSiteListDialog" :area="45" @confirm="confirmScanSite" showFooter>
			<div class="p-[2rem]">
				<bt-table ref="scanSiteTableRef" :data="siteTableData" :column="siteTableColumn" :max-height="296" @selection-change="handleSelectionChange" description="网站列表为空"></bt-table>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { Socket, useSocket as createSocket, useConfirm, useMessage, useHandleError } from '@/hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'
import { productPaymentDialog, recoveryPlanDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { scanSiteRepairReq, getRiskCount } from '@api/site'
import { getScanData } from '../useController'

const Message = useMessage()

const { payment } = useGlobalStore()

const { authType } = payment.value

const scanSiteTableRef = ref<any>() // 站点列表ref
const viewLoading = ref(false) // 加载状态
const scanIconData = ref([
	// { name: 'vulscan', title: '漏洞扫描' },
	{ name: 'webscan', title: '网站配置安全性' },
	{ name: 'filescan', title: '文件泄露' },
	{ name: 'backup', title: '备份文件' },
	{ name: 'index', title: '首页内容风险' },
	{ name: 'webhorse', title: '挂马排查' },
	{ name: 'deadchain', title: '坏链扫描' },
	{ name: 'database', title: '数据库安全' },
	{ name: 'ftps', title: '网站FTP风险' },
	{ name: 'backend', title: '网站后台安全' },
])
const checkTopic = ref('') // 当前正在扫描的项目
let timer: any = null // 定时器

const scanParam = reactive<any>({
	title: '定期扫描网站，提升网站安全性',
	msg: '当前安全风险未知，请立即扫描',
	isFirst: true, // 是否第一次扫描
	error: 0, // 危险项
	scanStatus: false,
	isEnd: false,
	siteList: [],
	time: 0, // 扫描时间
	scanTypeStatus: {
		vulscan: true,
		webscan: true,
		filescan: true,
		backup: true,
		index: true,
		webhorse: true,
		deadchain: true,
		database: true,
		ftps: true,
		backend: true,
	},
	btnObj: {
		// 扫描按钮
		text: '立即扫描',
		type: 'primary',
	},
	progress: 0,
	progressColor: 'var(--el-color-primary)',
	progressConfig: {},
	statusTotal: {},
	active: {
		vulscan: false,
		webscan: false,
		filescan: false,
		backup: false,
		index: false,
		webhorse: false,
		deadchain: false,
		database: false,
		ftps: false,
		backend: false,
	},
})
// 风险等级展示
const levelData: any = reactive({
	0: {
		text: '警告',
		bg: 'rgba(252, 109, 38, 0.1)',
		color: '#fc6d26',
	},
	1: {
		text: '低危',
		bg: 'rgba(232, 213, 68, 0.1)',
		color: '#D4BB00',
	},
	2: {
		text: '中危',
		bg: 'rgba(240, 173, 78, 0.14)',
		color: '#f0ad4e',
	},
	3: {
		text: '高危',
		bg: 'rgba(239, 8, 8, 0.1)',
		color: '#EF0808',
	},
})

let useSocket: Socket | null = null
const scanSiteListDialog = ref()
const siteListDialog = ref(false) // 站点列表弹窗
const isFirstOpen = ref(false) // 是否第一次打开

const siteTableData = ref([]) // 站点列表数据
const siteTableColumn = ref([useCheckbox({ key: 'name', type: 'page' }), { label: '网站名', prop: 'name' }])

/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	useSocket = createSocket({
		route: '/ws_project',
		onMessage: onWSReceive,
	})
}

/**
 * @description 设置扫描的站点
 */
const hanelChangeScanSiteList = () => {
	// 只对企业版用户开放
	if (authType !== 'ltd') {
		return Message.error('抱歉，该功能为企业版专享功能！')
	}
	siteListDialog.value = true
	if (isFirstOpen.value) return
	nextTick(() => {
		// 选中全部站点
		// getPckageVm(scanSiteTableRef.value).toggleAllSelection();
	})
}
const handleSelectionChange = (val: any) => {
	isFirstOpen.value = true //首次进入
	scanParam.siteList = val
}
/**
 * @description 确定扫描的站点
 */
const confirmScanSite = () => {
	if (scanParam.siteList.length == 0) {
		Message.error('请选择扫描站点')
		return false
	}
	siteListDialog.value = false
	// 立即扫描
	scanDetectEvent()
}

/**
 * @description 消息接收扫描和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	const msg = JSON.parse(e.data)
	if (msg.hasOwnProperty('site_list')) {
		siteTableData.value = msg.site_list
		scanParam.siteList = msg.site_list // 默认扫描所有站点
		return
	}
	if (msg.hasOwnProperty('end')) {
		scanParam.progress = msg.bar // 进度条
		scanParam.msg = msg.info // 扫描时间
		// 当存在危险项时
		if (msg.dangerous) {
			if (!scanParam.progressConfig[msg.type]) {
				scanParam.progressConfig[msg.type] = []
			}
			scanParam.progressConfig[msg.type].push(msg)
			if (scanParam.statusTotal[msg.type]) {
				scanParam.statusTotal[msg.type]++
			} else {
				scanParam.statusTotal[msg.type] = 1
			}
			scanParam.error++ // 危险项+1
		}
		if (msg.end) {
			scanParam.isEnd = true
			scanParam.scanStatus = false
			useSocket?.close()
			getScanData()
			switchBtnStatus('end')
			return
		}
		// 是否已扫描且无风险
		if (msg.type != checkTopic.value) {
			if (checkTopic.value && !scanParam.statusTotal[checkTopic.value]) {
				scanParam.scanTypeStatus[checkTopic.value] = false
			}
			checkTopic.value = msg.type // 当前正在扫描的项目名称
		}
	}
}

/**
 * @description 每项点击事件
 */
const titleClick = (key: any) => {
	if (!scanParam.active[key]) {
		scanParam.active[key] = false
	}
	scanParam.active[key] = !scanParam.active[key]
}

/**
 * @description 扫描扫描
 */
const scanDetectEvent = async () => {
	scanParam.time = 0
	scanParam.error = 0
	// 耗时
	timer = setInterval(() => {
		scanParam.time++
	}, 1000)

	// 只对企业版用户开放
	if (authType !== 'ltd') {
		// 打开支付
		return productPaymentDialog({
			sourceId: 20,
		})
	}
	scanParam.siteList = siteTableData.value
	// 初次进入
	if (scanParam.isFirst) {
		// if (scanParam.siteList.length == 0) {
		// 	return Message.error('未扫描到网站，请选择')
		// }

		// 发送扫描站点列表
		sendScanSiteList()

		scanParam.scanStatus = true // 扫描中
		scanParam.isFirst = false // 首次扫描
		switchBtnStatus('scan') // 切换按钮状态
	} else {
		// 扫描中
		if (scanParam.scanStatus) {
			await useConfirm({
				title: '取消扫描',
				content: '确定取消扫描吗?',
			})
			// 取消扫描
			useSocket?.close()
			scanParam.isFirst = true
			switchBtnStatus('scan')
			// 重置数据
			resetData()
		} else {
			// 重置数据
			resetData()
			// 重新扫描
			sendScanSiteList()
			scanParam.scanStatus = true
			switchBtnStatus('scan')
		}
	}
}
/**
 * @description 发送扫描站点
 */
const sendScanSiteList = async () => {
	await createWebSocket()
	await useSocket?.send({
		mod_name: 'webscanning',
		def_name: 'ScanAllSite',
		site_list: scanParam.siteList.map((item: any) => item.name),
		ws_callback: '123',
	})
}

/**
 * @description 切换按钮状态
 * @param {string} type 类型
 */
const switchBtnStatus = (type: string) => {
	switch (type) {
		case 'scan':
			scanParam.title = '正在扫描'
			scanParam.isEnd = false
			scanParam.btnObj.text = '取消扫描'
			scanParam.btnObj.type = 'warning'
			break
		case 'end':
			// let msg = ''
			// if (scanParam.error == 0) {
			// 	msg = '当前安全风险未知，请立即扫描'
			// } else {
			// 	msg = `共发现<span class="text-danger">${scanParam.error}</span>项风险`
			// }
			// scanParam.title = '检测完成,' + msg
			// scanParam.msg = '扫描完成，共耗时' + scanParam.time + '秒'
			getSiteSafetyResult()
			scanParam.btnObj.text = '重新扫描'
			scanParam.btnObj.type = 'primary'
			break
	}
}
// 立即修复
const rPlanEvent = async () => {
	scanSiteRepairReq() // 发送请求统计信息
	recoveryPlanDialog()
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
 * @description 重置数据
 */
const resetData = () => {
	checkTopic.value = ''
	scanParam.scanStatus = false
	scanParam.isEnd = false
	scanParam.error = 0
	scanParam.time = 0
	scanParam.progress = 0
	scanParam.progressConfig = {
		vulscan: [],
		webscan: [],
		filescan: [],
		backup: [],
		// webshell: [],
		index: [],
		webhorse: [],
		deadchain: [],
		database: [],
		ftps: [],
		backend: [],
	}
	scanParam.statusTotal = {}
	scanParam.active = {
		// 重置active 展示
		vulscan: false,
		webscan: false,
		filescan: false,
		backup: false,
		index: false,
		webhorse: false,
		deadchain: false,
		database: false,
		ftps: false,
		backend: false,
	}
	scanParam.scanTypeStatus = {
		vulscan: true,
		webscan: true,
		filescan: true,
		backup: true,
		index: true,
		webhorse: true,
		deadchain: true,
		database: true,
		ftps: true,
		backend: true,
	}
	scanParam.btnObj.text = '立即扫描'
	scanParam.btnObj.type = 'primary'
	scanParam.title = '定期扫描网站，提升网站安全性'
	scanParam.msg = '当前安全风险未知，请立即扫描'
}
/**
 * @description 获取扫描列表
 */
const getScanSiteList = () => {
	useSocket?.send({
		mod_name: 'webscanning',
		def_name: 'GetAllSite',
		ws_callback: '',
	})
}
/**
 * @description 获取扫描结果
 */
const getSiteSafetyResult = async () => {
	try {
		const { data }: any = await getRiskCount()
		const riskNum = data.risk_count.high + data.risk_count.middle
		if (riskNum > 0) {
			scanParam.error = data.risk_count.high + data.risk_count.middle
			scanParam.title = `${data.web_count}个网站检测出，高危${data.risk_count.high > 0 ? `<span class="text-danger">${data.risk_count.high}</span>` : 0}个/中危${data.risk_count.middle}个！`
			scanParam.msg = `上次扫描时间：${data.scan_time}`
		} else {
			scanParam.title = `已完成对${data.web_count}个网站的全面检测，暂未发现风险。`
			scanParam.msg = `最后扫描时间：${data.scan_time}`
		}
		// 存在高危图标红色
		if (data.risk_count.high > 0) {
			scanParam.isEnd = true
		}
	} catch (error) {
		useHandleError(error)
	}
}
getSiteSafetyResult()

onMounted(() => {
	createWebSocket()
	getScanSiteList()
})
</script>

<style lang="css" scoped>
.progress-header {
	@apply flex items-center text-center h-[10rem] p-8px;
}

.progress-header-cot {
	&:nth-child(1),
	&:nth-child(3) {
		position: relative;
	}

	&:nth-child(3) {
		display: flex;
	}

	&:nth-child(2) {
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

	&:hover.warning-hover {
		color: var(--el-color-warning);
		background: rgba(var(--el-color-warning), 0.1);
		border-color: rgba(var(--el-color-warning), 0.2);
	}
}

.scanning-progress-title {
	@apply text-left font-bold my-16px text-large;
}

img {
	margin-right: 10px;
	vertical-align: sub;
	width: 24px;
}

.scanning-progress-cont {
	@apply text-left my-16px text-base;
}

.progress_item {
	@apply mb-20px mt-0 px-20px bg-extraLight rounded-base;
	border: 1px solid transparent;
}

.progress_item_header {
	@apply text-secondary h-[46px] leading-[46px] rounded-base cursor-pointer text-base;
	@apply flex justify-between;

	.progress_type {
		@apply flex items-center font-bold w-[59.5%] leading-[22px];
	}
}

.progress-cont-list {
	@apply max-h-[50rem] overflow-auto mt-[20px];
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
	&:hover {
		background-color: rgba(var(--el-color-warning), 0.2);
	}
}
</style>
