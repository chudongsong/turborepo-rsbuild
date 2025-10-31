<template>
	<el-form ref="bindUserInfo" size="medium" :rules="rules" :model="userInfo" autocomplete="off" class="bind-user-info" :class="{ 'bind-form': compData?.dependencies.title ? true : false }">
		<div v-show="bindType === 1">
			<el-form-item class="text-center !mb-5 flex justify-center">
				<div class="flex !justify-center !w-full items-center">
					<h3 class="text-extraLarge text-default inline-block mr-2 font-bold mt-12x">
						{{ compData?.dependencies.title || '切换宝塔官网账号' }}
					</h3>
					<el-popover placement="top-start" width="200" trigger="hover" content="宝塔面板许多功能都依赖于官网，绑定仅限于为您提供更好的面板服务体验，不涉及您服务器任何敏感信息，请放心使用。" class="inline-block relative -top-1.5">
						<template #reference>
							<a class="bt-ico-ask align-middle" href="javascript:;">?</a>
						</template>
					</el-popover>
				</div>
			</el-form-item>

			<el-form-item
				:key="1"
				prop="username"
				:class="{
					'!mb-[3rem]': compData?.dependencies.title ? true : false,
				}">
				<el-input v-model="userInfo.username" clearable required name="username" autocomplete="off" class="!leading-[4rem] !h-[4rem]" placeholder="宝塔官网账号" :disabled="formDisabled.username" @keyup.enter="bindBtUser()"></el-input>
				<span v-if="compData?.dependencies.title && showError" class="absolute el-form-item__error">
					<span>请使用宝塔官网登录账号进行登录，若未有账号，可进行</span>
					<BtLink class="!text-small" href="https://www.bt.cn/register"> 免费注册 </BtLink>
				</span>
			</el-form-item>
			<el-form-item :key="2" prop="password">
				<el-input v-model="userInfo.password" clearable required type="password" name="password" class="!leading-[4rem] !h-[4rem]" autocomplete="off" placeholder="密码" :show-password="true" :disabled="formDisabled.password" @keyup.enter.native="bindBtUser()"></el-input>
			</el-form-item>

			<el-form-item v-show="isCheck" prop="code">
				<el-input v-model="userInfo.code" clearable autocomplete="off" placeholder="验证码" type="text" @keyup.enter.native="bindBtUser()">
					<template #append>
						<el-button class="relative top-0 rounded-none rounded-r-base" type="primary" size="default" :disabled="formDisabled.code" plain @click="getVerifyCode">{{ tipsText }}</el-button>
					</template>
				</el-input>
			</el-form-item>
			<el-button type="primary" class="w-[100%] mt-[1.2rem]" size="default" @click="bindBtUser()">{{ compData?.dependencies.btn || (compData?.dependencies.title ? '绑定账号' : '切换账号') }}</el-button>
			<div class="flex justify-end items-center text-small mt-[1rem]">
				<bt-link href="https://www.bt.cn/register">注册账号</bt-link>
				<bt-divider></bt-divider>
				<bt-link href="https://www.bt.cn/login.html?page=reset">忘记密码</bt-link>
				<bt-divider></bt-divider>
				<bt-link href="https://www.bt.cn/bbs">问题反馈</bt-link>
			</div>
		</div>
		<!-- :class="`${compData?.dependencies.title ? 'min-h-[17.4rem]' : 'min-h-[24.4rem]'}`" -->
		<div v-show="bindType === 2">
			<div v-if="!compData?.dependencies.title" class="view-con" :style="compData?.dependencies.title ? '' : 'background:var(--el-color-white);'">
				<div class="app-box" :style="compData?.dependencies.title ? '' : 'background:var(--el-color-white);'">
					<img alt="" src="/static/images/other/bt_logo_new.png" />
				</div>
				<div class="change-icon">
					<svg t="1729493717851" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19919" width="200" height="200">
						<path
							d="M914.618182 477.090909H546.909091V109.381818c0-18.618182-16.290909-34.909091-34.909091-34.909091s-34.909091 16.290909-34.909091 34.909091v367.709091H109.381818c-18.618182 0-34.909091 16.290909-34.909091 34.909091s16.290909 34.909091 34.909091 34.909091h367.709091v367.709091c0 18.618182 16.290909 34.909091 34.909091 34.909091s34.909091-16.290909 34.909091-34.909091V546.909091h367.709091c18.618182 0 34.909091-16.290909 34.909091-34.909091s-16.290909-34.909091-34.909091-34.909091z"
							fill="var(--el-color-text-tertiary)"
							p-id="19920"></path>
					</svg>
				</div>
				<div class="app-box" :style="compData?.dependencies.title ? '' : 'background:var(--el-color-white);'">
					<div class="ali-icon"></div>
				</div>
			</div>
			<div
				:class="{
					'bg-light': compData?.dependencies.title,
					'rounded-base': compData?.dependencies.title,
				}"
				:style="{
					border: compData?.dependencies.title ? '1px solid #ddd' : 'none',
					'padding-top': compData?.dependencies.title ? '2rem' : '0',
				}">
				<div v-if="compData?.dependencies.title" class="view-con" style="background: var(--el-color-white)">
					<div class="app-box" style="background: var(--el-color-white)">
						<img alt="" src="/static/images/other/bt_logo_new.png" />
					</div>
					<div class="change-icon">
						<svg t="1729493717851" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19919" width="200" height="200">
							<path
								d="M914.618182 477.090909H546.909091V109.381818c0-18.618182-16.290909-34.909091-34.909091-34.909091s-34.909091 16.290909-34.909091 34.909091v367.709091H109.381818c-18.618182 0-34.909091 16.290909-34.909091 34.909091s16.290909 34.909091 34.909091 34.909091h367.709091v367.709091c0 18.618182 16.290909 34.909091 34.909091 34.909091s34.909091-16.290909 34.909091-34.909091V546.909091h367.709091c18.618182 0 34.909091-16.290909 34.909091-34.909091s-16.290909-34.909091-34.909091-34.909091z"
								fill="var(--el-color-text-tertiary)"
								p-id="19920"></path>
						</svg>
					</div>
					<div class="app-box" style="background: var(--el-color-white)">
						<div class="ali-icon"></div>
					</div>
				</div>
				<el-form-item
					class="!mb-5 flex justify-center"
					:class="{
						'p-[2.5rem]': compData?.dependencies.title,
						'!pt-0': compData?.dependencies.title,
					}">
					<el-divider></el-divider>
					<h3 class="text-base w-full text-secondary inline-block font-bold">阿里云用户专享特权：</h3>
					<h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1rem] flex items-center">
						<span class="svgtofont-el-check text-primaryDark font-bold mr-[.5rem]"></span>
						免费使用原本需要付费的功能：
					</h3>
					<h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1rem] ml-[1.9rem] flex items-center">
						<img :src="`/static/img/soft_ico/ico-msg_push.png`" class="w-[2rem] mr-[1rem]" />
						异常监控推送
					</h3>
					<!-- <h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1rem] ml-[1.9rem] flex items-center">
						<img :src="`/static/img/soft_ico/ico-btapp.png`" class="w-[2rem] mr-[1rem]" />
						堡塔app
					</h3> -->
					<h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1.5rem] flex items-center">
						<span class="svgtofont-el-check text-primaryDark font-bold mr-[.5rem]"></span>
						宝塔官方付费软件均享额外折扣
					</h3>
				</el-form-item>
				<el-button type="primary" class="w-[85%] mt-[4rem] relative left-[7.5%]" style="margin: 1rem auto 0" size="default" @click="goOtherLogin">一键激活专享特权</el-button>
				<div class="w-[100%] mt-[1.2rem] flex items-center justify-center text-primary" size="default">
					<span class="cursor-pointer hover:text-primaryDark" @click="changeBindType(1)">已有宝塔账号登录</span>
				</div>
				<div v-if="compData?.dependencies.title" class="flex justify-end items-center text-small mt-[1rem] h-[1.68rem]"></div>
			</div>
		</div>
		<template v-if="bindType === 1 && loginAuth">
			<div>
				<div class="more-title">
					<span>更多绑定方式</span>
				</div>
				<div class="more-bind">
					<div v-show="bindType === 1" class="bind-box" @click="changeBindType(2)">
						<i class="tencent_ico"></i>
						阿里云账号
					</div>
					<!-- <div v-show="bindType === 2" class="bind-box" @click="bindType = 1">
						<i class="bt_ico"></i>
						宝塔官网账号
					</div> -->
				</div>
			</div>
		</template>
	</el-form>
</template>

<script lang="ts" setup>
// import { isUndefined, inputFocus, rsaEncrypt, isDev } from '@/utils'
import { bindBtUserName, getBindCode, tencentLogin, setAxios, checkAliyunLoginAuth } from '../api'
// import { useMessage } from '@/hooks/tools'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: null,
})

const { BtLink, BtDivider, BtImage, ElForm, ElFormItem, ElPopover, ElInput, ElButton } = unref(props.compData.dependencies.components)

const { Message, isUndefined, inputFocus, rsaEncrypt, useAxios } = unref(props.compData.dependencies.hooks)

setAxios(useAxios)

const emit = defineEmits(['close'])

const isCheck = ref(false) // 是否验证码验证
const tipsText = ref('获取验证码') // 获取验证码按钮文字
const userInfo = reactive({ username: '', password: '', code: '' }) // 用户登录数据
const formDisabled = reactive({ username: false, password: false, code: false }) // 表单禁用状态
const userToken = ref('') // 用户登录Token
const clearIntervalVal = ref<any>(0) // 定时器状态
const bindUserInfo = ref<any>() // 表单实例

const showError = ref(false) // 是否显示错误信息

const bindType = ref(1) // 选择绑定类型   1宝塔账号     2第三方账号

// 表单规则
const rules = ref({
	username: [
		// { required: true, message: '请输入宝塔官网账号', trigger: ['blur', 'change'] },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (props.compData?.dependencies.title) showError.value = false
				if (/^1[3456789]\d{9}$/.test(value)) {
					callback()
				} else if (value === '') {
					callback(new Error('请输入宝塔官网账号'))
				} else {
					if (props.compData?.dependencies.title) {
						showError.value = true
						callback(new Error(' '))
						return
					}
					callback(new Error(' 请输入正确的手机号 '))
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
const bindBtUser = async () => {
	await bindUserInfo.value.validate()
	const info: any = { ...userInfo }
	// 验证验证码是否为空
	if (isCheck.value) {
		if (!userInfo.code) {
			return Message.error('请输入验证码')
		}
		info.token = userToken.value
		delete info.password
	} else {
		delete info.code
	}
	const loading = Message.load('绑定堡塔账号，请稍候 ...')
	try {
		info.username = rsaEncrypt(info.username)
		info.password = rsaEncrypt(info.password)
		const rdata = await bindBtUserName({ ...info })
		Message.request(rdata)
		if (rdata.status) {
			window.location.reload()
			emit('close')
			return
		}
		if (isUndefined(rdata.data)) return false
		if (!rdata.status && JSON.stringify(rdata.data) === '[]') return Message.request(rdata)
		// 判断是否存在
		if (rdata.data.code === -1) {
			userToken.value = rdata.data.token // 获取Token
			isCheck.value = true // 显示验证码
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
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
const getOtherLoginInfo = async (event: any) => {
	const params = JSON.parse(event.data)
	let load: any
	try {
		load = Message.load('正在绑定中......')
		const { data } = await tencentLogin({ ...params, client: 1 })
		if (data.success) {
			window.removeEventListener('message', handelMessage)
			window.location.href = '/'
		} else {
			load.close()
			Message.error(data.res)
			;(popup as Window).parent.postMessage({ msg: data.res || data.msg, success: false }, '*')
		}
	} catch (error) {
		load?.close()
	}
}
/**
 * @description 阿里云直接登录
 */
const goOtherLogin = async () => {
	let load: any
	try {
		load = Message.load('正在绑定中......')
		const { data } = await tencentLogin({ client: 2 })
		if (data.status || data.success) {
			window.location.href = '/'
		} else {
			load.close()
			Message.error(data.msg || data.res)
		}
	} catch (error) {
		load?.close()
	}
}
let popup: Window | null = null
/**
 * @description message事件处理
 * @param {Event} e
 */
const handelMessage = (e: any) => {
	// 授权成功
	if (typeof e.data === 'string' && JSON.parse(e.data).code) {
		getOtherLoginInfo(e)
	}
}

/**
 * @description 获取验证码
 */
const getVerifyCode = async () => {
	if (!userInfo.username || !userInfo.password) return Message.error('请先输入手机号和密码')
	formDisabled.username = true
	formDisabled.password = true
	countDown(60) // 设置倒计时
	const rdata = await getBindCode({ username: userInfo.username, token: userToken.value })
	Message.request(rdata)
}

/**
 * @description 打开弹窗
 */
const onOpen = () => {
	inputFocus(bindUserInfo.value.$el, 'username')
}

/**
 * @description 关闭弹窗
 */
const onCancel = () => {
	bindUserInfo.value.clearValidate()
}

const loginAuth = ref(false) // 是否有一键登录权限
// 判断是否有一键登录权限
const checkLoginAuth = async () => {
	try {
		const res = await checkAliyunLoginAuth()
		if (res.status) {
			loginAuth.value = res.data.client === 2 && res.data.login === 1
			if (res.data.client === 2 && res.data.login === 1) {
				changeBindType(2)
			} else {
				changeBindType(1)
			}
		} else {
			changeBindType(1)
		}
	} catch (error) {
		changeBindType(1)
	}
}

/**
 * @description 切换绑定类型
 * @param {number} type
 */
const changeBindType = (type: number) => {
	bindType.value = type
	if (props.compData?.dependencies.onChangeType) {
		props.compData.dependencies.onChangeType(type === 1 ? 'bind' : 'other')
	}
}

defineExpose({
	onOpen,
	onCancel,
})

onMounted(() => {
	checkLoginAuth()
	// changeBindType(2)
	bindUserInfo.value?.clearValidate()
	// if (isTencent.value) {
	// 	// 判断是否为第三方专属
	// 	bindType.value = 2
	// }
})
</script>

<style lang="css" scoped>
.bind-user-info {
	@apply px-32x py-4.6rem p-12;
}
:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 2.4rem !important;
}
.bind-form :deep(.el-input--medium .el-input__inner) {
	@apply h-4rem leading-4rem;
}
.more-title {
	@apply flex items-center justify-center relative mt-[3rem];
}
.more-title:after {
	@apply content-[''] border-b-[1px] border-solid border-light w-[100%] absolute top-1/2 left-0 z-0;
}
.more-title span {
	@apply px-1rem text-black z-10;
}
.view-con {
	@apply flex justify-center items-center bg-light mb-[1.2rem];
}
.app-box {
	@apply w-[5rem] h-[5rem] bg-light text-center;
}
/* img,
svg {
	@apply w-full h-full inline-block;
} */
.change-icon {
	@apply w-[14rem] flex items-center justify-center;
}
.change-icon svg {
	@apply w-[2rem];
}
:deep(.el-divider--horizontal) {
	margin: 12px 0;
}
.ali-icon {
	width: 100%;
	height: 100%;
	background-size: 100% 100%;
	background-image: url('data:image/png;base64,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');
}
.more-bind {
	@apply flex py-[1rem] justify-center items-center;
}
.more-bind .bind-box {
	@apply flex items-center cursor-pointer;
}
.more-bind .bind-box:hover {
	@apply text-primary;
}
.tencent_ico {
	display: inline-block;
	height: 25px;
	width: 25px;
	margin-right: 10px;
	background-size: cover;
	background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCI+PHBhdGggZmlsbD0iI0ZGNkEwMCIgZD0iTTUxMiA2NGE0NDggNDQ4IDAgMSAxIDAgODk2IDQ0OCA0NDggMCAwIDEgMC04OTYiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMzI0LjggNjAyLjYyNGEyNi43NTIgMjYuNzUyIDAgMCAxLTIxLjMxMi0yNS45MnYtMTQyLjcyQTI3LjcxMiAyNy43MTIgMCAwIDEgMzI0Ljg2NCA0MDhsMTMyLjQxNi0yOC42NzIgMTMuOTUyLTU2Ljg5NmgtMTUzLjkyYTk3LjYgOTcuNiAwIDAgMC05OC4yNCA5Ni45NnYxNjkuMzQ0Yy4zODQgNTQuMDggNDQuMTYgOTcuODU2IDk4LjI0IDk4LjE3NmgxNTMuOTJMNDU3LjM0NCA2MzAuNHptMzg1LjYtMjgwLjE5MmM1NC4wMTYuMTI4IDk3LjkyIDQzLjU4NCA5OC41NiA5Ny42djE3MC4xNzZhOTguMzY4IDk4LjM2OCAwIDAgMS05OC41NiA5OC4wNDhINTU1LjMyOGwxNC4wOC01Ni44MzIgMTMyLjYwOC0yOC43MzZhMjcuODQgMjcuODQgMCAwIDAgMjEuMzc2LTI1Ljkydi0xNDIuNzJhMjYuODggMjYuODggMCAwIDAtMjEuMzc2LTI1Ljk4NGwtMTMyLjU0NC0yOC44LTE0LjA4LTU2LjgzMnpNNTcwLjM2OCA0OTcuOTJ2MTMuOTUySDQ1Ny4yOFY0OTcuOTJ6Ii8+PC9zdmc+);
}
.bt_ico {
	display: inline-block;
	height: 25px;
	width: 25px;
	margin-right: 10px;
	background-size: cover;
	background-image: url(data:image/png;base64,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);
}
:deep(.el-form-item__content) {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	line-height: 32px;
	position: relative;
}
</style>
