<!-- 违规词检测 -->
<template>
	<div>
		<bt-table-group v-if="payment.authType === 'ltd'">
			<template #header-left>
				<el-button type="primary" @click="addEventListener">添加监控</el-button>
				<el-button type="default" @click="userScanPopup = true"> 自定义扫描 </el-button>
				<el-button type="default" @click="openOwnThesaurus"> 自定义词库 </el-button>
				<el-button type="default" @click="openDetectHistory"> 检测历史 </el-button>
				<el-button type="default" @click="openRiskList">风险列表</el-button>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table :column="tableColumns" :data="tableData" v-bt-loading="tableLoading">
					<!-- <template #empty>
            <div class="flex items-center justify-center">
              您的列表为空，您可以
              <BtLink @click="addEventListener">添加一个监控</BtLink>
            </div>
          </template> -->
				</bt-table>
			</template>
			<template #popup>
				<bt-dialog title="自定义扫描" v-model="userScanPopup" :area="42" @confirm="scanUserKeyEvent" @cancel="cancelScanEvent" showFooter>
					<div class="p-[20px]">
						<el-form label-position="right" :model="scanForm" ref="scanRef">
							<el-form-item label="扫描违规词" prop="word">
								<bt-input v-model="scanForm.word" placeholder="请输入要扫描的词汇" width="24rem"></bt-input>
							</el-form-item>
						</el-form>
					</div>
				</bt-dialog>
				<bt-dialog title="扫描结果" v-model="resultPopup" :area="52">
					<div class="p-[20px]">
						<bt-table-group>
							<template #content>
								<bt-table :column="resultColumns" :data="resultData" :max-height="400" v-bt-loading="resultLoading" />
							</template>
						</bt-table-group>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-product-introduce v-else :data="productData" class=""></bt-product-introduce>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { useOperate, usePath } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'

import { delContentMonitorInfo, getSingleSiteContentMonitorList, scanning, searchFiles } from '@api/site'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage()

const { payment } = useGlobalStore()

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据

const scanForm = reactive({
	word: '', // 扫描违规词
})

const resultColumns = ref([
	usePath(),
	{
		label: '违规词',
		prop: 'key',
	},
]) // 响应式数据
const resultData = ref([]) // 响应式数据
const resultLoading = ref(false) // 响应式数据

const userScanPopup = ref(false) // 用户自定义扫描弹窗
const resultPopup = ref(false) // 扫描结果弹窗
const scanRef = ref<any>() // 扫描表单

const productData = reactive({
	title: '违规词检测-功能介绍',
	ps: '违规词检测能帮助检测网站内容中的合法及非法字段，并输出对应的检测结果，利用图表充分展示各个域名的风险历史、检测情况、敏感词排行等，并实时输出风险动态。',
	source: 111,
	desc: ['违规词内容检测', '网页内容修改检测', '输出检测报告'],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_1.png',
		},
		{
			title: '监控列表',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_2.png',
		},
		{
			title: '检测历史',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_3.png',
		},
		{
			title: '风险列表',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_4.png',
		},
		{
			title: '检测报告',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_5.png',
		},
	],
})

/**
 * @description 获取列表数据
 */
const getList = async () => {
	if (payment.value.authType !== 'ltd') return
	// 获取列表数据
	tableLoading.value = true
	try {
		const res = await getSingleSiteContentMonitorList({
			site_name: siteInfo.value.name,
		})
		tableData.value = res.data
	} catch (error) {
		console.log(error)
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description 添加监控事件
 */
const addEventListener = async () => {
	editKeywordsMonitorDialog({
		...siteInfo.value,
		id: false,
	})
}

/**
 * @description 添加监控
 */
const editKeywordsMonitorDialog = (row: any) => {
	useDialog({
		title: `${row.id ? '编辑' : '添加'}监控${row.id ? `【${row.name}】` : ''}`,
		area: 68,
		showFooter: true,
		compData: {
			...row,
			refreshEvent: getList,
			isSite: true,
		},
		component: () => import('./add-monitor.vue'),
	})
}

/**
 * @description 打开自定义词库
 */
const openOwnThesaurus = () => {
	useDialog({
		isAsync: true,
		title: '自定义词库',
		area: [44, 39],
		component: () => import('./own-thesaurus.vue'),
	})
}

/**
 * @description 打开检测历史
 */
const openDetectHistory = () => {
	useDialog({
		isAsync: true,
		title: '检测历史',
		area: 80,
		component: () => import('./detect-history.vue'),
		compData: { isPopup: true, ...siteInfo.value },
	})
}

/**
 * @description 打开风险列表
 */
const openRiskList = () => {
	useDialog({
		isAsync: true,
		title: '风险列表',
		area: 80,
		component: () => import('./risk-list.vue'),
		compData: { isPopup: true },
	})
}

/**
 * @description 删除监控
 */
const delEvent = async (row: any) => {
	await useConfirm({
		title: `删除违规词检测`,
		content: '删除后无法继续监控该网站，是否继续？',
	})
	useDataHandle({
		loading: '正在删除，请稍后...',
		request: delContentMonitorInfo({ data: JSON.stringify({ id: row.id }) }),
		message: true,
		success: (res: any) => {
			if (res.status) getList()
		},
	})
}

const cancelScanEvent = () => {
	scanRef.value?.resetFields()
	userScanPopup.value = false
}

/**
 * @description 扫描用户自定义违规词
 */
const scanUserKeyEvent = async () => {
	let loading = Message.load('正在扫描，请稍后...')
	try {
		const res = await searchFiles({
			search: scanForm.word,
			path: siteInfo.value.path,
		})
		resultData.value = res.data.result.map((item: any) => {
			return {
				path: item.name,
				key: scanForm.word,
			}
		})
		cancelScanEvent()
		resultPopup.value = true
	} catch (error) {
		console.log(error)
	} finally {
		userScanPopup.value = false
		loading.close()
	}
}

/**
 * @description 立即检测
 * @param {any} data 行数据
 */
const getScanEvent = async (data?: any) => {
	try {
		const loadings = Message.load('正在检测，请稍后...')
		const rdata: any = await scanning({
			data: JSON.stringify({ id: data.id }),
		})
		const rowData: any = {
			name: data.name,
			id: data.id,
			path_info: rdata.data.path_info,
		}
		loadings.close()
		useDialog({
			title: `检测日志`,
			area: [64, 50],
			btn: ['停止检测'],
			component: () => import('./scan-details.vue'),
			compData: rowData,
			showFooter: true,
		})
	} catch (error) {
		console.log(error)
	}
}

const tableColumns = ref<any>([
	{
		label: '监控名称',
		prop: 'name',
		showOverflowTooltip: true,
	},
	{
		label: '网站/URL',
		prop: 'url',
	},
	{
		label: '状态',
		prop: 'content',
		render: (row: any) => {
			if (row.crontab_status === 1) {
				return '正常'
			} else {
				// return (
				// 	<BtLink type="warning" title="点击设置">
				// 		未设置
				// 	</BtLink>
				// )
			}
		},
	},
	{
		label: '发送告警',
		prop: 'send_msg',
		render: (row: any) => (row.send_msg === 1 ? <span class="text-primary">已开启</span> : '未开启'),
	},
	{
		label: '检测频率',
		prop: 'crontab_info.cycle',
		showOverflowTooltip: true,
	},
	useOperate([
		{ onClick: getScanEvent, title: '检测' },
		{
			onClick: (row: any) => {
				// 添加监控
				editKeywordsMonitorDialog(row)
			},
			title: '编辑',
		},
		{ onClick: delEvent, title: '删除' },
	]), // 操作
])

onMounted(() => {
	// 页面加载完成后执行
	getList()
})
</script>
