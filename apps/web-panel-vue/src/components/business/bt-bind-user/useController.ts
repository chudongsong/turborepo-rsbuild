import { bindBtUserName } from '@/api/global'
import { useGlobalStore } from '@/store/global'
import { useDialog, useMessage } from '@/hooks/tools'
import { isUndefined, rsaEncrypt } from '@/utils'

const message = useMessage()
const { forceLtd, payment, getGlobalInfo } = useGlobalStore()

/**
 * @description 绑定用户请求参数
 */
export const bindUserRequest = async ({ isCheck, userInfo, userToken }: any) => {
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
		if (rdata.status) return forceLtdCheck() // 企业版，赠送提示界面
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
}

/**
 * @description 企业版，赠送提示界面
 * @returns
 */
export const forceLtdCheck = async (redirect = '/') => {
	if (forceLtd.value) {
		await getGlobalInfo()
		if (payment.value.noExceedLimit) return forceDialog() // 企业版，赠送提示界面
		if (payment.value.authExpirationTime > -1 && payment.value.userGive) return window.location.reload() // 刷新页面
		message.warn('当前账号领取企业版次数已达到上线，请购买企业版，正在跳转请稍候...') // 提示购买企业版
		return setTimeout(() => window.location.reload(), 2000)
	}
	window.location.href = redirect
}

/**
 * @description 企业版，赠送提示界面
 */
export const forceDialog = () => {
	useDialog({
		title: false,
		area: ['49', '38'],
		component: () => import('@/components/business/bt-bind-user/ltd-recom-view.vue'),
		close: () => {
			window.location.href = '/'
		},
	})
}
