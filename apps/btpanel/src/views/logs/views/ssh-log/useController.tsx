import { Message, useConfirm, useDialog, useDataHandle } from '@/hooks/tools'
import { addSSHCron, createSshIpRules, getSshLoginList, removeSSHCron, getSSHInfo, setSSHBannedData, clearLoginLog } from '@/api/firewall'
import { ResponseResult } from '@/hooks/tools/axios/types'
import { SSHLogItem } from '@/types/log'
import { LOG_STORE } from '../../useStore'
import { LOG_SSH_STORE, useSSHLogStore } from './useStore'
import { isNumber } from '@/utils'
import { getLines } from '@/api/site'

type CallBackProps = (res?: ResponseResult) => void

const { changeIpRules } = LOG_SSH_STORE()
const { isRefreshList, banCronJob } = useSSHLogStore()

const logsStore = LOG_STORE()
const { outDataForm, configData } = storeToRefs(logsStore)

export const actionType = ref('ALL')
export const historyType = ref('7')

export const actionTypeOptions = [
	{ label: '全部', value: 'ALL' },
	{ label: '登录成功', value: 'Accepted' },
	{ label: '登录失败', value: 'Failed' },
]

export const historyTypeOptions = [
	{ label: '全部', value: 'ALL' },
	{ label: '近7天', value: '7' },
]

export const productData = {
	title: 'SSH登录日志-功能介绍',
	ps: '保障SSH服务器的安全性，发现和应对安全威胁。',
	source: 130,
	desc: ['SSH安全审计', 'SSH登录溯源', 'SSH暴破记录', 'SSH入侵分析'],
	tabImgs: [
		{
			title: 'SSH登录日志',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/ssh_login_log.png',
		},
	],
} // 产品介绍

/**
 * @description 处理IP
 * @param row
 */
export const onHandleIp = async (row: SSHLogItem, callback?: CallBackProps) => {
	const deny = row.deny_status
	await useConfirm({
		title: '提示',
		content: deny ? '解封该IP后，将恢复此IP对服务器的访问，是否继续操作？' : '封禁该IP后，将不再允许此IP访问服务器，是否继续操作？',
		icon: 'warning-filled',
	})

	let params: { [key: string]: string } = { address: row.address }
	if (!deny) {
		params = {
			address: row.address,
			types: 'drop',
			brief: 'SSH登录日志页面点击IP手动封禁',
			domain: '',
			choose: 'address',
		}
	}
	params = { data: JSON.stringify(params) }

	const res: any = await changeIpRules(params, deny)
	Message.request(res)
	callback && callback(res)
	// 刷新方法
	isRefreshList.value = true
	return res
}
/**
 * @description: 清理登录日志
 */
export const clearCache = async () => {
	await useConfirm({
		icon: 'question-filled',
		title: '清理登录日志',
		content: '即将清理除本周外的所有登录日志，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在清理登录日志，请稍后...',
		request: clearLoginLog(),
		message: true,
	})
	// 刷新方法
	isRefreshList.value = true
}

/**
 * @description 打开导出日志弹窗
 */
export const openOutLogView = () => {
	outDataForm.value.type = logsStore.getType('ssh')
	configData.value = { type: 'ssh' }
	useDialog({
		title: '导出日志',
		area: 44,
		component: () => import('@logs/public/out-log/index.vue'),
		// onConfirm: outLogs,
		showFooter: true,
	})
}
export const blastFormRef = ref() // 一键封禁爆破IP表单
export const bannedDialog = ref(false) // 一键封禁爆破IP弹窗
export const antiBannedForm = ref({
	hour: 0, // 周期
	fail_count: 0, // 失败次数
	ban_hour: 0, // 封禁时间
}) // 一键封禁爆破IP表单数据

export const bannedStatus = ref(banCronJob.value) // 定时封禁开关状态

export const getSSHInfoData = async () => {
	const res: any = await useDataHandle({
		loading: '正在获取SSH信息，请稍后...',
		request: getSSHInfo(),
	})
	bannedStatus.value = res.data.ban_cron_job
	banCronJob.value = res.data.cron_hour
}

// 限制只能输入正整数
const validateNumber = (rule: any, value: any, callback: any) => {
	if (!/^[1-9]\d*$/.test(value) && value !== '') {
		callback(new Error('请输入正整数'))
	} else {
		callback()
	}
}

export const rules = {
	hour: [
		{ required: true, message: '请输入周期' },
		{ validator: validateNumber, trigger: 'blur' },
	],
	fail_count: [
		{ required: true, message: '请输入失败次数' },
		{ validator: validateNumber, trigger: 'blur' },
	],
	ban_hour: [
		{ required: true, message: '请输入封禁时间' },
		{ validator: validateNumber, trigger: 'blur' },
	],
}
export const allBanned = ref(true) // 一键封禁爆破IP弹窗标题

export const taskId = ref() // 定时任务ID

export const showLogDialog = ref(false) // 初始化防火墙弹窗
export const logContent = ref('') // 初始化防火墙日志内容
export const timer = ref<any>(null)

/**
 * @description 定时封禁开关
 * @param {boolean} val 开关状态
 */
export const onChangeBanJob = async (val: boolean) => {
	if (val) {
		openBannedDialog(false)
	} else {
		bannedStatus.value = !val
		await useConfirm({
			title: '提示',
			content: '关闭定时封禁后，定时封禁任务将不再执行，是否继续操作？',
			icon: 'warning-filled',
		})
		// 关闭定时任务
		await useDataHandle({
			loading: '正在' + (val ? '开启' : '关闭') + '定时封禁，请稍后...',
			request: removeSSHCron(),
			message: true,
		})
		banCronJob.value = false
		bannedStatus.value = false
		getSSHInfoData()
	}
}

/**
 * @description 一键封禁爆破IP弹窗
 * @param {boolean} type 是否一键封禁爆破IP
 */
export const openBannedDialog = (type: boolean) => {
	bannedDialog.value = true
	allBanned.value = type
	antiBannedForm.value = {
		hour: 2,
		fail_count: 5,
		ban_hour: 24,
	}
}

export const cancelBannedData = async () => {
	console.log('cancelBannedData')
	bannedDialog.value = false
	// if (timer.value) {
	// 	clearInterval(timer.value)
	// }
	if (!allBanned.value) {
		// 设置定时任务状态味false
		// banCronJob.value = false
		bannedStatus.value = banCronJob.value
	}
}

/**
 * @description 一键封禁爆破IP
 * @param {any} close 关闭弹窗函数
 */
export const confirmBannedData = async () => {
	await blastFormRef.value.validate()
	if (allBanned.value) {
		const res: any = await useDataHandle({
			loading: '正在一键封禁爆破IP，请稍后...',
			request: setSSHBannedData({ data: JSON.stringify(antiBannedForm.value) }),
			data: {
				status: Boolean,
				task_id: Number,
				msg: String,
			},
			message: true,
		})
		if (isNumber(res.task_id)) taskId.value = res.task_id
		bannedDialog.value = false
		console.log(res)
		checkFirewallLog(res)
	} else {
		// 自动封禁爆破IP
		// addSSHCron
		const ress = await useDataHandle({
			loading: '正在添加自动封禁爆破IP任务，请稍后...',
			request: addSSHCron({
				data: JSON.stringify({
					cron_hour: antiBannedForm.value.hour,
					fail_count: antiBannedForm.value.fail_count,
					ban_hour: antiBannedForm.value.ban_hour,
				}),
			}),
			message: true,
		})
		bannedDialog.value = false
		banCronJob.value = true
		getSSHInfoData()
	}
}

/**
 * @description 轮询查看防火墙日志
 */
export const checkFirewallLog = async (res: any) => {
	if (res.status) {
		timer.value = null
		showLogDialog.value = true
		timer.value = setInterval(async () => {
			// 展示日志 每秒轮询
			const rdata = await getLines({ num: 10, filename: '/www/server/panel/tmp/' + taskId.value + '.log' })
			logContent.value = rdata.msg.replace(/\n/g, '<br/>')
			if (rdata.msg.indexOf('结束') > -1 || !rdata.status) {
				// showLogDialog.value = false
				if (!rdata.status) {
					Message.request(rdata)
				}
				clearInterval(timer.value)
			}
		}, 500)
	}
}
