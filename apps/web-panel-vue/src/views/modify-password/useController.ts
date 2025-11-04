import { useConfirm, useMessage } from '@/hooks/tools/index'
import { setPassword, setlastPassword } from '@api/global'
import { getRandomPwd, refreshBrowser, rsaEncrypt } from '@utils/index'

const { load: $load, request: $request } = useMessage() // 消息提示

// 表单数据
export const modifyPawForm = reactive({
	password1: '',
	password2: '',
})
/**
 * @description 修改密码
 */
export const modifyPassword = async () => {
	let loading: any = $load('正在设置面板密码，请稍候...')
	try {
		const rdata = await setPassword({
			password1: rsaEncrypt(modifyPawForm.password1),
			password2: rsaEncrypt(modifyPawForm.password2),
		})
		$request(rdata)
		rdata.status && refreshBrowser('/login?dologin=True', 1500)
		return rdata.status
	} catch (error) {
		console.error(error)
	} finally {
		loading.close()
	}
}

// 表单验证规则
export const refreshPwd = () => {
	modifyPawForm.password1 = getRandomPwd(10)
}

/**
 * @description 延用上一次密码
 */
export const handleSetlastPassword = async () => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '危险操作',
			isHtml: true,
			content: '延用上次密码会降低面板的<span class="text-danger">安全性</span>，是否继续操作？',
		})
		const res = await setlastPassword()
		$request(res)
		window.location.href = '/'
	} catch (error) {
		console.error(error)
	}
}
