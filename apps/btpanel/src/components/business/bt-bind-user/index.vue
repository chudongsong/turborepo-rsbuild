<template>
	<BtForm ref="bindUserRef" size="default" :rules="rules" :model="userInfo" class="bind-user-info" :class="{ 'bind-form': compData?.title ? true : false }">
		<BtFormItem class="!mb-5 flex !justify-center">
			<div class="flex !justify-center !w-full items-center">
				<h3 class="text-extraLarge text-default inline-block mr-2 font-bold my-[10px]">
					{{ compData?.title || '切换宝塔官网账号' }}
				</h3>
				<BtPopover placement="top-start" width="200" trigger="hover" content="宝塔面板许多功能都依赖于官网，绑定仅限于为您提供更好的面板服务体验，不涉及您服务器任何敏感信息，请放心使用。" class="inline-block relative -top-1.5">
					<template #reference>
						<a class="bt-ico-ask align-middle inline-block" href="javascript:;"> ? </a>
					</template>
				</BtPopover>
			</div>
		</BtFormItem>

		<BtFormItem :key="1" prop="username" :class="{ '!mb-[3rem]': compData?.title ? true : false }">
			<BtInput v-model="userInfo.username" v-focus clearable required name="username" placeholder="宝塔官网账号" class="h-[4rem] leading-[4rem] w-full" :disabled="formDisabled.username" @keyup.enter.native="bindBtUser()" />
			<span v-if="compData?.title && showError" class="absolute el-form-item__error">
				<span>请使用宝塔官网登录账号进行登录，若未有账号，可进行</span>
				<BtLink class="!text-small" href="https://www.bt.cn/register"> 免费注册 </BtLink>
			</span>
		</BtFormItem>
		<BtFormItem :key="2" prop="password">
			<BtInput v-model="userInfo.password" clearable required type="password" name="password" placeholder="密码" class="h-[4rem] leading-[4rem] w-full" :show-password="true" :disabled="formDisabled.password" @keyup.enter.native="bindBtUser()"></BtInput>
		</BtFormItem>

		<BtFormItem v-show="isCheck" prop="code">
			<BtInput v-model="userInfo.code" clearable placeholder="验证码" type="text" @keyup.enter.native="bindBtUser()">
				<template #append>
					<BtButton class="relative top-0 rounded-none rounded-r-small w-full !h-[auto]" size="large" type="primary" :disabled="formDisabled.code" plain @click="getVerifyCode">
						{{ tipsText }}
					</BtButton>
				</template>
			</BtInput>
		</BtFormItem>
		<BtButton type="primary" class="w-[100%] mt-[1.2rem]" size="large" @click="bindBtUser()">
			{{ compData?.btn || (compData?.title ? '绑定账号' : '切换账号') }}
		</BtButton>
		<div class="flex justify-end items-center mt-6 text-small">
			<template v-if="!compData?.isDialog">
				<BtLink @click="skipBinding()">暂不绑定</BtLink>
				<BtDivider />
			</template>
			<BtLink href="https://www.bt.cn/register">注册账号</BtLink>
			<BtDivider />
			<BtLink href="https://www.bt.cn/login.html?page=reset">忘记密码</BtLink>
			<BtDivider />
			<BtLink href="https://www.bt.cn/bbs">问题反馈</BtLink>
		</div>
		<div class="divider-container">
			<div class="divider-line"></div>
			<div class="divider-text">第三方登录</div>
			<div class="divider-line"></div>
		</div>

		<div class="flex justify-center items-center mt-2">
			<div class="wechat-login-container" @click="openWechatLogin">
				<div class="wechat-icon-circle">
					<i class="wechat-icon">
						<svg t="1749545795651" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9096" width="20" height="20">
							<path
								d="M391.95 175.27c-159.03 0-289.29 108.4-289.29 246.04 0 79.45 43.35 144.67 115.74 195.2l-28.93 87.05 101.12-50.74c36.19 7.19 65.22 14.54 101.33 14.54 9.08 0 18.09-0.45 27.01-1.16-5.64-19.37-8.92-39.61-8.92-60.62 0-126.32 108.54-228.89 245.97-228.89 9.37 0 18.64 0.69 27.86 1.71C658.8 261.87 534.2 175.27 391.95 175.27z m-93.97 195.31c-21.67 0-43.56-14.52-43.56-36.21 0-21.77 21.89-36.09 43.56-36.09s36.12 14.33 36.12 36.09c-0.02 21.69-14.45 36.21-36.12 36.21z m202.46 0c-21.69 0-43.45-14.52-43.45-36.21 0-21.77 21.76-36.09 43.45-36.09 21.79 0 36.21 14.33 36.21 36.09 0 21.69-14.43 36.21-36.21 36.21z m0 0"
								fill="var(--el-color-primary)"
								p-id="9097"></path>
							<path
								d="M920.01 602.12c0-115.59-115.74-209.86-245.72-209.86-137.64 0-246.05 94.27-246.05 209.86 0 115.84 108.41 209.92 246.05 209.92 28.81 0 57.85-7.25 86.79-14.51l79.36 43.44-21.76-72.3c58.06-43.53 101.33-101.3 101.33-166.55z m-325.5-36.14c-14.41 0-28.95-14.31-28.95-28.92 0-14.44 14.54-28.96 28.95-28.96 21.89 0 36.21 14.52 36.21 28.96 0 14.61-14.33 28.92-36.21 28.92z m159.13 0c-14.31 0-28.74-14.31-28.74-28.92 0-14.44 14.43-28.96 28.74-28.96 21.67 0 36.21 14.52 36.21 28.96 0 14.61-14.54 28.92-36.21 28.92z m0 0"
								fill="var(--el-color-primary)"
								p-id="9098"></path>
						</svg>
					</i>
				</div>
				<!-- <div class="wechat-text">微信</div> -->
			</div>
		</div>
	</BtForm>
</template>

<script lang="ts" setup>
import { getBindCode, getWechatAuthUrl, setWechatBindUser } from '@/api/global'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { inputFocus } from '@/utils'
import { router } from '@/router'
import { bindUserRequest } from './useController'

const { getGlobalInfo } = useGlobalStore()
const message = useMessage()

interface Props {
	compData?: {
		title: string
		btn: string
		isDialog: boolean
		redirect: string // 登录成功后跳转的路由
	}
}

const props = withDefaults(defineProps<Props>(), {
	// eslint-disable-next-line vue/require-valid-default-prop
	compData: () => ({
		title: '',
		btn: '',
		isDialog: true,
		redirect: '',
	}),
})

// 微信登录相关
const qrcodeLoading = ref(false)
const wechatWindow = ref<Window | null>(null)
const checkWindowTimer = ref<ReturnType<typeof setInterval> | null>(null)

// 是否验证码验证
const isCheck = ref(false)
// 获取验证码按钮文字
const tipsText = ref('获取验证码')
// 用户登录数据
const userInfo = reactive({ username: '', password: '', code: '' })
// 表单状态配置
const formDisabled = reactive({
	username: false,
	password: false,
	code: false,
})
// 用户登录Token
const userToken = ref('')
// 定时器状态
const clearIntervalVal = ref()
// 表单实例
const bindUserRef = ref()
// 是否显示错误信息
const showError = ref(false) // 是否显示错误信息
// 表单规则
const rules = ref({
	username: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (props.compData?.title) showError.value = false
				if (/^1[3456789]\d{9}$/.test(value)) {
					callback()
				} else if (value === '') {
					callback(new Error('请输入宝塔官网账号'))
				} else {
					if (props.compData?.title) {
						showError.value = true
						callback(new Error(' '))
						return
					}
					callback(new Error('请输入正确的手机号'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	password: [
		{ required: true, message: '请输入密码', trigger: ['blur', 'change'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length >= 8) {
					callback()
				} else {
					callback(new Error('请输入至少8位密码'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	token: [
		{ required: false, message: '请输入验证码', trigger: ['blur', 'change'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!isCheck.value) callback()
				if (value.length === 6) {
					callback()
				} else {
					callback(new Error('请输入6位验证码，不可为空'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

/**
 * @description 绑定宝塔官网账号
 * @returns
 */
const bindBtUser = () => {
	bindUserRef.value.validate(async (valid: boolean) => {
		if (valid) bindUserRequest({ isCheck, userInfo, userToken })
	})
}

/**
 * @description 跳过绑定
 */
 const skipBinding = () => {
	router.push('/')
	// 关闭当前弹窗
	onCancel()
}

/**
 * @description 倒计时
 * @param {number} time 倒计时时间
 */
const countDown = (time: number) => {
	if (clearIntervalVal.value) clearInterval(clearIntervalVal.value)
	const intervalFun = () => {
		time--
		if (time <= 0) {
			clearInterval(clearIntervalVal.value)
			tipsText.value = '获取验证码'
			formDisabled.code = false
			return
		}
		tipsText.value = `重新获取验证码(${time}s)`
	}
	intervalFun()
	clearIntervalVal.value = setInterval(intervalFun, 1000)
	formDisabled.code = true
}

/**
 * @description 获取验证码
 * @returns {Promise<void>}
 */
const getVerifyCode = async (): Promise<void> => {
	if (!userInfo.username || !userInfo.password) {
		message.error('请先输入手机号和密码')
		return
	}
	formDisabled.username = true
	formDisabled.password = true
	countDown(60) // 设置倒计时
	const rdata = await getBindCode({
		username: userInfo.username,
		token: userToken.value,
	})
	message.request(rdata)
}

/**
 * @description 打开微信登录
 */
const openWechatLogin = async () => {
	qrcodeLoading.value = true
	try {
		const res = await getWechatAuthUrl()
		if (res.status) {
			// 计算窗口位置，使其居中
			const width = 600
			const height = 500
			const left = window.screen.width / 2 - width / 2
			const top = window.screen.height / 2 - height / 2

			// 打开新窗口并设置位置
			wechatWindow.value = window.open(res.msg.replace('login.html', 'new/wxBindPanel.html'), '_blank', `width=${width},height=${height},left=${left},top=${top}`)
			window.addEventListener('message', event => {
				switch (event.data.type) {
					case 'wechat_auth_error':
						message.error(event.data.msg)
						try {
							wechatWindow.value?.close()
							openWechatLogin()
						} catch (error) {
							// console.error('关闭微信窗口失败:', error)
						}
						break
					case 'wechat_auth_complete':
						// eslint-disable-next-line no-case-declarations
						const { code, state } = event.data.data
						wechatWindow.value?.close()
						handleWechatAuth(code, state)
						break
				}
			})
			// 开始监听窗口URL变化
			// startWechatWindowMonitor()
		} else {
			// message.error(res.msg || '获取微信二维码失败')
		}
	} catch (error) {
	} finally {
		qrcodeLoading.value = false
	}
}

/**
 * @description 处理微信授权成功
 */
const handleWechatAuth = async (code: string, state: string) => {
	const load = message.load('正在配置面板用户信息，请稍后...')
	// 调用绑定接口
	try {
		const res = await setWechatBindUser({ code, state })
		if (res.status) {
			message.success('微信绑定成功')
			window.location.href = props.compData?.redirect || '/'
		} else {
			message.error(res.msg || '微信绑定失败')
		}
	} catch (err) {
		console.error('微信绑定失败:', err)
		message.error('微信绑定失败')
	} finally {
		load.close()
	}
}

/**
 * @description 打开弹窗
 */
const onOpen = () => {
	inputFocus(bindUserRef.value.$el, 'username')
}

/**
 * @description 关闭弹窗
 */
const onCancel = () => {
	bindUserRef.value.clearValidate()
	// 清除微信相关监听
	if (checkWindowTimer.value) {
		clearInterval(checkWindowTimer.value)
		checkWindowTimer.value = null
	}
	// 关闭微信窗口
	if (wechatWindow.value && !wechatWindow.value.closed) {
		wechatWindow.value.close()
		wechatWindow.value = null
	}
}

defineExpose({
	onOpen,
	onCancel,
})

onMounted(() => {
	bindUserRef.value?.clearValidate()
	getGlobalInfo()
})

onBeforeUnmount(() => {
	// 清除所有定时器和监听器
	if (clearIntervalVal.value) {
		clearInterval(clearIntervalVal.value)
		clearIntervalVal.value = null
	}
	if (checkWindowTimer.value) {
		clearInterval(checkWindowTimer.value)
		checkWindowTimer.value = null
	}
	// 关闭微信窗口
	if (wechatWindow.value && !wechatWindow.value.closed) {
		wechatWindow.value.close()
		wechatWindow.value = null
	}
})
</script>

<style lang="css" scoped>
.bind-user-info {
	padding: 3rem;
}

.bind-user-info :deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 2.4rem !important;
}

.bind-form :deep(.el-input__inner) {
	height: 3rem;
	line-height: 4rem;
}

:deep(.el-form .el-form-item__content) {
	justify-content: center !important;
}

:deep(.el-divider--horizontal .el-divider__text) {
	background-color: transparent !important;
}

.wechat-login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	position: relative;
}

.wechat-icon-circle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: var(--el-border-radius-circle);
	background-color: var(--el-fill-color);
	transition:
		transform 0.3s ease,
		background-color 0.3s ease;
}

.wechat-icon-circle:hover {
	transform: scale(1.05);
	background-color: var(--el-fill-color-dark);
}

.wechat-icon svg {
	display: inline-block;
	width: 24px;
	height: 24px;
	background-size: contain;
}

.wechat-text {
	margin-top: 8px;
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-secondary);
}

/* 分隔线样式 */
.divider-container {
	display: flex;
	align-items: center;
	margin: 20px 0;
	width: 100%;
}

.divider-line {
	flex: 1;
	height: 1px;
	background-color: var(--el-fill-color);
}

.divider-text {
	padding: 0 15px;
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-tertiary);
}

/* 现代化滑块标签页样式 */
.modern-tabs {
	width: 100%;
	margin-bottom: 2rem;
}

.tabs-container {
	display: flex;
	position: relative;
	background-color: var(--el-fill-color-light);
	border-radius: var(--el-border-radius-base);
	overflow: hidden;
	box-shadow: 0 2px 4px rgba(var(--el-color-black-rgb), 0.05);
	padding: 0.4rem;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 0.8rem 0;
	cursor: pointer;
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
	position: relative;
	z-index: 2;
	transition: color 0.3s ease;
	border-radius: var(--el-border-radius-base);
}

.tab-item.active {
	color: var(--el-color-primary);
	font-weight: 500;
}

.tab-slider {
	position: absolute;
	height: calc(100% - 0.8rem);
	background-color: rgba(var(--el-color-primary-rgb), 0.1);
	border-radius: var(--el-border-radius-base);
	top: 0.4rem;
	left: 0.4rem;
	z-index: 1;
	transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.wechat-login-btn {
	display: flex;
	align-items: center;
	padding: 0.8rem 1.6rem;
	border: 1px solid var(--el-color-primary);
	border-radius: var(--el-border-radius-base);
	cursor: pointer;
	transition: background-color 0.3s ease;
	color: var(--el-color-primary);
}

.wechat-login-btn:hover {
	background-color: rgba(var(--el-color-primary-rgb), 0.1);
}

.loading-text {
	margin-top: 8px;
	font-size: var(--el-font-size-small);
	color: var(--el-color-primary);
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0% {
		opacity: 0.6;
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0.6;
	}
}
</style>
