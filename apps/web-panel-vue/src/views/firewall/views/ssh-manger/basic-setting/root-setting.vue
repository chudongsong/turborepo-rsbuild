<template>
	<div>
		<el-form ref="rootFormRef" :model="rootForm" :rules="rootFormRules" @submit.native.prevent>
			<el-form-item class="flex-col" label="Root密码登录设置" prop="rootLogin">
				<el-select v-model="rootForm.rootLogin" class="!w-[26rem] mt-2" @change="onChangeRootLogin">
					<el-option v-for="item in sshRootOption" :key="item[0]" :label="item[1]" :value="item[0]"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item class="root-pwd flex-col" :class="rootPwdStatus" label="Root密码" prop="rootPwd">
				<div class="bt-line mt-2">
					<bt-input-icon v-model="rootForm.rootPwd" icon="el-refresh" placeholder="请输入新密码" @icon-click="() => (rootForm.rootPwd = getRandomChart(16))" width="28rem" />
					<el-button :disabled="rootPwdStatus !== 'strong'" type="primary" class="!ml-4" @click="setRootPwdEvent"> 重置 </el-button>
					<span class="text-tertiary ml-4 text-small"> 建议使用复杂度高的密码，修改后请及时保存，刷新页面会清空密码框 </span>
				</div>
				<span class="pwd-status mt-2" :class="rootPwdStatus">{{ rootPwdStatus === 'empty' ? '修改密码会进行弱密码检测' : rootPwdStatus === 'weak' ? '弱密码' : rootPwdStatus === 'medium' ? '中等强度' : '强密码' }}</span>	
			</el-form-item>
			<el-form-item class="flex-col !mb-4" label="Root密钥">
				<div class="bt-line mt-2">
					<el-button type="primary" @click="downloadSshKey(true)"> 查看密钥 </el-button>
					<el-button @click="downloadSshKey(false)"> 下载 </el-button>
					<span class="text-tertiary ml-4 text-small"> 推荐使用密钥登录，关闭密码，安全性更高 </span>
				</div>
			</el-form-item>
		</el-form>

		<bt-dialog title="SSH密钥登录" v-model="rootKeyForm" :area="42">
			<el-form ref="openSshKeyForm" :model="rootForm" class="p-[2rem]" label-width="5rem">
				<el-form-item>
					<bt-input v-model="rootForm.rootKey" class="sshKey" type="textarea" readOnly :rows="12" width="36rem"></bt-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" class="copySshPaw" @click="copySshPaw(rootForm.rootKey)" v-text="'复制'"></el-button>
					<el-button type="primary" class="copy" @click="downloadKey" v-text="'下载'"></el-button>
					<el-button type="default" class="copy" @click="resetRootKeyEvent" v-text="'重新生成'"></el-button>
				</el-form-item>
			</el-form>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { getSshKey, openSshKey, setRoot, setSSHPassword } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools'
import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools/confirm'
import { copyText, getRandomChart } from '@utils/index'

interface Props {
	data: any
}

const props = withDefaults(defineProps<Props>(), {
	data: () => ({}),
})
const emits = defineEmits(['refresh'])

const propsData = shallowRef(props.data)
const rootFormRef = ref() // 表单引用
const rootPwdStatus = ref<'weak' | 'medium' | 'strong' | 'empty'>('empty')
const rootForm = reactive({
	rootLogin: '',
	rootPwd: '',
	rootKey: '',
})
const sshRootOption = shallowRef() // root登录设置
const rootKeyForm = ref(false) // 查看root密钥弹窗

// 表单校验规则
const rootFormRules = reactive({
	rootPwd: [
		{
			required: false,
		},
		{
			validator: (rule: any, value: string, callback: any) => {
				if (!value) {
					rootPwdStatus.value = 'empty'
					callback()
					return
				}
				
				// 强密码校验规则
				const minLength = 8
				const hasLowerCase = /[a-z]/.test(value)
				const hasUpperCase = /[A-Z]/.test(value)
				const hasNumber = /[0-9]/.test(value)
				
				if (value.length < minLength) {
					rootPwdStatus.value = 'weak'
					callback(new Error(`密码长度至少${minLength}位`))
				} else if (!hasLowerCase) {
					rootPwdStatus.value = 'weak'
					callback(new Error('密码必须包含至少一个小写字母'))
				} else if (!hasUpperCase) {
					rootPwdStatus.value = 'weak'
					callback(new Error('密码必须包含至少一个大写字母'))
				} else if (!hasNumber) {
					rootPwdStatus.value = 'medium'
					callback(new Error('密码必须包含至少一个数字'))
				} else {
					rootPwdStatus.value = 'strong'
					callback()
				}
			},
			trigger: ['blur', 'change']
		}
	]
})

/**
 * @description: 获取ssh密钥/下载密钥
 * @param {boolean} val 查看/下载 true:查看 false:下载
 */
const downloadSshKey = async (val: boolean) => {
	if (propsData.value?.pubkey !== 'yes') return Message.error('请先开启SSH密钥登录，再' + (val ? '查看' : '下载') + '密钥')

	const res = await useDataHandle({
		loading: '正在获取密钥信息，请稍后...',
		request: getSshKey(),
	})
	if (val && res.status) {
		rootForm.rootKey = res.msg
		rootKeyForm.value = true
	} else {
		// 下载密钥
		window.open('/ssh_security?action=download_key', '_blank', 'noopener,noreferrer')
	}
}

/**
 * @description: 重置root登陆密码
 */
const setRootPwdEvent = async () => {
	if (!rootForm.rootPwd) return Message.error('请输入新密码')
		// 先进行表单校验
	// if (rootFormRef.value) {
	// 	try {
	// 		await rootFormRef.value.validateField('rootPwd')
	// 	} catch (error) {
	// 		// 校验失败，不继续执行
	// 		return
	// 	}
	// }
	await useConfirm({
		title: '提示',
		content: '重置root密码后，之前的密码将失效，是否继续操作？',
		icon: 'warning-filled',
	})

	await useDataHandle({
		loading: '正在重置root密码，请稍后...',
		request: setSSHPassword({ username: 'root', password: rootForm.rootPwd }),
		message: true,
	})
	emits('refresh')
}

/**
 * @description: 设置root登录
 * @param {string} val
 */
const onChangeRootLogin = async (val: string) => {
	await useDataHandle({
		loading: '正在设置root登录，请稍后...',
		request: setRoot({ p_type: val }),
		message: true,
	})
	emits('refresh')
}

/**
 * @description 复制
 * @param {string} value 复制内容
 */
const copySshPaw = (value: string) => {
	copyText({ value })
}

/**
 * @description 下载
 */
const downloadKey = () => {
	window.open('/ssh_security?action=download_key', '_blank', 'noopener,noreferrer')
}

/**
 * @description: 重新生成ssh密钥
 */
const resetRootKeyEvent = async () => {
	let sshKey = propsData.value?.pubkey
	await useDataHandle({
		loading: '正在重新生成SSH登录密钥，请稍后...',
		request: openSshKey({ ssh: sshKey, type: propsData.value.key_type }),
		message: true,
	})
	const data = await useDataHandle({
		loading: '正在获取密钥信息，请稍后...',
		request: getSshKey(),
	})
	if (!data.msg)
		return Message.msg({
			type: 'warning',
			message: '请重新开启SSH密钥登录再查看密钥！',
		})
	rootForm.rootKey = data.msg
	emits('refresh')
}

watch(
	() => props.data,
	val => {
		console.log(val, 'val')
		sshRootOption.value = Object.entries(val?.root_login_types || [])
		rootForm.rootLogin = val?.root_login_type
		propsData.value = val
	},
	{ immediate: true }
)
</script>

<style lang="css" scoped>
.bt-line {
	@apply h-[3.2rem] flex items-center;
}

.root-pwd {
	&:deep(.el-form-item__error) {
		@apply text-secondary;
		left: 60px;
		top: auto;
		bottom: 6px;
	}
	&:deep(.el-form-item__content) {
		flex-direction: column;
		align-items: flex-start;
	}
}
.root-pwd.medium {
	&:deep(.el-form-item__error) {
		left: 72px;
	}
}
.pwd-status {
	font-size: 12px;
	font-weight: 400;
	line-height: 12px;
	border: 1px solid var(--el-color-warning);
	color: var(--el-color-warning);
	border-radius: 4px;
	padding: 4px 8px;
	background-color: var(--el-color-warning-light-9);
}
.pwd-status.weak{
	border-color: var(--el-color-danger);
	color: var(--el-color-danger);
	background-color: var(--el-color-danger-light-9);
}
.pwd-status.strong{
	border-color: var(--el-color-primary);
	color: var(--el-color-primary);
	background-color: var(--el-color-primary-light-9);
}
</style>
