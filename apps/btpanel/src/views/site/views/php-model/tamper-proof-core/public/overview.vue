<template>
	<div v-bt-loading="loading" v-bt-loading:title="'正在获取站点防篡改信息，请稍侯'">
		<template v-if="compData.type === 'tamper_proof_refactored'">
			<div class="flex justify-between mb-[1.6rem]">
				<div class="flex items-center">
					<span class="mr-1rem">防篡改状态</span>
					<el-select class="!w-[16rem]" v-model="tamperData.open" @change="handleStateEvent">
						<el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
					<el-popover placement="top-start" width="200" popper-class="green-tips-popover" trigger="hover" content="">
						<ul class="list-disc pl-1.6rem">
							<li>拦截模式：拦截，并记录</li>
							<li>观察模式：不拦截，只记录</li>
						</ul>
						<template #reference>
							<i class="svgtofont-el-question-filled text-warning ml-[12px] text-[16px]"></i>
						</template>
					</el-popover>
				</div>
				<DayCut :days="dayType" @cut-day="cutDay"></DayCut>
			</div>
		</template>
		<template v-else>
			<el-alert v-if="globalData?.temp_close_time" type="warning" class="!mb-[1.6rem] !p-[1.2rem]" :closable="false" show-icon>
				<template #title>
					<div class="flex items-center">
						当前已临时关闭全局防篡改，将在
						<span class="bt-danger">
							{{ formatTime(globalData.temp_close_time) }}
						</span>
						恢复防护
						<bt-link class="bt-link ml-1rem" @click="tempClose(false)"> 点击立即恢复 </bt-link>
					</div>
				</template>
			</el-alert>
			<div v-else class="flex items-center justify-center mb-[1.6rem]">
				<div class="flex items-center flex-1 mr-1rem">
					<span class="mr-1rem">防篡改开关</span>
					<el-switch v-model="tamperData.open" :width="36" @change="onChangeTamperEvent"></el-switch>
					<el-divider direction="vertical" class="!h-2rem !mx-1.6rem"></el-divider>
					<span class="mr-1rem">告警设置</span>
					<el-switch class="mr-[1.6rem]" v-model="isAlarm" :width="36" @change="onChangeAlarmEvent"></el-switch>
					<div v-if="!globalData?.glabal_status?.settings_status" class="flex-1">
						<el-alert type="warning" class="h-3.2rem" :closable="false" show-icon>
							<template #title>
								<div class="flex items-center">
									未启用企业级防篡改，请先开启
									<bt-link class="underline" type="danger" @click="glabalStatusEvent"> 全局开关 </bt-link>
								</div>
							</template>
						</el-alert>
					</div>
				</div>
				<el-button type="primary" @click="openTempPopup"> 全局临时开关 </el-button>
			</div>
		</template>

		<div class="current-box">
			<div class="current-box-item">
				<div>总拦截次数</div>
				<div :title="tamperData?.totalTitle">{{ tamperData.totalNum }}</div>
			</div>
			<div class="current-box-item">
				<div>当日拦截次数</div>
				<div :title="tamperData?.theTitle">{{ tamperData.theNum }}</div>
			</div>
		</div>

		<template v-if="compData.type === 'tamper_core'">
			<bt-tabs ref="tamperRef" type="" class="mt-1rem" v-model="tabActive" :options="tabComponent"></bt-tabs>

			<div v-if="tamperData?.path" class="flex justify-between">
				<el-button type="default" @click="openClearLog">清理日志</el-button>
				<div class="flex items-center">
					<DayCut :days="dayType" @cut-day="cutDay"></DayCut>
					<bt-table-refresh @refresh="getCoreLogs" class="ml-1rem"></bt-table-refresh>
				</div>
			</div>
		</template>
		<bt-table-group>
			<template #header-left></template>
			<template #header-right></template>
			<template #content>
				<bt-table v-if="compData.type == 'tamper_core'" :column="tableCoreColumns" :maxHeight="320" :data="tableData" v-bt-loading="tableLoading" />
				<bt-table v-else :column="tableColumns" :maxHeight="400" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left></template>
			<template #footer-right>
				<bt-table-page class="mb-1rem" v-if="compData.type === 'tamper_core'" v-model:page="tableParams.p" v-model:row="tableParams.rows" :total="tableParams.total" :pager-count="4" @change="getCoreLogs()"></bt-table-page>
			</template>
		</bt-table-group>

		<bt-help :options="helpList" list-style="disc" class="ml-2rem"></bt-help>

		<bt-dialog title="临时关闭防篡改" v-model="tempPopup" :area="58" @confirm="tempClose(true)" show-footer>
			<el-form class="p-[2rem]" ref="tempFormRef" :model="tempForm" :rules="tempFormRules">
				<el-form-item label="临时关闭" prop="expire">
					<div class="flex items-center">
						<bt-input type="number" v-model="tempForm.expire" width="14rem" class="!w-14rem" placeholder="请输入时间"></bt-input>
						<el-select class="ml-1rem !w-[10rem]" v-model="tempForm.unit">
							<el-option label="分钟" value="minute"></el-option>
							<el-option label="小时" value="hour"></el-option>
							<el-option label="天" value="day"></el-option>
						</el-select>
						<span class="text-secondary ml-[4px]">，到期后自动恢复防护</span>
					</div>
				</el-form-item>
			</el-form>
		</bt-dialog>

		<bt-dialog title="设置告警任务" v-model="alarmPopup" :area="54" @confirm="alarmConfirmEvent" @cancel="alarmCancelEvent" show-footer>
			<el-form class="p-[2rem]" ref="alarmFormRef" :model="alarmForm" :rules="alarmFormRules">
				<el-form-item label="保护列表">
					<bt-input v-model="alarmForm.name" disabled width="35rem"></bt-input>
				</el-form-item>
				<el-form-item label="触发条件">
					<div class="flex items-center">
						<el-form-item prop="cycle">
							<bt-input v-model="alarmForm.cycle" type="number" width="12rem"></bt-input>
						</el-form-item>
						<span class="text-secondary mx-[.6rem]">分钟内，篡改</span>
						<el-form-item prop="count">
							<bt-input v-model="alarmForm.count" type="number" width="12rem"></bt-input>
						</el-form-item>
						<span class="text-secondary mx-[.6rem]">次</span>
					</div>
				</el-form-item>
				<el-form-item label="间隔时间" prop="interval">
					<div class="flex items-center">
						<bt-input v-model="alarmForm.interval" type="number" width="12rem" class="!w-12rem"></bt-input>
						<span class="text-secondary mx-[.6rem]">秒后再次监控触发条件</span>
					</div>
				</el-form-item>
				<el-form-item label="推送次数" prop="push_count">
					<div class="flex items-center">
						<bt-input v-model="alarmForm.push_count" type="number" width="12rem" class="!w-12rem"></bt-input>
						<span class="text-secondary mx-[.6rem]"> 次后停止推送，次日再次监控 </span>
					</div>
				</el-form-item>
				<el-form-item label="告警方式" prop="module">
					<bt-alarm-select v-model="alarmForm.module" class="!w-35rem" :limit="alarmForm.limit" />
				</el-form-item>
				<ul class="mt-8 leading-10 list-disc pl-2rem">
					<li>
						点击配置后状态未更新，尝试点击【
						<bt-link class="!inline-block" @click="refresh">手动刷新</bt-link>
						】
					</li>
				</ul>
			</el-form>
		</bt-dialog>
		<bt-dialog title="清理日志" v-model="clearPopup" :area="38" @confirm="clearConfirm" show-footer>
			<el-form class="p-[2rem]" ref="clearFormRef" :model="clearForm" :rules="clearFormRules">
				<el-form-item label="需要清理的日期" prop="date">
					<el-date-picker v-model="clearForm.date" type="date" class="date" placeholder="选择日期" value-format="YYYY-MM-DD" :disabled-date="disabledDate"></el-date-picker>
				</el-form-item>
				<bt-help class="pl-2rem" :options="[{ content: '当前仅支持按日期清理日志' }]"></bt-help>
			</el-form>
		</bt-dialog>
		<bt-dialog :title="`溯源日志[${logParams.name}]`" v-model="logParams.logDialog" :area="[60]">
			<div class="flex-wrap">
				<bt-log class="h-[40rem] !rounded-none" :content="logParams.logContent" />
			</div>
		</bt-dialog>
		<bt-dialog title="清理日志" v-model="addWhiteListPopup" :area="56" @confirm="addWhiteListConfirm" show-footer>
			<el-form class="p-[2rem]" ref="addWhiteListFormRef" :model="addWhiteListForm" :rules="addWhiteListFormRules" :disabled="addWhiteListFormDisabled">
				<el-form-item label="目录/文件" prop="path">
					<bt-input v-model="addWhiteListForm.path" width="35rem" placeholder="请输入目录/文件"></bt-input>
				</el-form-item>
				<el-form-item>
					<bt-help :options="clearHelpList" class="pl-1rem leading-2rem" list-style="disc"> </bt-help>
				</el-form-item>
			</el-form>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useDataHandle, useDataPage } from '@/hooks/tools'
import { useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { formatTime, getPageTotal } from '@/utils'
import { tamperConfigType } from '@/views/site/useController'
import { useSiteStore } from '@/views/site/useStore'
import {
	addExcloud,
	delLogs,
	delTempClose,
	getGlabalTotal,
	getProofIndex,
	getProofLog,
	getPushList,
	getTamperCoreLogs,
	getTamperPaths,
	getTamperRuleByPath,
	modifyGlobalConfig,
	modifyPathConfig,
	multiCreate,
	setPushConfig,
	setPushStatus,
	setSiteStatusProof,
	setTempClose,
	getTamperAlarm,
	setTamperAlarm,
} from '@api/site'
import DayCut from '@site/views/php-model/tamper-proof-core/public/day-cut.vue'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage()

const { getSenderAlarmListInfo } = useGlobalStore()

const { siteInfo } = useSiteStore()

const isDestroyed = ref<boolean>(false) // 组件是否销毁

const currentStamp = useTimestamp()
const loading = ref<boolean>(false) // 页面加载loading
const dayType = ref(1) // 默认当天
const dayStr = ref(formatTime(new Date(), 'yyyy-MM-dd')) // 默认当天
const tamperData = ref<any>({}) // 站点 防篡改全局数据
const tableParams = reactive<any>({ p: 1, rows: 10, total: 0 }) // 表格分页参数

const tableLoading = ref<boolean>(false) // 防篡改日志表格loading
const tableData = ref<any>([]) // 防篡改日志表格数据
const sitesList = ref<any>([]) // 站点列表

const logParams = ref<any>({
	logContent: '', // 溯源日志内容
	logDialog: false, // 溯源日志弹窗
	name: '', // 溯源日志名称
}) // 溯源日志参数

const clearHelpList = [
	{
		content: '如果需要频繁修改当前文件，确认提交即可。',
	},
	{
		content: '如果需要频繁修改该文件同级文件内容，请删除路径尾部文件名，确认提交即可。',
	},
	{
		content: (
			<>
				若大量临时缓存文件被拦截，可参考：
				<code>/www/wwwroot/bt.cn/cache/bt_1234.php</code>
				，直接添加
				<code>/www/wwwroot/bt.cn/cache/bt*.php</code>
				即可
			</>
		),
	},
	{
		content: '注意：以上操作会解除对文件或目录的限制，请确保你信任这些内容，以防止安全问题。',
	},
]

const addWhiteListPopup = ref<boolean>(false) // 添加白名单弹窗
const addWhiteListFormRef = ref<any>() // 添加白名单表单
const addWhiteListFormDisabled = ref<boolean>(false) // 添加白名单表单禁用
const addWhiteListForm = reactive<any>({
	path: '',
}) // 添加白名单表单
const addWhiteListFormRules = reactive<any>({
	path: [{ required: true, message: '请输入目录/文件', trigger: 'blur' }],
})

// 企业防篡改数据
const kernelModuleStatus = inject('kernelModuleStatus', shallowRef(true)) // 企业防篡改数据
const globalData = ref<any>({}) // 企业防篡改全局数据

const isAlarm = ref<boolean>(false) // 是否告警
const tempPopup = ref<boolean>(false) // 临时开关弹窗
const tempFormRef = ref<any>() // 临时开关表单
const tempForm = reactive<any>({
	// 临时开关表单数据
	expire: 30,
	unit: 'minute',
})

const alarmFormRef = ref<any>() // 告警表单
const alarmPopup = ref<boolean>(false) // 告警弹窗
const alarmForm = reactive<any>({
	// 告警表单数据
	name: siteInfo.value.path + '/' + siteInfo.value.name,
	cycle: 30,
	count: 3,
	interval: 600,
	push_count: 1,
	module: [],
	limit: ['sms'],
})

const helpList = computed(() => {
	return props.compData.type === 'tamper_proof_refactored'
		? [
				{
					content: '如果开启防篡改后您的网站出现异常，请尝试排除网站日志、缓存、临时文件、上传等目录后重试，或直接关闭异常网站防篡改功能',
				},
		  ]
		: [
				{
					content: '开启防篡改后，部分项目【无法更新，文件无法上传，无法操作等】，需要关闭防篡改或添加白名单',
				},
		  ]
})

const alarmFormRules = reactive<any>({
	cycle: [
		{ required: true, message: '请输入时间', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('必须为大于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	count: [
		{ required: true, message: '请输入次数', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('必须为大于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	push_count: [
		{ required: true, message: '请输入次数', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('必须为大于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	interval: [
		{ required: true, message: '请输入时间', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('必须为大于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	module: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (alarmForm.module.length === 0) {
					callback(new Error('请选择告警方式'))
				} else {
					callback()
				}
			},
			trigger: ['change'],
		},
	],
})

const tabActive = ref<string>('log') // tab激活项
const tabComponent = ref<any>([
	{
		label: '日志',
		name: 'log',
		lazy: true,
		render: () => {},
	},
])

const tempFormRules = reactive<any>({
	// 临时开关表单验证规则
	expire: [
		{ required: true, message: '请输入时间', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				// 大于0的整数
				if (!/^[1-9]\d*$/.test(value)) {
					callback(new Error('时间必须为大于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

const clearFormRef = ref<any>() // 清理日志表单
const clearPopup = ref<boolean>(false) // 清理日志弹窗
const clearForm = reactive<any>({
	// 清理日志表单
	date: '',
})

const clearFormRules = reactive<any>({
	// 清理日志表单验证规则
	date: [{ required: true, message: '请选择日期', trigger: 'blur' }],
})

const disabledDate = (time: any) => {
	return time.getTime() > Date.now()
}

const stateOptions = [
	{ label: '关闭防护', value: 0 },
	{ label: '拦截模式', value: 1 },
	{ label: '观察模式', value: 2 },
]

const logType = reactive<any>({
	create: '创建',
	delete: '删除',
	modify: '修改',
	move: '移动',
	rename: '重命名',
	chmod: '权限变更',
})

const modeType = reactive<any>({
	0: '关闭',
	1: '拦截',
	2: '观察',
})

const tableColumns = ref([
	{
		label: '时间',
		prop: 'time',
		width: 150,
		render: (row: any) => {
			return formatTime(row[0])
		},
	},
	{
		label: '模式',
		prop: 'mode',
		width: 60,
		render: (row: any) => {
			return <span class={`text-[${row[1] === 1 ? '#20a53a' : '#f0ad4e'}]`}>{modeType[row[1]]}</span>
		},
	},
	{
		label: '类型',
		prop: 'type',
		width: 70,
		render: (row: any) => {
			return logType[row[2]]
		},
	},
	{
		label: '文件',
		prop: 'type',
		showOverflowTooltip: true,
		render: (row: any) => {
			return <div class="truncate">{row[3]}</div>
		},
	},
	{
		label: '溯源日志',
		prop: 'ip',
		width: 78,
		render: (row: any) => {
			return (
				<span
					class="bt-link cursor-pointer"
					onClick={() => {
						logParams.value.logContent = row[4] && row[4].length ? row[4].join('\n') : '当前日志为空'
						logParams.value.name = row[3]
						logParams.value.logDialog = true
					}}>
					溯源日志
				</span>
			)
		},
	},
	{
		label: '状态',
		prop: 'action',
		width: 75,
		render: (row: any) => {
			return '防护成功'
		},
	},
	{
		label: '操作',
		align: 'right',
		width: 90,
		render: (row: any) => {
			return (
				<bt-link
					onClick={() => {
						addWhiteListForm.path = row[3]
						addWhiteListPopup.value = true
					}}>
					加入白名单
				</bt-link>
			)
		},
	},
])

const tableCoreColumns = ref([
	{ label: '时间', prop: 'date', width: 150 },
	{ label: '目录', prop: 'content' },
	{
		label: '类型',
		prop: 'type',
		width: 100,
		render: (row: any) => {
			return <span>{tamperConfigType[row.type]}</span>
		},
	},
	{
		label: '用户',
		prop: 'user',
		width: 90,
	},
	{
		label: '进程',
		prop: 'process',
		width: 90,
	},
])

/**
 * @description 添加白名单
 */
const addWhiteListConfirm = async () => {
	await addWhiteListFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: addWhiteListFormDisabled,
		request: addExcloud({
			siteName: siteInfo.value.name,
			excludePath: addWhiteListForm.path,
		}),
		message: true,
	})
	if (res.status) addWhiteListPopup.value = false
}

/**
 * @description 获取网站防篡改数据
 * @param day yyyy-MM-dd
 */
const getTamperProof = async (day: string) => {
	try {
		loading.value = true
		const { data } = await getProofIndex({ day: day })
		tamperData.value = data.sites?.find((item: any) => item.siteName == siteInfo.value.name)
		tamperData.value['totalNum'] = tamperData.value.total.site.total
		tamperData.value['theNum'] = tamperData.value.total.day.total
		tamperData.value.open = tamperData.value.open

		// 存储站点列表
		sitesList.value = data.sites?.map((item: any) => {
			return {
				siteName: item.siteName,
				path: item.path,
			}
		})
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 获取防篡改日志 表格
 */
const getTamperProofLog = async (day: string) => {
	useDataHandle({
		loading: tableLoading,
		request: getProofLog({ day: day, siteName: siteInfo.value.name }),
		data: {
			logs: [Array, tableData],
		},
	})
}

/**
 * @description 切换防护状态 - 网站防篡改 - 重构版
 * @param val 类型 0: 关闭防护 1: 拦截模式 2: 观察模式
 */
const handleStateEvent = async (val: number) => {
	tamperData.value.open = val
	try {
		const res = await setSiteStatusProof({
			siteName: siteInfo.value.name,
			status: val,
		})
		if (res.data?.length) {
			Message.request(res.data[0])
			if (res.status) getTamperProof(dayStr.value)
		} else {
			Message.request(res)
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 打开全局临时开关弹窗
 */
const openTempPopup = () => {
	tempForm.expire = 30
	tempForm.unit = 'minute'
	tempPopup.value = true
}

/**
 * @description 切换防护状态 - 企业防篡改 - 重构版
 * @param val 类型 0 关闭防护 1 开启防护
 */
const onChangeTamperEvent = async (val: boolean) => {
	try {
		await useConfirm({
			title: `${val ? '开启' : '关闭'}保护目录配置【${siteInfo.value.name}】`,
			content: val ? '启用该保护目录配置后，目录将受到保护，是否继续操作？' : '关闭该保护目录配置后，目录将失去保护，是否继续操作？',
			icon: 'warning',
		})
		// 当站点目录不存在企业防篡改配置时，添加站点目录防篡改
		if (tamperData.value?.path) {
			const res: AnyObject = await useDataHandle({
				loading: '正在设置防篡改，请稍侯...',
				request: modifyPathConfig({
					path_id: tamperData.value.pid,
					key: 'status',
					value: val ? 1 : 0,
				}),
				message: true,
			})
			if (res.status) getTamperRulePath()
		} else {
			const { data } = await multiCreate({
				paths: JSON.stringify([
					{
						path: siteInfo.value.path + '/',
						ps: siteInfo.value.name,
					},
				]),
			})
			if (data.length && data[0].status) {
				Message.success('开启防篡改成功')
				getTamperRulePath()
			} else {
				Message.error('开启防篡改失败')
			}
		}
	} catch (error) {
		if (error === 'cancel') {
			nextTick(() => {
				// 取消操作
				tamperData.value = {
					...tamperData.value,
					open: !val,
				}
			})
		}
	}
}

/**
 * @description 设置告警任务
 */
const onChangeAlarmEvent = async (val: boolean) => {
	if (!tamperData.value?.path) {
		Message.warn('请先开启防篡改开关再进行告警设置')
		nextTick(() => {
			isAlarm.value = false
		})
		return
	}
	if (val) {
		if (!props.compData.isNewAlarmVersion) {
			Message.warn('当前企业级防篡改插件版本小于5.6，请升级插件')
			nextTick(() => {
				isAlarm.value = false
			})
			return
		}
		alarmPopup.value = true
	} else {
		try {
			await useConfirm({
				title: `关闭保护目录告警【${siteInfo.value.name}】`,
				content: '关闭该保护目录告警后，该配置将无法发送告警，是否继续操作？',
				icon: 'warning',
			})
			const res: AnyObject = await useDataHandle({
				loading: '正在关闭告警任务，请稍侯...',
				request: props.compData.isNewAlarmVersion
					? setTamperAlarm(
							{
								project: tamperData.value.pid,
							},
							'delete'
					  )
					: setPushStatus({
							id: tamperData.value.pid,
							name: 'tamper_push',
							status: 0,
					  }),
				message: true,
			})
			if (res.status) getTamperRulePath()
		} catch (error) {
			isAlarm.value = true
		}
	}
}

// 手动刷新
const refresh = async () => {
	await getSenderAlarmListInfo()
	Message.success('刷新成功')
}

const alarmCancelEvent = () => {
	alarmPopup.value = false
	isAlarm.value = false
}

/**
 * @description 开启告警
 */
const alarmConfirmEvent = async () => {
	await alarmFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: '正在设置告警任务，请稍侯...',
		request: props.compData.isNewAlarmVersion
			? setTamperAlarm(
					{
						project: tamperData.value.pid,
						cycle: Number(alarmForm.cycle),
						count: Number(alarmForm.count),
						interval: Number(alarmForm.interval),
						day_num: Number(alarmForm.push_count),
						status: 1,
						sender: alarmForm.module.join(','),
					},
					'add'
			  )
			: setPushConfig({
					id: tamperData.value.pid,
					name: 'tamper_push',
					data: JSON.stringify({
						cycle: Number(alarmForm.cycle),
						count: Number(alarmForm.count),
						interval: Number(alarmForm.interval),
						push_count: Number(alarmForm.push_count),
						module: alarmForm.module.join(','),
						type: '',
						title: `【${siteInfo.value.path}】篡改告警`,
					}),
			  }),
		message: true,
	})
	if (res.status) {
		alarmPopup.value = false
		getAlarm()
	}
}

/**
 * @description 切换日期
 * @param day 类型 1: 当天 0: 昨天 2: 自定义
 * @param str yyyy-MM-dd
 */
const cutDay = async (day: number, str: string) => {
	dayType.value = day
	dayStr.value = str
	if (props.compData.type === 'tamper_proof_refactored') {
		// 网站防篡改 - 重构版
		await getTamperProof(str)
		await getTamperProofLog(str)
	} else {
		// 企业防篡改 - 重构版
		tableParams.p = 1
		await getCoreLogs(str)
	}
}

/**
 * @description 获取企业防篡改全局配置
 */
const getTamperGlabal = async () => {
	try {
		loading.value = true
		const { data } = await getGlabalTotal()
		globalData.value = data
		kernelModuleStatus.value = data.glabal_status.kernel_module_status // 为父组件提供企业防篡改 内核状态
	} catch (error) {
		useHandleError(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 获取当前站点企业防篡改规则
 */
const getTamperRulePath = async () => {
	try {
		const { data } = await getTamperRuleByPath({
			path: siteInfo.value.path,
		})
		tamperData.value = data
		if (data.hasOwnProperty('status')) {
			tamperData.value.open = data.status ? true : false
			let allNum = 0,
				theNum = 0,
				allTitle = [],
				theTitle = []
			for (let key in data.total.all) {
				allNum += data.total.all[key]
				allTitle.push(`${tamperConfigType[key]}: ${data.total.all[key]}`)
			}
			for (let key in data.total.today) {
				theNum += data.total.today[key]
				theTitle.push(`${tamperConfigType[key]}: ${data.total.today[key]}`)
			}
			tamperData.value.totalNum = allNum
			tamperData.value.totalTitle = allTitle.join('\n')
			tamperData.value.theNum = theNum
			tamperData.value.theTitle = theTitle.join('\n')
			getCoreLogs(dayStr.value)
		} else {
			tamperData.value.open = false
			tamperData.value.totalNum = '--'
			tamperData.value.theNum = '--'
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 立即恢复防护 - 企业防篡改
 */
const tempClose = async (status: boolean = false) => {
	if (status) await tempFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: '正在设置临时关闭防护，请稍侯...',
		request: !status ? delTempClose() : setTempClose(tempForm),
		message: true,
	})
	if (res.status) {
		tempPopup.value = false
		getTamperGlabal()
		getTamperRulePath()
	}
}

/**
 * @description 全局开关事件
 */
const glabalStatusEvent = async () => {
	await useConfirm({
		title: '开启全局开关',
		content: '开启后，站点目录对应的防篡改配置将生效，是否继续操作？',
		icon: 'warning',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在开启全局开关，请稍侯...',
		request: modifyGlobalConfig({ value: 1, key: 'status' }),
		message: true,
	})
	if (res.status) getTamperGlabal()
}

/**
 * @description 存在规则时 获取当前站点 日志信息
 */
const getCoreLogs = async (day?: string) => {
	try {
		const res: any = await getTamperCoreLogs({
			path_id: tamperData.value.pid,
			date: day || dayStr.value,
			rows: tableParams.rows,
			p: tableParams.p,
		})
		console.log(res, 6666)
		if (Array.isArray(res.data)) {
			tableData.value = res.data
			tableParams.total = res.hasOwnProperty('page') ? getPageTotal(res.page) : res.data.length
		} else {
			if (Array.isArray(res?.data?.data)) {
				tableData.value = res.data.data
				tableParams.total = res.data.hasOwnProperty('page') ? getPageTotal(res.data.page) : res.data?.total || res.data.data.length
			} else {
				tableData.value = []
				tableParams.total = 0
			}
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取告警信息
 */
const getAlarm = async () => {
	try {
		if (props.compData.isNewAlarmVersion) {
			// 新版企业防篡改 版本大于等于5.6
			const { data: alarmData } = await getTamperAlarm()
			isAlarm.value = alarmData.task_list.find((item: any) => item.project === tamperData.value.pid)?.status
		} else {
			// 旧版企业防篡改
			const { data } = await getPushList()
			var obj = (data.tamper_push && data.tamper_push[tamperData.value.pid]) || {}
			isAlarm.value = obj?.status ? true : false
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 打开清理日志
 */
const openClearLog = () => {
	clearForm.date = ''
	clearPopup.value = true
}

/**
 * @description 清理日志
 */
const clearConfirm = async () => {
	try {
		await clearFormRef.value.validate()
		const res = await delLogs({
			path_id: tamperData.value.pid,
			date: clearForm.date,
		})
		Message.request(res)
		if (res.status) {
			clearPopup.value = false
			getCoreLogs()
		}
	} catch (error) {}
}

// 当globalData.value.temp_close_time 不为0且为当天时间时, 监听当前时间是否大于temp_close_time
watch([() => globalData.value.temp_close_time, () => currentStamp.value], ([tempCloseTime, currentStampVal]) => {
	if (!isDestroyed.value && tempCloseTime !== 0 && tempCloseTime * 1000 + 3000 < currentStampVal) {
		globalData.value.temp_close_time = 0
		getTamperGlabal()
		getTamperRulePath()
	}
})

const init = async () => {
	if (!props.compData.maskLayer) return

	dayStr.value = formatTime(new Date(), 'yyyy-MM-dd')
	if (props.compData.type === 'tamper_proof_refactored') {
		// 网站防篡改 - 重构版
		await getTamperProof(dayStr.value)
		await getTamperProofLog(dayStr.value)
	} else {
		// 企业防篡改 - 重构版
		// 小于3.2版本不请求数据
		if (!props.compData.isVersion) return
		await getTamperGlabal()
		await getTamperRulePath()
		if (tamperData.value?.path) await getAlarm()
	}
}

// 销毁
onBeforeUnmount(() => {
	isDestroyed.value = true
})

onMounted(init)

defineExpose({
	sitesList,
	init,
})
</script>

<style lang="css" scoped>
.current-box {
	@apply flex justify-between rounded-small bg-lighter py-1rem px-0;
	border: 1px solid var(--el-color-border-dark);
}

.current-box-item {
	@apply w-[50%] text-center;
}

.current-box-item:first-child {
	@apply border-r-[1px] border-dark;
}

.current-box-item div:last-child {
	@apply text-base mt-[4px] leading-2rem;
}

.date :deep(.el-input__inner) {
	@apply pl-[2.6rem];
}
</style>
