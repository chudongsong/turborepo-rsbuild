<template>
	<div>
		<bt-table-group v-if="payment.authType === 'ltd'">
			<template #header-left>
				<div class="flex items-center">
					<!-- <el-button type="primary" @click="getSSHLoginData()">刷新</el-button> -->
					<el-button type="primary" @click="openBannedDialog(true)">一键封禁爆破IP</el-button>
					<span class="mx-[8px]">定时封禁</span>
					<el-switch v-model="bannedStatus" @change="onChangeBanJob"></el-switch>
				</div>
			</template>

			<template #header-right>
				<bt-radio type="button" v-model="sshLoginType" :options="typeOptions" class="mr-8px" @change="val => (sshLoginType = val)" />
				<bt-input-search class="!w-[26rem] mr-[0.8rem]" v-model="tableParam.search" @search="getSSHLoginData()" placeholder="请输入登录IP/用户名" />
				<bt-table-refresh @refresh="() => getSSHLoginData()" />
			</template>

			<template #content>
				<bt-table :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'SSH登录日志列表为空'" v-bt-loading:title="'正在加载SSH登录日志列表，请稍后...'"></bt-table>
			</template>

			<template #footer-right>
				<bt-page-text :limit="tableParam.limit" :p="tableParam.p" :num="completedTotal" @click="changePageEvent" />
			</template>
			<template #popup>
				<bt-dialog v-model="bannedDialog" :title="`${allBanned ? '一键' : '自动'}封禁爆破IP`" showFooter :area="46" @confirm="confirmBannedData" @cancel="cancelBannedData">
					<div class="p-[2rem]">
						<el-form :model="antiBannedForm" ref="blastFormRef" :rules="rules">
							<el-form-item :label="allBanned ? '周期' : '定时'" prop="hour">
								<bt-input type="number" v-model="antiBannedForm.hour" width="24rem">
									<template #append>小时</template>
								</bt-input>
							</el-form-item>

							<el-form-item label="失败次数" prop="fail_count">
								<bt-input type="number" v-model="antiBannedForm.fail_count" width="24rem">
									<template #append>次</template>
								</bt-input>
							</el-form-item>

							<el-form-item label="封禁时间" prop="ban_hour">
								<bt-input type="number" v-model="antiBannedForm.ban_hour" width="24rem">
									<template #append>小时</template>
								</bt-input>
							</el-form-item>
						</el-form>
						<ul class="mt-8px leading-8 text-small list-disc ml-20px">
							<li v-if="allBanned">说明：{{ antiBannedForm.hour || '--' }}小时前到现在失败次数超过{{ antiBannedForm.fail_count || '--' }}次的IP，封禁{{ antiBannedForm.ban_hour || '--' }}小时</li>
							<li v-if="!allBanned">说明：{{ antiBannedForm.hour || '--' }}小时运行一次，封禁{{ antiBannedForm.hour || '--' }}小时内，失败次数超过{{ antiBannedForm.fail_count || '--' }}次的IP，封禁{{ antiBannedForm.ban_hour || '--' }}小时</li>
							<li>封禁IP可在安全-IP规则中查看</li>
						</ul>
					</div>
				</bt-dialog>

				<bt-dialog v-model="showLogDialog" width="50rem" title="任务日志" :area="54">
					<div class="flex flex-col bg-darkPrimary text-white leading-[2.2rem] h-[30rem] overflow-y-auto p-[1rem]" v-html="logContent"></div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-product-introduce v-else :data="productData" class="px-[20%] py-[2rem]"></bt-product-introduce>
	</div>
</template>
<script lang="tsx" setup>
import { Message, useConfirm, useDataHandle } from '@hooks/tools'

import { addSSHCron, createSshIpRules, getSshLoginList, removeSSHCron, removeSshIpRules, setSSHBannedData } from '@/api/firewall'
import { useGlobalStore } from '@store/global'
import { getFirewallStore } from '@/views/firewall/useStore'
import { isNumber } from '@/utils'
import { getLines } from '@/api/site'

const { payment, mainHeight } = useGlobalStore()

const {
	refs: { sshLoginType, sshInfo },
} = getFirewallStore()

// 页面数据
const loading = ref(false) // 加载状态
const tableData = ref([]) //列表数据
const completedTotal = ref(0) // 总条数
const blastFormRef = ref() // 一键封禁爆破IP表单
const bannedDialog = ref(false) // 一键封禁爆破IP弹窗
const antiBannedForm = ref({
	hour: 0, // 周期
	fail_count: 0, // 失败次数
	ban_hour: 0, // 封禁时间
}) // 一键封禁爆破IP表单数据

const bannedStatus = ref(sshInfo.value.ban_cron_job) // 定时封禁开关状态

// 限制只能输入正整数
const validateNumber = (rule: any, value: any, callback: any) => {
	if (!/^[1-9]\d*$/.test(value) && value !== '') {
		callback(new Error('请输入正整数'))
	} else {
		callback()
	}
}

const rules = {
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

const productData = {
	title: 'SSH登录日志-功能介绍',
	ps: '保障SSH服务器的安全性，发现和应对安全威胁。',
	source: 100,
	desc: ['SSH安全审计', 'SSH登录溯源', 'SSH暴破记录', 'SSH入侵分析'],
	tabImgs: [
		{
			title: 'SSH登录日志',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/ssh_login_log.png',
		},
	],
}

const allBanned = ref(true) // 一键封禁爆破IP弹窗标题

const taskId = ref() // 定时任务ID

const showLogDialog = ref(false) // 初始化防火墙弹窗
const logContent = ref('') // 初始化防火墙日志内容
const timer = ref<any>(null)

// 表格接口请求
const tableParam = reactive({
	p: 1,
	limit: 20,
	search: '',
	select: 'ALL',
})

const typeOptions = [
	{ label: '全部', value: 'ALL' },
	{ label: '登录成功', value: 'Accepted' },
	{ label: '登录失败', value: 'Failed' },
]

// 表格数据
const tableColumn = [
	{
		label: 'IP地址:端口',
		prop: 'address',
		render: (row: any) => {
			return (
				<span class={!row.deny_status ? 'bt-link' : '!text-tertiary line-through bt-link'} onClick={() => changeIpStatus(row)}>
					{row.address}:{<span class="text-secondary cursor-default !no-underline">{row.port}</span>}
				</span>
			)
		},
	},
	{
		label: '归属地',
		prop: 'area',
		render: (row: any) => row.area.info || '--',
	},
	{ label: '用户', prop: 'user' },
	{
		label: '状态',
		prop: 'status',
		render: (row: any, index: number) => <span class={`bt-link !text-${row.status ? 'primary' : 'danger'}`}>{row.status ? '登录成功' : '登录失败'}</span>,
	},
	{ label: '操作时间', prop: 'time' },
]

/**
 * @description 封禁/解封IP
 */
const changeIpStatus = async (row: any) => {
	await useConfirm({
		title: '提示',
		content: row.deny_status ? '解封该IP后，将恢复此IP对服务器的访问，是否继续操作？' : '封禁该IP后，将不再允许此IP访问服务器，是否继续操作？',
		icon: 'warning-filled',
	})

	let params = {
		address: row.address,
		types: 'drop',
		brief: 'SSH登录日志页面点击IP手动封禁',
		domain: '',
		choose: 'address',
	}

	const res = await useDataHandle({
		loading: '正在' + (row.deny_status ? '解封' : '封禁') + 'IP，请稍后...',
		request: row.deny_status ? removeSshIpRules({ address: row.address }) : createSshIpRules(params),
		data: Array,
	})
	Message.request({
		status: res.length > 0,
		msg: res.length > 0 ? '操作成功' : '操作失败',
	})

	getSSHLoginData()
}

/**
 * @description 定时封禁开关
 * @param {boolean} val 开关状态
 */
const onChangeBanJob = async (val: boolean) => {
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
		sshInfo.value.ban_cron_job = false
		bannedStatus.value = false
	}
}

/**
 * @description 一键封禁爆破IP弹窗
 * @param {boolean} type 是否一键封禁爆破IP
 */
const openBannedDialog = (type: boolean) => {
	bannedDialog.value = true
	allBanned.value = type
	antiBannedForm.value = {
		hour: 2,
		fail_count: 5,
		ban_hour: 24,
	}
}

const cancelBannedData = async () => {
	console.log('cancelBannedData')
	bannedDialog.value = false
	// if (timer.value) {
	// 	clearInterval(timer.value)
	// }
	if (!allBanned.value) {
		// 设置定时任务状态味false
		// sshInfo.value.ban_cron_job = false
		bannedStatus.value = sshInfo.value.ban_cron_job
	}
}

/**
 * @description 一键封禁爆破IP
 * @param {any} close 关闭弹窗函数
 */
const confirmBannedData = async () => {
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
		await useDataHandle({
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
		sshInfo.value.ban_cron_job = true
	}
}

/**
 * @description 轮询查看防火墙日志
 */
const checkFirewallLog = async (res: any) => {
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

/**
 * @description 页码切换
 * @param {number} p 当前页码
 */
const changePageEvent = (p: number) => {
	tableParam.p = p
	getSSHLoginData()
}

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getSSHLoginData = async (
	params = {
		p: tableParam.p,
		limit: tableParam.limit,
		search: tableParam.search,
		select: sshLoginType.value,
	}
) => {
	if (payment.value.authType !== 'ltd') return
	await useDataHandle({
		loading,
		request: getSshLoginList({ data: JSON.stringify(params) }),
		data: [Array, tableData],
	})
	completedTotal.value = tableData.value.length
}

watch(sshLoginType, () => {
	tableParam.p = 1
	getSSHLoginData()
})

// 页面加载完成
onMounted(() => {
	// 异步 避免出现刷新时还取不到授权数据
	setTimeout(() => {
		getSSHLoginData()
	}, 0)
})
</script>
