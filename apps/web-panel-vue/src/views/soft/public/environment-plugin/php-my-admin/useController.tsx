import { Message, useDataHandle, useHandleError, useConfirm } from '@/hooks/tools'
import { getPhpVersion, changePhpmyadminSslPort, getPhpmyadminSsl, setPHPMyAdminPass, setPhpmyadminSsl, serviceManage, getPluginInfo, getKey } from '@api/global'
import { imitatePhpAdminForm, imitatePhpAdminPanelForm } from '@utils/index'

export const onPhpService = ref<boolean>(false) // php服务
export const options = ref<any>([]) // php版本
export const phpVersionSelect = ref<string>('') // php版本选择
export const defaultActive = ref<string>('phpService') // 菜单默认展开项
export const phpForm = reactive({
	phpPort: 8888,
	onSSL: true,
	phpSSL: '',
	phpPass: true,
}) // php安全设置

const phpPassOld = ref<boolean>(false)

export const passForm = reactive({
	username: '',
	password: '',
	repass: '',
}) // php密码设置

/**
 * @description 获取php版本
 */
const getPHPVersionEvent = async () => {
	await useDataHandle({
		request: getPhpVersion(),
		data: [Array, options],
	})
}

/**
 * @description 保存php密码
 */
export const savePHPPass = async () => {
	// 判断密码是否小于三位且两次密码输入是否不同
	if (passForm.password.length < 3 || passForm.username.length < 3) {
		Message.error('输入的账号密码需要大于三位')
		return
	}
	if (passForm.password !== passForm.repass) {
		Message.error('两次输入的密码不一致')
		return
	}
	await useDataHandle({
		loading: '正在保存密码，请稍后...',
		request: setPHPMyAdminPass({ ...passForm, siteName: 'phpmyadmin' }),
		message: true,
		success: () => {
			phpPassOld.value = phpForm.phpPass
		},
	})
}

/**
 * @description 获取phpmyadmin ssl
 */
const getPhpSsl = async () => {
	await useDataHandle({
		request: getPhpmyadminSsl(),
		data: {
			status: Boolean,
			port: String,
			auth: Boolean,
		},
		success: res => {
			phpForm.onSSL = res.status
			phpForm.phpSSL = res.port
			phpForm.phpPass = res.auth
			phpPassOld.value = phpForm.phpPass
		},
	})
}

/**
 * @description 修改phpmyadmin ssl端口
 */
export const setSSLPort = async () => {
	await useDataHandle({
		loading: '正在保存SSL端口，请稍后...',
		request: changePhpmyadminSslPort({ port: phpForm.phpSSL }),
		message: true,
	})
}

/**
 * @description 修改php服务状态
 * @param val 选中状态
 */
export const changePHPStatus = async (val: any) => {
	await useConfirm({
		title: '提示',
		icon: 'warning-filled',
		width: '35rem',
		content: `您真的要${!val ? '停止' : '启动'}phpmyadmin服务吗？`,
	})
	await useDataHandle({
		loading: `正在${!val ? '停止' : '启动'}phpmyadmin服务...`,
		request: serviceManage({ name: 'phpmyadmin', type: val ? 'start' : 'stop' }),
		message: true,
	})
}

/**
 * @description 修改php ssl
 */
export const setPhpSSL = async (val: any) => {
	await useDataHandle({
		loading: `正在${val ? '开启' : '关闭'}，请稍后...`,
		request: setPhpmyadminSsl({ v: phpForm.onSSL ? 1 : 0 }),
		message: true,
		success: getPhpSsl,
	})
}

/**
 * @description 保存php配置 -端口+ 版本
 */
export const savePhpVersion = async (obj: any) => {
	await useDataHandle({
		loading: '正在保存配置，请稍后...',
		request: setPHPMyAdminPass(obj),
		message: true,
	})
}

/**
 * @description 打开弹窗
 */
export const onOpen = async () => {
	defaultActive.value = 'phpService'
	try {
		const res = await getPluginInfo({ sName: 'phpmyadmin' })
		onPhpService.value = res.data.status
		phpVersionSelect.value = Array.isArray(res.data.ext.phpversion) ? res.data.ext.phpversion[0] : res.data.ext.phpversion
		phpForm.phpPort = Number(res.data.ext.port)
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 关闭密码访问
 */
export const changePassword = async (val: any) => {
	if (!val && phpPassOld.value) {
		phpForm.phpPass = !val
		await useConfirm({
			title: '提示',
			icon: 'warning-filled',
			content: '您真的要关闭访问认证吗?',
		})
		useDataHandle({
			loading: '正在设置状态，请稍后...',
			request: setPHPMyAdminPass({ password: 'close', siteName: 'phpmyadmin' }),
			message: true,
			success: () => {
				phpForm.phpPass = val
				phpPassOld.value = phpForm.phpPass
			},
		})
	}
}

/**
 * @description 菜单展开项
 * @param item  菜单项
 */
export const handleOpen = (item: any, keyPath: any) => {
	defaultActive.value = item
	if (item == 'phpService') {
		onOpen()
	} else if (item == 'phpVersion') {
		getPHPVersionEvent()
	} else if (item == 'phpSafety') {
		getPhpSsl()
	}
}

export const phpHelpList = [
	{ content: '面板访问需要登录面板后，才能通过面板访问phpMyAdmin' },
	{
		content: '若通过面板为phpMyAdmin开启了密码访问，请使用【通过公共访问】',
	},
	{
		content: '如通过面板访问无响应，请使用通过公共访问进行访问phpmyadmin',
	},
	{
		content: '如访问出现502，请检查php运行是否正常或尝试更换其他php版本进行访问',
	},
	{
		content: '关闭公共访问权限可提升安全性，可到软件商店->phpMyAdmin中关闭',
		class: 'text-danger',
	},
]

/**
 * @description 跳转php界面
 * @param { string } type 操作类型 panel:面板访问 public:公共访问
 */
export const goPhpAdmin = async (type?: string) => {
	try {
		const { data }: any = await getPluginInfo({ sName: 'phpmyadmin' })
		if (type === 'panel') {
			// 面板访问
			if (data?.ext.auth) {
				Message.error('当前phpMyAdmin已开启密码访问，请使用【通过公共访问】进行访问')
				return
			}
			if (data?.setup === 'false') {
				Message.error('当前phpMyAdmin未安装，请先安装phpMyAdmin')
				return
			}
			useDataHandle({
				loading: '正在跳转phpMyAdmin，请稍后...',
				request: getKey({ table: 'config', key: 'mysql_root', id: 1 }),
				success: (res: any) => {
					imitatePhpAdminPanelForm('root', res.data) // 模拟表单提交
				},
			})
		} else {
			//公共访问
			if (data.status) {
				useDataHandle({
					loading: '正在跳转phpMyAdmin，请稍后...',
					request: getKey({ table: 'config', key: 'mysql_root', id: 1 }),
					success: (res: any) => {
						imitatePhpAdminForm('', 'root', res.data, data.ext.url) // 模拟表单提交
					},
				})
			} else {
				Message.error('未开启公共访问权限，请开启后再访问')
			}
		}
	} catch (error) {
		useHandleError(error)
	}
}
