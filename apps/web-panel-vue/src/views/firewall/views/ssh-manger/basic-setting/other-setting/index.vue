<template>
	<div>
		<el-form :model="formData" @submit.native.prevent>
			<!-- :class="longinAlarmInfo.type ? 'bt-link' : '!text-warning bt-link'" -->
			<el-form-item class="flex-col" label="SSH登录告警" v-bt-loading="alertLoading">
				<div class="bt-line mt-2">
					<span @click="openSshLoginAlarmView()" class="!text-small cursor-pointer" :class="`text-${alertData.type ? 'primary' : 'warning'}`">
						{{ alertData.text }}
					</span>
					<el-button type="primary" class="!ml-4" @click="openSshLoginAlarmView()"> 设置登陆告警 </el-button>
					<span class="text-tertiary ml-4 text-small"> 推荐使用密钥登录，关闭密码，安全性更高 </span>
				</div>
			</el-form-item>

			<el-form-item class="flex-col" label="SSH安全防护">
				<div class="bt-line mt-2">
					<el-switch v-model="formData.sshBlastStatus" :width="36" @change="onChangeSshBlast"></el-switch>
					<el-button @click="openAntiBlastConfig()" type="primary" class="!ml-8"> 配置 </el-button>
					<el-button @click="openAntiBlastLog()">日志</el-button>
					<span class="text-tertiary ml-4 text-small"> 结合fail2ban服务自动阻止恶意IP地址的攻击、暴力破解等行为；首次安装后，请手动刷新页面 </span>
				</div>
			</el-form-item>
			<el-form-item class="flex-col">
				<span class="text-small text-tertiary">
					更多SSH安全设置请使用系统加固模块
					<span class="bt-link" @click="jumpTab">>> 系统加固</span>
				</span>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { getAntiBlastLogs, getLoginSend, setAntiConf } from '@/api/firewall'
import { getPluginInfo } from '@/api/global'
import { pluginInstallDialog } from '@/public/index'
import { router } from '@/router'
import { getSSHInfoEvent } from '@/views/firewall/useMethod'
import { getFirewallStore } from '@firewall/useStore'
import { Message } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { useDialog } from '@hooks/tools'
import { useHandleError } from '@hooks/tools'

const {
	refs: { sshInfo },
} = getFirewallStore()

const formData = reactive({
	sshBlastStatus: Boolean(sshInfo.value?.fail2ban?.status),
})

const alertStatus = ref() // 登录告警状态
const alertLoading = ref(false) // 登录告警加载状态
const alertData = ref<any>({})
/**
 * @description: 设置防暴破
 */
const onChangeSshBlast = async (val: boolean) => {
	formData.sshBlastStatus = !val
	const res = await useDataHandle({
		request: getPluginInfo({ sName: 'fail2ban' }),
	})

	if (!res.data.setup) {
			// 插件安装界面
			pluginInstallDialog({
				name: res.data.name,
				type: 'i',
				pluginInfo: res.data,
			})
		Message.warn('请先安装防暴破插件')
		return
	}
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + '防暴破，请稍后...',
		request: setAntiConf({ act: val }),
		message: true,
	})
	formData.sshBlastStatus = val
	getSSHInfoEvent()
}

const checkFailbn = async (callback: any) => {
	try {
		const { data } = await useDataHandle({
			request: getPluginInfo({ sName: 'fail2ban' }),
		})
		if (!data.setup) {
			// 插件安装界面
			pluginInstallDialog({
				name: data.name,
				type: 'i',
				pluginInfo: data,
			})
			Message.warn('请先安装防暴破插件')
		} else {
			callback && callback()
		}
	} catch (error) {}
}

/**
 * @description: 查看防暴破列表
 */
const openAntiBlastConfig = async () => {
	checkFailbn(() =>
		useDialog({
			title: '配置SSH防暴破',
			area: 40,
			component: () => import('./anti-blast-view.vue'),
			showFooter: true,
		})
	)
}

/**
 * @description: 查看防暴破日志
 */
const openAntiBlastLog = async () => {
	checkFailbn(() =>
		useDialog({
			title: '防暴破日志',
			area: 60,
			compData: { type: 'AntiBlast', requestFn: () => getAntiBlastLogs() },
			component: () => import('@firewall/public/anti-plugin-log/index.vue'),
		})
	)
}

/**
 * @description: 跳转到系统加固
 */
const jumpTab = () => {
	router.push({ name: 'fixed' })
}

/**
 * @description: 获取登录告警配置信息
 */
const getSshKeyLoginAlert = async () => {
	try {
		alertLoading.value = true
		const { data: res } = await getLoginSend()
		alertData.value = res
		if (res.status) {
			alertData.value.type = true
			const msg: any = {
				mail: '邮件',
				sms: '短信',
				dingding: '钉钉',
				wx_account: '微信公众号',
				feishu: '飞书',
				weixin: '企业微信',
				webhook: '自定义通道',
			}
			alertData.value.text = alertData.value.channels.map((sender: string) => msg[sender]).join('、') + '已配置'
		} else {
			alertData.value = { type: false, text: '告警通知未配置' }
		}
		return res
	} catch (error) {
		useHandleError(error)
	} finally {
		alertLoading.value = false
	}
}

/**
 * @description: 设置登录告警
 */
const openSshLoginAlarmView = async () => {
	useDialog({
		title: 'SSH登录告警',
		area: 104,
		compData: {
			alertStatus: alertStatus.value,
			refreshFn: getSshKeyLoginAlert,
		},
		component: () => import('./login-alert-setting.vue'),
	})
}

watch(
	() => sshInfo.value,
	() => {
		formData.sshBlastStatus = Boolean(sshInfo.value?.fail2ban?.status)
	}
)

onMounted(() => {
	getSshKeyLoginAlert()
})
</script>

<style scoped></style>
