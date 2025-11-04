<template>
	<div class="ssh-setting-wrapper">
		<el-form ref="sshFormRef" :model="sshForm" @submit.native.prevent label-position="top">
			<el-form-item class="flex-col" label="SSH密码登录">
				<div class="bt-line">
					<el-switch v-model="sshForm.isPwdLogin" :width="36" @change="onChangeSshPwd"></el-switch>
					<span class="switch-text ml-4">允许使用密码进行SSH登录</span>
				</div>
			</el-form-item>
			<el-form-item class="flex-col" label="SSH密钥登录">
				<div class="bt-line">
					<el-switch v-model="sshForm.isKeyLogin" :width="36" @change="onChangeSshKey" />
					<span class="switch-text ml-4">允许使用密钥进行SSH登录</span>
				</div>
			</el-form-item>
			<el-form-item class="flex-col !mb-4" label="SSH端口">
				<div class="bt-line">
					<bt-input-icon v-model="sshInfo.port" width="20rem" class="!max-w-[20rem]" placeholder="请输入SSH端口" icon="el-refresh" @icon-click="() => randomSshPort()"></bt-input-icon>
					<el-button type="primary" class="!ml-4" @click="saveSshPortEvent()">保存</el-button>
					<span class="text-tertiary ml-4 text-small">当前SSH协议所使用的的端口，默认为22</span>
				</div>
			</el-form-item>
		</el-form>

		<bt-dialog title="开启SSH密钥登录" v-model="keyLoginPopup" :area="40" @confirm="onConfirmKeyLogin" showFooter>
			<div class="p-20px">
				<el-form label-position="right" :model="keyForm">
					<el-form-item :label="'SSH密码登录'">
						<el-select v-model="keyForm.ssh" class="!w-[20rem]">
							<el-option label="开启" value="yes"></el-option>
							<el-option label="关闭" value="no"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="'密钥加密方式'">
						<el-select v-model="keyForm.type" class="!w-[20rem]">
							<el-option label="ED25519(推荐)" value="ed25519"></el-option>
							<el-option label="ECDSA" value="ecdsa"></el-option>
							<el-option label="RSA" value="rsa"></el-option>
							<el-option label="DSA" value="dsa"></el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { checkPort } from '@utils/index'
import { getFirewallStore } from '@firewall/useStore'
import { useDataHandle } from '@hooks/tools'
import { openSshKey, setSshPort, setSshPwd, stopSshKeyLogin } from '@/api/firewall'
import { Message } from '@hooks/tools/message'

interface Props {
	data: AnyObject
}

const props = withDefaults(defineProps<Props>(), {
	data: () => ({}),
})

const emits = defineEmits(['refresh'])

const {
	refs: { sshInfo },
} = getFirewallStore()

const propsData = shallowRef(props?.data)
const keyLoginPopup = ref(false) // SSH密钥登录弹窗

const sshForm = reactive({
	isPwdLogin: propsData.value?.password === 'yes',
	isKeyLogin: propsData.value?.pubkey === 'yes',
})

const keyForm = reactive({
	ssh: 'yes',
	type: 'ed25519',
})

/**
 * @description SSH登录密码开关
 * @param {Boolean} val 是否开启
 */
const onChangeSshPwd = async (val: string | number | boolean) => {
	await useDataHandle({
		loading: '正在' + (val ? '开启' : '关闭') + 'SSH密码登录，请稍后...',
		request: setSshPwd(Boolean(val)),
		message: true,
	})
}

/**
 * @description 开启SSH密钥登录
 * @param close
 */
const onConfirmKeyLogin = async () => {
	await useDataHandle({
		loading: '正在处理，请稍候...',
		request: openSshKey(keyForm),
		message: true,
	})
	keyLoginPopup.value = false
	keyForm.ssh = 'yes'
	keyForm.type = 'ed25519'
	emits('refresh')
}

/**
 * SSH登录密钥开关
 * @param val
 */
const onChangeSshKey = async (val: string | number | boolean) => {
	if (val) {
		sshForm.isKeyLogin = !val
		keyLoginPopup.value = true
	} else {
		await useDataHandle({
			loading: '正在关闭SSH密钥登录，请稍后...',
			request: stopSshKeyLogin(),
			message: true,
		})
		emits('refresh')
	}
}

/**
 * @description: 保存SSH端口
 */
const saveSshPortEvent = async () => {
	if (!checkPort(sshInfo.value.port)) {
		Message.error('端口格式错误，可用范围：1-65535')
		return
	}
	await useDataHandle({
		loading: '正在保存SSH端口，请稍后...',
		request: setSshPort(Number(sshInfo.value.port)),
		message: true,
	})
	emits('refresh')
}

/**
 * @description 随机生成SSH端口
 * SSH端口规范范围：1024-65535 (避免使用系统保留端口 1-1023)
 * 推荐范围：10000-65535 (避免常用服务端口冲突)
 */
const randomSshPort = () => {
	const minPort = 1000
	const maxPort = 65535
	const randomPort = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort
	sshInfo.value.port = randomPort.toString()
}

watch(
	() => props.data,
	val => {
		val && (propsData.value = val)
		sshForm.isPwdLogin = val?.password === 'yes'
		sshForm.isKeyLogin = val?.pubkey === 'yes'
	},
	{ immediate: true }
)
</script>

<style lang="css" scoped>
.bt-line {
	@apply h-[3.2rem] flex items-center;
}
.ssh-setting-wrapper .switch-text {
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-tertiary);
}
</style>
