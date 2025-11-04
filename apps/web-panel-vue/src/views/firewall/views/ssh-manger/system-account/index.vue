<template>
	<div>
		<div v-if="payment.authType === 'ltd' && !isSetup">
			<bt-table-group>
				<template #header-left>
					<el-button type="primary" @click="openAddUserView"> 创建系统用户 </el-button>
					<el-button @click="openPluginViewEvent">堡塔防入侵</el-button>
				</template>
				<template #content>
					<bt-table :column="tableColumn" :data="tableData" v-bt-loading="loading" v-bt-loading:title="'正在加载列表，请稍后...'"></bt-table>
				</template>
			</bt-table-group>
			<ul class="mt-[.8rem] leading-8 text-small list-disc ml-[2rem]">
				<li>开启防提权，系统会针对该用户操作命令进行限制，并记录跟踪</li>
				<li>不开启防提权，系统只针对该用户操作过的命令做记录跟踪</li>
				<li>目前防提权默认只针对www,redis,mysql操作引起的提权问题进行处理</li>
				<li class="text-danger">消息推送需要更新至最新面板的版本(2020-06-17日之后安装的版本|或者2020-06-17日之后点击过修复面板)</li>
			</ul>
		</div>
		<bt-product-introduce v-else :data="productData" class="px-[20%] py-[2rem]"></bt-product-introduce>

		<bt-dialog title="修改密码" v-model="pwdPopup" :area="38" showFooter @confirm="onConfirmUserPwd" @cancel="() => (newPwd = '')">
			<div class="p-[2rem] flex items-center">
				<span class="inline-block w-[8rem] text-right">新密码</span>
				<bt-input class="ml-[1.2rem]" :isNull="true" iconType="refresh" v-model="newPwd" placeholder="请输入新密码"></bt-input>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="tsx" setup>
import { useConfirm } from '@hooks/tools'
import { Message } from '@hooks/tools'

import { delSshUser, getIntrusionData, getLogsList, setSSHPassword, setUserLog, startUserSecurity } from '@/api/firewall'
import { getPluginInfo } from '@/api/global'
import { useOperate } from '@/hooks/tools/table/column'
import { openPluginView } from '@/public/index'
import { useDataHandle } from '@hooks/tools'
import { useDialog } from '@hooks/tools/dialog'
import { useGlobalStore } from '@store/global'
import { ElSwitch } from 'element-plus'

const { mainHeight, payment } = useGlobalStore()

const pwdPopup = ref(false) // 修改密码弹窗
const newPwd = ref('') // 新密码

const loading = ref(false) // 加载状态
const tableData = ref<any>([]) // 表格数据
const rowData = ref<any>([]) // 当前行数据
const isSetup = ref<boolean>(false) // 是否安装:true-未安装

const productData = shallowReactive({
	title: 'SSH系统账号管理-功能介绍',
	ps: 'SSH系统账号管理通常涉及到在服务器上创建、删除和管理SSH用户账户的过程。这些账户可以用于通过SSH（安全壳层）协议远程访问服务器。这种管理工作通常由系统管理员进行，以确保只有授权的用户可以访问服务器。',
	source: 305,
	desc: ['创建系统用户', '修改系统用户密码', '删除系统用户', '记录日志', '防入侵'],
	isInstall: isSetup.value,
	// isSkipPay: true, // 是否跳过支付
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/ssh_system_manage.png',
		},
	],
	pluginInfo: {
		name: 'bt_security',
	},
}) // 产品介绍

/**
 * @description 打开插件
 */
const openPluginViewEvent = async () => {
	openPluginView({ name: 'bt_security' })
}

/**
 * @description 创建用户
 */
const openAddUserView = () => {
	useDialog({
		title: '创建系统用户',
		area: 42,
		showFooter: true,
		compData: { refreshFn: getSshUserList },
		component: () => import('./add-user.vue'),
	})
}
/**
 * @description 查看日志
 * @param row 当前行数据
 */
const logEvent = async (row: any) => {
	const res: any = await useDataHandle({
		loading: '正在获取日志，请稍后...',
		request: getLogsList({ user: row[0] }),
		data: Array,
	})
	if (!res.length) return Message.error('当前暂无日志')
	rowData.value = {
		user: row[0],
		dateTime: res[0],
		dateOptions: res.map((item: any) => ({ title: item, key: item })),
	}
	useDialog({
		title: '命令日志',
		area: 72,
		component: () => import('@firewall/public/command-log/index.vue'),
		compData: rowData.value,
	})
}

/**
 * @description 确认修改密码
 */
const onConfirmUserPwd = async () => {
	if (!newPwd.value) return Message.error('请输入新密码')
	await useDataHandle({
		loading: '正在设置密码，请稍后...',
		request: setSSHPassword({
			username: rowData.value[0],
			password: newPwd.value,
		}),
		message: true,
	})
	pwdPopup.value = false
	newPwd.value = ''
}

/**
 * @description 删除用户
 * @param row 当前行数据
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: `删除[${row[0]}]用户`,
		content: `危险操作，正在删除[${row[0]}]用户，请在下方输入'确认删除'`,
		input: { content: '确认删除' },
		type: 'input',
	})

	await useDataHandle({
		loading: '正在删除中,请稍后...',
		request: delSshUser({ username: row[0] }),
		message: true,
	})
	getSshUserList()
}

/**
 *@description 修改状态
 * @param val  状态值
 * @param row  当前行数据
 * @param type  类型  3:防入侵 5:记录日志
 */
const changeStatusEvent = async (val: boolean, row: any, type: number) => {
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + (type === 3 ? '防入侵' : '记录日志') + '，请稍后...',
		request: type === 3 ? startUserSecurity(val, { user: row[0] }) : setUserLog(val, { uid: row[1] }),
		message: true,
	})
	getSshUserList()
}

/**
 * @description 获取用户列表
 */
const getSshUserList = async () => {
	loading.value = true
	const { data: res, msg } = await getIntrusionData()
	if (!res.status && msg === '插件不存在!') {
		productData.isInstall = false
		isSetup.value = true
		getSecutyPlugin()
		return
	}
	productData.isInstall = true
	isSetup.value = false
	tableData.value = res.system_user
	loading.value = false
}

/**
 * @description 获取防入侵插件信息
 */
const getSecutyPlugin = async () => {
	try {
		const { data } = await getPluginInfo({ sName: 'bt_security' })
		productData.pluginInfo = data
	} catch (error) {
		console.log(error)
	}
}

const tableColumn = [
	{ label: '用户名', render: (row: any) => row[0] },
	{
		label: '防入侵',
		width: 100,
		render: (row: any) => {
			return <ElSwitch modelValue={row[3]} size="small" onChange={(val: any) => changeStatusEvent(val, row, 3)}></ElSwitch>
		},
	},
	{
		label: '记录日志',
		width: 100,
		render: (row: any) => {
			return <ElSwitch modelValue={row[5]} size="small" onChange={(val: any) => changeStatusEvent(val, row, 5)}></ElSwitch>
		},
	},
	{ label: '备注', render: (row: any) => row[6] },
	useOperate([
		{ onClick: logEvent, title: '命令日志', width: 70 },
		{
			onClick: (row: any) => {
				rowData.value = row
				pwdPopup.value = true
			},
			title: '重置密码',
			width: 70,
		},
		{ onClick: deleteEvent, title: '删除' },
	]), // 操作
]

onMounted(getSshUserList)
</script>
