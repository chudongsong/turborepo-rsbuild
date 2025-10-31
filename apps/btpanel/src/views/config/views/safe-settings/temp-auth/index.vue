<template>
	<div>
		<config-rows label="临时访问授权">
			<template #value>
				<el-button type="primary" @click="open()">临时访问授权管理</el-button>
			</template>
			<template #desc>
				<span>为非管理员临时提供面板访问权限</span>
			</template>
		</config-rows>
		<bt-dialog title="临时授权管理" v-model="showPopup" :area="70">
			<bt-table-group class="p-6">
				<template #header-left>
					<el-button type="primary" @click="warmPopup = true">创建临时授权 </el-button>
				</template>
				<template #content>
					<bt-table ref="tempAuthTable" :data="tableData" :column="tableColumn" v-bt-loading="tableLoading" :max-height="380"></bt-table>
				</template>
				<template #footer-right>
					<bt-table-page v-model:page="tableParam.p" v-model:row="tableParam.rows" :total="tableTotal" @change="getTempAuthData"></bt-table-page>
				</template>
			</bt-table-group>
		</bt-dialog>

		<!--风险提示弹窗-->
		<bt-dialog title="风险提示" v-model="warmPopup" :area="54" :show-footer="true" @confirm="openRoot()">
			<div class="p-[2rem] flex">
				<i class="svgtofont-el-warning-filled text-warningDark !text-titleLarge pr-4"></i>
				<div>
					<p class="text-base leading-10 text-danger">注意1：滥用临时授权可能导致安全风险。</p>
					<p class="text-base leading-10 text-danger">注意2：请勿在公共场合发布临时授权连接</p>
					<el-form ref="authFormRef" :rules="rules" :model="authForm" :label-position="'left'" class="my-[1rem]">
						<el-form-item :label="'授权时间'">
							<el-radio-group v-model="authForm.checkboxValue">
								<el-radio-button label="3小时"></el-radio-button>
								<el-radio-button label="6小时"></el-radio-button>
								<el-radio-button label="9小时"></el-radio-button>
								<el-radio-button label="12小时"></el-radio-button>
								<el-radio-button label="自定义"></el-radio-button>
							</el-radio-group>
						</el-form-item>
						<el-form-item :label="'自定义时间'" v-if="authForm.checkboxValue === '自定义'" prop="day">
							<bt-input v-model="authForm.day" width="16rem" textType="天" min="1" type="number">
								<template #append>天</template>
							</bt-input>
						</el-form-item>
					</el-form>
				</div>
			</div>
		</bt-dialog>

		<!--创建临时授权信息弹窗-->
		<bt-dialog title="创建临时授权" v-model="authPopup" :area="57">
			<div class="p-[2rem]">
				<div>临时授权地址</div>
				<bt-input class="my-5" type="textarea" :rows="2" v-model="tempAuthAddress"> </bt-input>
				<el-button type="primary" class="copy" @click="copyAddress(tempAuthAddress)">复制地址</el-button>
				<ul class="ml-6 mt-8 list-disc">
					<li class="text-secondary h-[2.4rem]">临时授权生成后1小时内使用有效，为一次性授权，使用后立即失效</li>
					<li class="text-secondary h-[2.4rem]">使用临时授权登录面板后1小时内拥有面板所有权限，请勿在公共场合发布临时授权连接</li>
					<li class="text-secondary h-[2.4rem]">授权连接信息仅在此处显示一次，若在使用前忘记，请重新生成</li>
				</ul>
			</div>
		</bt-dialog>

		<!--操作日志-->
		<bt-dialog :title="`查看操作日志【${ip}】`" v-model="logPopup" :area="70">
			<bt-table-group class="p-6">
				<template #header-left>
					<el-button @click="refreshLog" type="primary">刷新日志</el-button>
				</template>
				<template #content>
					<bt-table ref="tempAuthLogTable" :max-height="380" v-bt-loading="logLoad" v-bt-loading:title="'正在获取日志，请稍候...'" :data="logList" :column="LogColumn"></bt-table>
				</template>
			</bt-table-group>
		</bt-dialog>
	</div>
</template>

<script lang="tsx" setup>
import { useDataHandle, useDataPage } from '@hooks/tools'
import { formatTime } from '@utils/index'
import { getTempAuthList, getTempOperationLogs, removeTempAuthLink, setTempAuthLink } from '@/api/config'
import { copyText } from '@utils/index'
import { useConfirm } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

// 临时授权表格数据参数
interface TableDataProps {
	id?: number
	login_addr?: string
	login_time?: number
	state?: number
	addtime?: number
	expire?: number
	sort?: number
	online_state?: boolean
}

// 弹窗开关
const showPopup = ref(false)

// 临时授权管理表格数据---------------------------------------------
const tableData = ref([]) // 表格数据
const tableLoading = ref(false) // 表格loading
const tableTotal = ref(0) // 表格总数
const tableParam = reactive({ p: 1, rows: 10 }) // 表格接口

// 日志弹窗--------------------------------------------------------
const logPopup = ref(false) // 日志弹窗
const logLoad = ref(false)
const logList = ref<AnyObject>([]) // 日志表格数据

// 临时授权表单数据-------------------------------------------------
const authPopup = ref(false) // 创建临时授权信息弹窗
const authFormRef = ref<any>() // 表单实例
const authForm = ref<any>({
	checkboxValue: '3小时',
	day: 1,
}) // 创建临时授权表单数据

// 其他-------------------------------------------------------------
const tempAuthAddress = ref('') // 临时授权地址
const id = ref<number>() // 保存授权id
const ip = ref<string>() // 登录日志ip
const warmPopup = ref(false) // 风险提示弹窗

// 校验规则
const rules = {
	day: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if ((value <= 0 || value % 1 !== 0) && authForm.value.checkboxValue === '自定义') {
					callback(new Error('自定义时间为大于0的整数！'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change', 'input'],
		},
	],
}

// 打开弹窗
const open = async () => (showPopup.value = true)

// 临时授权表格配置
const tableColumn = [
	{ label: '登录IP', render: (row: TableDataProps) => row.login_addr || '未登录' },
	{
		label: '状态',
		width: 90,
		render: (row: TableDataProps, index: number) => {
			switch (row.state) {
				case -1:
					return <span class="text-[brown]">已过期</span>
				case 0:
					return <span class="text-primary">待使用</span>
				case 1:
					return '已使用'
			}
		},
	},
	{
		label: '登录时间',
		render: (row: TableDataProps) => (row.login_time == 0 ? '未登录' : formatTime(row.addtime, 'yyyy/MM/dd HH:mm:ss')),
	},
	{ label: '过期时间', render: (row: TableDataProps) => formatTime(row.expire) },
	{
		label: '操作',
		width: 120,
		align: 'right',
		render: (row: TableDataProps) => {
			return (
				<div class="flex items-center justify-end">
					<div class={row.state == '1' ? '' : 'hidden'}>
						<span class="bt-link" onClick={() => openLog(row.id!, row.login_addr!)}>
							操作日志
						</span>
						<el-divider direction="vertical" />
					</div>
					<span class="bt-link" onClick={() => delEvent(row.id!)}>
						删除
					</span>
				</div>
			)
		},
	},
]

const LogColumn = [
	{ label: '操作类型', prop: 'type' },
	{ label: '操作时间', prop: 'addtime' },
	{ label: '日志', prop: 'log', width: 350 },
] // 日志授权表格配置

/**
 * @description 创建临时授权按钮
 */
const openRoot = async () => {
	await authFormRef.value.validate()
	warmPopup.value = false
	const data = (await setDataList()) as any
	if (data?.status) {
		authPopup.value = true
	}
}

/**
 * @description 复制
 * @param {string} address — 授权地址
 */
const copyAddress = (address: string) => copyText({ value: address })

/**
 * @description: 删除临时授权
 * @param num — 授权id
 */
const delEvent = async (num: number) => {
	id.value = num
	await useConfirm({
		title: '删除授权',
		content: '删除授权记录，是否继续？',
		icon: 'warning-filled',
	})
	await useDataHandle({
		loading: '正在删除临时授权，请稍候...',
		request: removeTempAuthLink({ id: num }),
		message: true,
	})
	getTempAuthData()
}

/**
 * @description: 打开日志弹窗
 * @param num — 授权id
 * @param loginIp — 登录ip
 */
const openLog = (num: number, loginIp: string) => {
	logPopup.value = true
	id.value = num
	ip.value = loginIp
	refreshLog()
}

/**
 * @description 刷新日志
 */
const refreshLog = () => getLogs(id.value!)

/**
 * @description: 创建临时授权链接
 */
const setDataList = async () => {
	// 获取checkboxValue小时后的10位时间戳
	const { checkboxValue, day } = authForm.value
	let time = checkboxValue === '自定义' ? day * 24 : checkboxValue.replaceAll('小时', '')
	let currentTime = Math.floor(Date.now() / 1000) // 当前时间的10位时间戳
	time = parseInt(time) * 60 * 60 + currentTime
	const data: any = await useDataHandle({
		loading: '正在创建临时授权链接，请稍候...',
		request: setTempAuthLink({ expire_time: time }),
		message: true,
		data: { token: String, expire: Number, status: Boolean },
	})
	getTempAuthData()
	let host = window.location.protocol + '//' + window.location.host + '/login?'
	tempAuthAddress.value = `${host}tmp_token=${data.token}`
	return data
}

/**
 * @description: 获取日志信息
 * @param Id — 授权id
 */
const getLogs = async (id: number) => {
	await useDataHandle({
		loading: logLoad,
		request: getTempOperationLogs({ id }),
		data: [Array, logList],
	})
}

/**
 * @description: 获取临时授权列表
 * @param data.p — 页码
 * @param data.rows — 条数
 */
const getTempAuthData = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getTempAuthList(tableParam),
		data: { data: [Array, tableData], page: useDataPage(tableTotal) },
	})
}

onMounted(() => {
	getTempAuthData()
})
</script>
