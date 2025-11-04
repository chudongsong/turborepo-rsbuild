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
				<el-input v-model="userInfo.username" clearable required class="!leading-[4rem] !h-[4rem]" name="username" autocomplete="off" placeholder="宝塔官网账号" :disabled="formDisabled.username" @keyup.enter="bindBtUser()"></el-input>
				<span v-if="compData?.dependencies.title && showError" class="absolute el-form-item__error">
					<span>请使用宝塔官网登录账号进行登录，若未有账号，可进行</span>
					<BtLink class="!text-small" href="https://www.bt.cn/register"> 免费注册 </BtLink>
				</span>
			</el-form-item>
			<el-form-item :key="2" prop="password">
				<el-input v-model="userInfo.password" clearable required type="password" class="!leading-[4rem] !h-[4rem]" name="password" autocomplete="off" placeholder="密码" :show-password="true" :disabled="formDisabled.password" @keyup.enter.native="bindBtUser()"></el-input>
			</el-form-item>

			<el-form-item v-show="isCheck" prop="code">
				<el-input v-model="userInfo.code" clearable autocomplete="off" placeholder="验证码" type="text" @keyup.enter.native="bindBtUser()">
					<template #append>
						<el-button class="relative top-0 rounded-none rounded-r-base" type="primary" size="default" :disabled="formDisabled.code" plain @click="getVerifyCode">{{ tipsText }}</el-button>
					</template>
				</el-input>
			</el-form-item>
			<el-button class="w-[100%] mt-[1.2rem]" type="primary" size="default" @click="bindBtUser()">{{ compData?.dependencies.btn || (compData?.dependencies.title ? '绑定账号' : '切换账号') }}</el-button>
			<div class="flex justify-end items-center text-small mt-[1rem]">
				<bt-link href="https://www.bt.cn/register">注册账号</bt-link>
				<bt-divider></bt-divider>
				<bt-link href="https://www.bt.cn/login.html?page=reset">忘记密码</bt-link>
				<bt-divider></bt-divider>
				<bt-link href="https://www.bt.cn/bbs">问题反馈</bt-link>
			</div>
		</div>
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
					<div class="tencent-icon"></div>
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
						<div class="tencent-icon"></div>
					</div>
				</div>
				<el-form-item
					v-if="!tencentLoginAuth"
					class="!mb-5 flex justify-center"
					:class="{
						'p-[2.5rem]': compData?.dependencies.title,
						'!pt-0': compData?.dependencies.title,
					}">
					<el-divider></el-divider>
					<h3 class="text-base w-full text-secondary inline-block font-bold">腾讯云用户专享特权：</h3>
					<h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1rem] flex items-center">
						<span class="svgtofont-el-check text-primaryDark font-bold mr-[.5rem]"></span>
						免费使用原本需要付费的功能：
					</h3>
					<h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1rem] ml-[1.9rem] flex items-center location-con">
						<img :src="`/static/img/soft_ico/ico-msg_push.png`" class="w-[2rem] mr-[1rem]" />
						异常监控推送
					</h3>
					<!-- <h3
						class="text-small leading-[1] w-full text-tertiary inline-block mt-[1rem] ml-[1.9rem] flex items-center">
						<img
							:src="`/static/img/soft_ico/ico-btapp.png`"
							class="w-[2rem] mr-[1rem]" />
						堡塔app
					</h3> -->
					<h3 class="text-small leading-[1] w-full text-tertiary inline-block mt-[1.5rem] flex items-center">
						<span class="svgtofont-el-check text-primaryDark font-bold mr-[.5rem]"></span>
						宝塔官方付费软件均享额外折扣
					</h3>
				</el-form-item>
				<el-form-item
					v-if="tencentLoginAuth"
					class="!mb-0 flex justify-center"
					:class="{
						'p-[2.5rem]': compData?.dependencies.title,
						'!pt-0': compData?.dependencies.title,
					}">
					<el-divider></el-divider>
					<h3 class="text-base w-full text-secondary inline-block font-bold text-center">腾讯云账号绑定</h3>
					<div class="w-full mt-[1.5rem]">
						<ElInput v-model="otherBindForm.uin" size="large" clearable name="uin" autocomplete="off" placeholder="请输入腾讯云账号ID"></ElInput>
					</div>
					<div class="w-full mt-[1.5rem]">
						<ElInput v-model="otherBindForm.order" size="large" clearable name="order" autocomplete="off" placeholder="请输入腾讯云市场订单号" @keyup.enter.native="bindOtherUser"></ElInput>
					</div>
				</el-form-item>
				<el-button type="primary" class="w-[85%] mt-[4rem] relative left-[7.5%]" style="margin: 1rem auto 0" size="default" @click="goOtherLogin">{{ loginAuth ? '一键激活专享特权' : '绑定腾讯云账号' }}</el-button>
				<div class="w-[100%] mt-[1.2rem] flex items-center justify-center text-primary" size="default">
					<span class="cursor-pointer hover:text-primaryDark" @click="changeBindType(1)">已有宝塔账号登录</span>
				</div>
				<div v-if="compData?.dependencies.title" class="flex justify-end items-center text-small mt-[1rem] h-[1.68rem]"></div>
			</div>
		</div>
		<template v-if="bindType === 1 && (loginAuth || tencentLoginAuth)">
			<div>
				<div class="more-title">
					<span>更多绑定方式</span>
				</div>
				<div class="more-bind">
					<div v-show="bindType === 1" class="bind-box" @click="checkLoginAuth(2)">
						<i class="tencent_ico"></i>
						腾讯云账号
					</div>
				</div>
			</div>
		</template>
	</el-form>
</template>

<script lang="ts" setup>
import { setInstance, bindBtUserName, getBindCode, tencentLogin, checkTencentLoginAuth, getTencentURL } from '../api'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { BtLink, BtDivider, ElForm, ElFormItem, ElPopover, ElInput, ElButton } = unref(props.compData.dependencies.components)

const { Message: message, isUndefined, inputFocus, rsaEncrypt, useAxios } = unref(props.compData.dependencies.hooks)

setInstance(useAxios)

const isCheck = ref(false) // 是否验证码验证
const tipsText = ref('获取验证码') // 获取验证码按钮文字
const userInfo = reactive({ username: '', password: '', code: '' }) // 用户登录数据
const formDisabled = reactive({ username: false, password: false, code: false }) // 表单禁用状态
const userToken = ref('') // 用户登录Token
const clearIntervalVal = ref(0) // 定时器状态
const bindUserInfo = ref<any>() // 表单实例

const showError = ref(false) // 是否显示错误信息

const bindType = ref(1) // 选择绑定类型   1宝塔账号     2第三方账号

const otherBindForm = reactive({
	order: '', // 腾讯云订单号
	uin: '', // 腾讯云uin
})

// 表单规则
const rules = ref({
	username: [
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
	bindUserInfo.value.validate(async (valid: boolean) => {
		if (valid) {
			const info: any = { ...userInfo }
			// 验证验证码是否为空
			if (isCheck.value) {
				if (!userInfo.code) {
					return message.error('请输入验证码')
				}
				info.token = userToken.value
				delete info.password
			} else {
				delete info.code
			}
			const loading = message.load('绑定堡塔账号，请稍候 ...')
			try {
				info.username = await rsaEncrypt(info.username)
				info.password = await rsaEncrypt(info.password)
				const rdata = await bindBtUserName({ ...info })
				message.request(rdata)
				if (rdata.status) return window.location.reload()
				if (isUndefined(rdata.data)) return false
				if (!rdata.status && JSON.stringify(rdata.data) === '[]') return message.request(rdata)
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
		} else {
			return false
		}
	})
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
const loginErrorNum = ref(3) // 一键登录错位倒计时
let timer: any = null
let popup: Window | null = null
const getOtherLoginInfo = async (event: any) => {
	const params = JSON.parse(event.data)
	let load: any
	try {
		load = message.load('正在绑定中......')
		const { data } = await tencentLogin({ ...params, client: 1 })
		if (data.success || data.status) {
			window.removeEventListener('message', handelMessage)
			window.location.href = '/'
		} else {
			load.close()
			message.error(data.res || String(data.msg))
			popup.parent.postMessage({ msg: data.res || data.msg, success: false }, '*')
		}
	} catch (error) {
		load?.close()
	}
}
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
 * @description 绑定腾讯云账号
 */
const bindOtherUser = async () => {
	if (otherBindForm.order) {
		const params = {
			client: 1, // 1腾讯云
			order_no: otherBindForm.order,
			uin: otherBindForm.uin,
		}
		const res = await getTencentURL(params)
		if (res.status && typeof res.data.data === 'string') {
			openOrderFrom(res.data.data)
		} else {
			message.error(res.data.res || res.data.msg || res.data.data)
		}
	} else if (!otherBindForm.uin) {
		message.error('请输入腾讯云账号ID')
	} else {
		message.error('请输入订单号')
	}
}
const openOrderFrom = (url: string) => {
	const screenWidth = window.screen.width
	const screenHeight = window.screen.height
	const left = (screenWidth - 600) / 2
	const top = (screenHeight - 800) / 2
	window.removeEventListener('message', handelMessage)
	window.addEventListener('message', handelMessage)
	if (popup) popup.close()
	popup = window.open(
		url,
		// 'https://www.bt.cn/test_5DdFWH7HYZGceps7dascAWPhTYRbmLpe/test/ten.html?need_order=1',
		// 'https://www.qcloud.com/open/authorize?scope=login&app_id=100038317984&redirect_url=https%3A%2F%2Fwww.bt.cn%2Ftest_5DdFWH7HYZGceps7dascAWPhTYRbmLpe%2Ftest%2Ften.html&state=311d5f9e9bd00c8321b23fb7a15381c9',
		'popup', // 窗口名称
		`width=600,height=800,left=${left},top=${top},noopener,noreferrer` // 窗口特性
	)
	if (!popup) {
		message.error('授权弹窗被浏览器阻止，请允许弹窗以继续操作。')
	}
}
/**
 * @description 腾讯云直接登录
 */
const goOtherLogin = async () => {
	if (tencentLoginAuth.value) {
		// 订单号绑定
		bindOtherUser()
		return
	}
	let load: any
	try {
		loginErrorNum.value = 3
		timer && clearInterval(timer)
		load = message.load('正在绑定中......')
		const { data } = await tencentLogin({ client: 1 })
		if (data.status || data.success) {
			window.location.href = '/'
		} else {
			load.close()
			const errorText = data.msg || data.res
			const con = document.querySelector('.location-con')
			let offset = 16
			if (con) {
				const rect = con.getBoundingClientRect()
				const top = rect.top + window.scrollY // 加上滚动距离
				offset = top - 50
			}
			message.msg({
				// customClass: 'customMsgDiv',
				customClass: props.compData?.dependencies.title ? 'customMsgDiv' : '',
				type: 'warning',
				dangerouslyUseHTMLString: true,
				duration: 3000,
				offset, // 宽度
				// time: 0,
				message: `${errorText}<div style="align-items:center;"><span style="display:inline-block;color:var(--el-color-danger);" class="loginErrorNum">${loginErrorNum.value}</span>秒后切换到宝塔账号登录</div>`,
			})
			setTimeout(() => {
				if (con) {
					const rect = con.getBoundingClientRect()
					const left = rect.left + window.scrollX
					const target = document.querySelector('.customMsgDiv')
					if (target) {
						// target.style.top = `${top - 50}px`
						target.style.left = `${left + 143}px`
						target.style.opacity = `1`
					}
				}
			}, 0)
			timer = setInterval(() => {
				if (loginErrorNum.value <= 1) {
					clearInterval(timer)
					changeBindType(1)
					return
				}
				loginErrorNum.value -= 1
				const loginErrorNumDom = document.querySelector('.loginErrorNum')
				if (loginErrorNumDom) {
					loginErrorNumDom.innerHTML = `${loginErrorNum.value}`
				}
			}, 1000)
		}
	} catch (error) {
		console.log(error)
		load?.close()
	}
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
const loginAuth = ref(false) // 是否有一键登录权限
const tencentLoginAuth = ref(false) // 是否有腾讯云登录权限

// 判断是否有一键登录权限
const checkLoginAuth = async (type?: number) => {
	try {
		if (type === 1) {
			changeBindType(1)
			return
		}
		if (type === 2) {
			changeBindType(2)
			return
		}
		const res = await checkTencentLoginAuth()
		if (res.status) {
			loginAuth.value = res.data.client === 1 && res.data.login === 1
			if (res.data.client === 1 && res.data.login === 1) {
				changeBindType(2)
			} else if (res.data.client === 1 && res.data.login !== 0) {
				// 订单号绑定
				changeBindType(2)
				tencentLoginAuth.value = true
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
checkLoginAuth()
defineExpose({
	onOpen,
	onCancel,
})

onMounted(() => {
	bindUserInfo.value?.clearValidate()
})
</script>

<style scoped>
.bind-user-info {
	padding: 3rem;
	position: relative;
}
:deep(.bind-user-info .el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 2.4rem !important;
}
:deep(.bind-form .el-input--medium .el-input__inner) {
	height: 4rem;
	line-height: 4rem;
}
.more-title {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	margin-top: 3rem;
}
.more-title:after {
	content: '';
	border-bottom: 1px solid var(--el-color-border-dark-tertiary);
	width: 100%;
	position: absolute;
	top: 50%;
	left: 0;
	z-index: 0;
}
.more-title span {
	padding: 0 1rem;
	color: var(--el-color-black);
	z-index: 10;
}
.view-con {
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--el-fill-color);
	margin-bottom: 1.2rem;
}
.view-con .app-box {
	width: 5rem;
	height: 5rem;
	background: var(--el-fill-color);
	text-align: center;
}
.view-con .app-box img,
svg {
	width: 100%;
	height: 100%;
	display: inline-block;
}
.change-icon {
	width: 14rem;
	display: flex;
	align-items: center;
	justify-content: center;
}
.change-icon svg {
	width: 2rem;
}
:deep(.el-divider--horizontal) {
	margin: 12px 0;
}
.tencent-icon {
	width: 100%;
	height: 100%;
	background-size: 100% 100%;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 286.65 207.43'%3E%3Cpath d='M248.41 169.83c-5.11 5-14.21 10.79-29.16 11.3-6.91.23-15 .26-18.67.26h-80.3l57.59-55.94c2.65-2.57 8.61-8.27 13.75-12.9 11.28-10.15 21.43-12.2 28.61-12.13a40.46 40.46 0 0 1 28.18 69.41m19.23-75.5a66.15 66.15 0 0 0-47.31-20c-16.07 0-29.91 5.54-42 15.38-5.27 4.29-10.79 9.42-17.74 16.17-3.45 3.36-103.53 100.46-103.53 100.46a156.54 156.54 0 0 0 18.9 1h125.82c9.69 0 16 0 22.76-.5 15.53-1.13 30.21-6.83 42.07-18.48a66.49 66.49 0 0 0 1.03-94.03' style='fill:%2300a3ff'/%3E%3Cpath d='M106.18 88.09c-11.76-8.81-24.93-13.73-39.86-13.71A66.5 66.5 0 0 0 20 188.44a64.54 64.54 0 0 0 37.05 17.94l25.76-25c-4.16 0-10.14-.07-15.45-.25-14.94-.51-24-6.25-29.15-11.3a40.46 40.46 0 0 1 28.18-69.41c7 0 16.62 2 27.43 11 5.16 4.28 16.62 14.36 21.65 18.89a.62.62 0 0 0 .87 0L134.11 113a.64.64 0 0 0 0-1c-8.53-7.71-20.62-18.5-27.91-23.92' style='fill:%2300c8dc'/%3E%3Cpath d='M227.3 59.36a89.08 89.08 0 0 0-172 16 65.32 65.32 0 0 1 11-.93 64.36 64.36 0 0 1 15 1.76 2.8 2.8 0 0 1 .28.06 63 63 0 0 1 118.98-13.47.58.58 0 0 0 .7.38 76.32 76.32 0 0 1 25.14-2.62c.85.07 1.18-.41.9-1.18' style='fill:%23006eff'/%3E%3C/svg%3E");
}
.more-bind {
	display: flex;
	padding-top: 1rem;
	padding-bottom: 1rem;
	justify-content: center;
	align-items: center;
}

.more-bind .bind-box {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.more-bind .bind-box:hover {
	color: var(--el-color-primary);
}

.more-bind .bind-box .tencent_ico {
	display: inline-block;
	height: 25px;
	width: 25px;
	margin-right: 10px;
	background-size: contain;
	background-repeat: no-repeat;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 286.65 207.43'%3E%3Cpath d='M248.41 169.83c-5.11 5-14.21 10.79-29.16 11.3-6.91.23-15 .26-18.67.26h-80.3l57.59-55.94c2.65-2.57 8.61-8.27 13.75-12.9 11.28-10.15 21.43-12.2 28.61-12.13a40.46 40.46 0 0 1 28.18 69.41m19.23-75.5a66.15 66.15 0 0 0-47.31-20c-16.07 0-29.91 5.54-42 15.38-5.27 4.29-10.79 9.42-17.74 16.17-3.45 3.36-103.53 100.46-103.53 100.46a156.54 156.54 0 0 0 18.9 1h125.82c9.69 0 16 0 22.76-.5 15.53-1.13 30.21-6.83 42.07-18.48a66.49 66.49 0 0 0 1.03-94.03' style='fill:%2300a3ff'/%3E%3Cpath d='M106.18 88.09c-11.76-8.81-24.93-13.73-39.86-13.71A66.5 66.5 0 0 0 20 188.44a64.54 64.54 0 0 0 37.05 17.94l25.76-25c-4.16 0-10.14-.07-15.45-.25-14.94-.51-24-6.25-29.15-11.3a40.46 40.46 0 0 1 28.18-69.41c7 0 16.62 2 27.43 11 5.16 4.28 16.62 14.36 21.65 18.89a.62.62 0 0 0 .87 0L134.11 113a.64.64 0 0 0 0-1c-8.53-7.71-20.62-18.5-27.91-23.92' style='fill:%2300c8dc'/%3E%3Cpath d='M227.3 59.36a89.08 89.08 0 0 0-172 16 65.32 65.32 0 0 1 11-.93 64.36 64.36 0 0 1 15 1.76 2.8 2.8 0 0 1 .28.06 63 63 0 0 1 118.98-13.47.58.58 0 0 0 .7.38 76.32 76.32 0 0 1 25.14-2.62c.85.07 1.18-.41.9-1.18' style='fill:%23006eff'/%3E%3C/svg%3E");
}

.more-bind .bt_ico {
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

.el-message.customMsgDiv {
	opacity: 0;
}
</style>
