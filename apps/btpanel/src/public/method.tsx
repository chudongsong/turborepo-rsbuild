import { useGlobalStore } from '@/store/global'
import type { SoftTableRowProps } from '@soft/types.d'

import { isArray, isCurrentRouter, isObject, isString, isUndefined, jumpRouter } from '@/utils'
import { delToken, getPluginAuth, getPluginInfo as getPluginFindInfo } from '@api/global'
import { useRoute } from 'vue-router'

import BtFormItem from '@/components/form/bt-form-item'

import BtAlarmOldSelect from '@/components/business/bt-alarm-old-select/index.vue'
import BtAlarmSelect from '@/components/business/bt-alarm-select/index.vue'
import { getFormKey } from '@/hooks/tools/form/render'
import { has, type } from 'ramda'
import { useConfirm, useMessage } from '@/hooks/tools'
import { router } from '@/router'
// import { status } from '@/views/site/public/service-state/useController'
import { isDark } from '@/utils/theme-config'
import type { ConfirmSubmitProps, PopupFromSubmitProps, BatchConfigProps, BatchResultsProps } from './types'
import { pluginInstallDialog, pluginPopupDialog, productPaymentDialog } from './popup'

interface TimingAsyncListOptions {
	promises: any[]
	callback?: AnyFunction
	delay?: number
	isRouter?: string
	check?: () => boolean
}

// 插件默认参数
interface PluginDefalutOptions {
	pluginName?: string // 软件名称, 非必填, 如果为空则通过pluginInfo获取插件信息
	pluginInfo?: PluginInfoProps | undefined // 软件信息, 非必填, 如果为空则通过name获取插件信息
	name?: string // 软件名称, 非必填, 如果为空则通过pluginInfo获取插件信息，兼容旧版
	softData?: PluginInfoProps | undefined // 软件信息, 非必填, 如果为空则通过name获取插件信息，兼容旧版
	callback?: any // 回调函数
}

interface PluginPayOptions extends PluginDefalutOptions {
	type?: 'ltd' | 'pro' | 'plugin' | 'default'
	source?: number
}
const { payment, pluginInfo: pluginViewInfo, forceLtd, aliyunEcsLtd, resetAuthState } = useGlobalStore()

// 插件信息，继承软件列表项
export interface PluginInfoProps extends SoftTableRowProps {}

// 软件依赖
export interface DependnetProps {
	need: string[]
	selected: string[]
}

const Message = useMessage()

/**
 * @description 轮询处理异步函数
 * @param {AnyFunction[]} remainingPromises  promise数组
 * @param {AnyFunction} callback 回调函数
 * @return {Promise<void>}
 */
export const processPromises = async (remainingPromises: any[], callback?: AnyFunction): Promise<void> => {
	if (remainingPromises.length === 0) return callback && callback(true)
	const [firstPromise, ...restPromises] = remainingPromises
	try {
		const result = await firstPromise()
		if (callback) callback(result)
	} catch (error) {
		console.error('An error occurred:', error)
	}
	return processPromises(restPromises, callback)
}

/**
 * @description 延迟执行异步函数，支持检查函数和路由检测
 * @param {TimingAsyncListOptions} promises promise数组
 * @param {TimingAsyncListOptions} check 检查函数
 * @param {TimingAsyncListOptions} delay 延迟时间
 * @param {TimingAsyncListOptions} isRouter 是否检测路由
 * @param {TimingAsyncListOptions} callback 回调函数
 * @return {Promise<void>}
 */
export const delayExecAsync = async ({ promises, callback, delay, isRouter, check }: TimingAsyncListOptions) => {
	const oldPath = window.location.pathname
	// 延迟处理promise
	const currentPromise = (): Promise<any> => {
		return new Promise(resolve => {
			setTimeout(() => {
				if (!isRouter) isRouter = window.location.pathname
				// 检测路由和检查函数不能同时存在，优先执行检查函数
				if (isRouter && !check) {
					resolve(isCurrentRouter(isRouter, oldPath))
				} else if (check && check()) {
					resolve(true)
				} else {
					resolve(false)
				}
			}, delay || 0)
		})
	}
	const status = await currentPromise()
	if (!status) return callback && callback(true)
	return processPromises(promises, callback)
}

/**
 * @description 轮询异步处理函数
 * @param {AnyFunction} requestFunction 请求函数
 * @param {number} delay 延迟时间
 * @return {void}
 */
export const pollingAsync = (requestFunction: AnyFunction, delay: number = 3000) => {
	const oldPath = window.location.pathname
	let count: number = 0
	let timerId: any = null
	const poll = async () => {
		// 如果路径不匹配，则停止轮询
		const path = window.location.pathname
		if (oldPath.indexOf(path) < 0) {
			if (timerId) clearTimeout(timerId)
			return
		}
		try {
			const res = await requestFunction()
			count = 0
			if (res) {
				clearTimeout(timerId)
				return
			}
			timerId = setTimeout(poll, delay)
		} catch (error) {
			count++
			if (count > 3 && timerId) clearTimeout(timerId)
		}
	}
	poll()
}

/**
 * @description 获取插件信息
 * @param {PluginDefalutOptions} options.pluginName 软件名称，非必填，如果为空则通过pluginInfo获取插件信息。
 * @param {PluginInfoProps} options.pluginInfo 软件信息，非必填，如果为空则通过name获取插件信息。
 * @return {Promise<PluginInfoProps>}
 */
export const getPluginInfo = async (options: PluginDefalutOptions): Promise<PluginInfoProps> => {
	try {
		let { pluginName, pluginInfo } = options
		if (isUndefined(pluginName) && isUndefined(pluginInfo)) {
			Message.error('缺少参数: options.name 或 options.pluginInfo')
			return Promise.reject(new Error('缺少参数: options.name 或 options.pluginInfo'))
		}
		if (isObject(pluginInfo)) return pluginInfo as PluginInfoProps
		if (isString(pluginInfo)) pluginName = pluginInfo as string
		const { data } = await getPluginFindInfo({ sName: pluginName as string })
		pluginInfo = data
		return pluginInfo as PluginInfoProps
	} catch (error) {
		console.log(error)
		return Promise.reject(error)
	}
}

/**
 * @description 检查软件是否支付
 * @param {string} options.pluginName 软件名称，非必填，如果为空则通过pluginInfo获取插件信息。
 * @param {PluginInfoProps} options.pluginInfo 软件信息，非必填，如果为空则通过name获取插件信息。
 * @return {Promise<{ isPay: boolean; type: string }>}
 */
export const checkPluginPay = async (
	options: PluginDefalutOptions
): Promise<{
	isPay: boolean
	type: string
	pluginInfo: string | PluginInfoProps
}> => {
	// 如果是企业版，则直接返回true
	if (payment.value.authType === 'ltd' && payment.value.authExpirationTime > 0)
		return {
			isPay: true,
			type: 'ltd',
			pluginInfo: isObject(options.pluginInfo) ? (options.pluginInfo as PluginInfoProps) : (options.pluginName as string),
		}
	// 获取插件信息
	const pluginInfo = await getPluginInfo(options)
	const { endtime, type } = pluginInfo as PluginInfoProps
	// 判断插件是否为专业版，且授权时间大于0
	if (payment.value.authType === 'pro' && payment.value.authExpirationTime > 0 && type === 8)
		return {
			isPay: true,
			type: 'pro',
			pluginInfo: pluginInfo as PluginInfoProps,
		}
	// 判断插件购买情况 专业版 企业版 永久专业版
	if (endtime >= 0)
		return {
			isPay: true,
			type: 'plugin',
			pluginInfo: pluginInfo as PluginInfoProps,
		}
	// 其他情况，返回false
	return {
		isPay: false,
		type: 'free',
		pluginInfo: pluginInfo as PluginInfoProps,
	}
}

/**
 * @description 打开产品支付视图
 * @param {PluginPayOptions} options.type 支付类型，非必填，默认default，ltd-企业版、pro-专业版、plugin-插件、default-默认，包含ltd、pro、ltd。
 * @param {PluginPayOptions} options.source 支付来源，非必填，默认22
 * @param {PluginPayOptions} options.pluginName 插件名称，非必填，如果为空则通过pluginInfo获取插件信息。
 * @param {PluginPayOptions} options.pluginInfo 插件信息，非必填，如果为空则通过name获取插件信息。
 */
export const openProductPayView = async ({ type = 'ltd', source = 0, pluginName, pluginInfo }: PluginPayOptions) => {
	console.log(type, source, pluginName, pluginInfo)
}

/**
 * @description 打开其他产品支付视图
 * @param {any} row 行数据
 */
export const openOtherProductPayView = async (row: any) => {
	console.log(row)
}

/**
 * @description 打开插件安装视图
 * @param {PluginDefalutOptions} options.pluginName 软件名称，非必填，如果为空则通过pluginInfo获取插件信息。
 * @param {PluginInfoProps} options.pluginInfo 软件信息，非必填，如果为空则通过name获取插件信息。
 */
export const openPluginInstallView = async (options: PluginDefalutOptions) => {
	// 获取插件信息
	// const pluginInfo = await getPluginInfo(options)
	// if (pluginInfo.setup) await openPluginInstallView({ pluginInfo })
	console.log(options, '打开插件安装视图')
	await pluginInstallDialog({ ...options, name: options.name || options.pluginInfo.name, type: 'i' })
}

/**
 * @description 打开插件视图，包含支付检测和安装检测
 * @param {PluginPayOptions} options.type 支付类型，非必填，默认default，ltd-企业版、pro-专业版、plugin-插件、default-默认，包含ltd、pro、ltd。
 * @param {PluginPayOptions} options.source 支付来源，非必填，默认22
 * @param {PluginPayOptions} options.pluginName 插件名称，非必填，如果为空则通过pluginInfo获取插件信息。
 * @param {PluginPayOptions} options.pluginInfo 插件信息，非必填，如果为空则通过name获取插件信息。
 */
// eslint-disable-next-line consistent-return
export const openPluginView = async (options: PluginPayOptions) => {
	if (options.name || options.softData) {
		options.pluginName = options?.name || ''
		options.pluginInfo = options?.softData || options.pluginInfo
	}
	// 获取插件信息
	const pluginInfo = await getPluginInfo(options)
	console.log('获取插件信息', pluginInfo)

	// 获取插件支付状态
	const { isPay } = await checkPluginPay({ pluginInfo })
	console.log('获取支付状态', isPay)

	// // 判断是否需要支付，如果不需要支付，则直接打开插件安装视图，仅支持专业版和企业版
	if (!isPay && [8, 12].includes(pluginInfo.type))
		return productPaymentDialog({
			disablePro: pluginInfo.type !== 8,
			compulsionLtd: pluginInfo.type !== 8,
			sourceId: options.source,
			...(options?.plugin ? { pluginInfo } : {}), // 插件信息
		})
	console.log('是否需要支付')
	// 检测插件是否安装
	if (!pluginInfo.setup) return openPluginInstallView({ pluginInfo })
	console.log('是否安装', pluginInfo)

	// 若为环境插件，则直接打开环境插件视图
	const environmentPlugin = ['mysql', 'pureftpd', 'nginx', 'apache', 'tomcat', 'memcached', 'openlitespeed', 'phpmyadmin']
	const isEnvir = environmentPlugin.includes(pluginInfo.name)
	const isPhp = pluginInfo.name.indexOf('php-') !== -1
	if (isEnvir || isPhp) {
		console.log(pluginInfo, '环境插件')
		return pluginPopupDialog({ pluginInfo })
	}

	// 打开插件弹窗前，先判断是否有操作此插件的权限
	const isAuth = await checkPluginAuthType(pluginInfo.name)
	console.log('是否有操作权限', isAuth)
	if (!isAuth) return false

	sessionStorage.setItem(
		'pluginViewInfo',
		JSON.stringify({
			...pluginInfo,
			built: options.pluginInfo ? '1' : '0',
		})
	)

	pluginViewInfo.value.visible = true
	pluginViewInfo.value.id = pluginInfo.name
	pluginViewInfo.value.name = pluginInfo.title
	pluginViewInfo.value.callback = options?.callback || null
}

/**
 * @description 检测插件是否有权限
 */
// eslint-disable-next-line consistent-return
export const checkPluginAuthType = async (name: string) => {
	try {
		const { data } = await getPluginAuth(name)
		console.log('检测插件权限', data)
		if (data.msg && data.msg.indexOf('您无操作此插件的权限') !== -1) {
			Message.request(data)
			return Promise.resolve(false)
		}
		return Promise.resolve(true)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 解绑账号
 * @return {Promise<void>}
 */
export const unbindUser = async () => {
	try {
		if (aliyunEcsLtd.value) return useMessage().error('当前为企业版，无法解绑账号。')
		await useConfirm({
			icon: 'warning-filled',
			title: '解绑宝塔账号',
			width: '35rem',
			content: '解绑宝塔账号后，将无法正常使用面板功能，是否继续操作？',
		})
		const rdata = await delToken()
		resetAuthState()
		Message.request(rdata)
		// 延迟2秒跳转至绑定页面
		if (rdata.status) setTimeout(() => router.push({ name: 'bind-user' }), 2000)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 退出登录
 * @return {Promise<void>}
 */
export const doLogin = async () => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '退出登录',
			content: '退出面板登录，是否继续？',
		})
		setTimeout(() => {
			window.location.href = '/login?dologin=True'
		}, 500)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 检查session中存储的limit值
 */
export const checkSessionLimit = (name: string = 'page') => {
	const route = useRoute()
	if (!name) name = 'page'
	const data = `${route.fullPath.replace(/^\//, '')}/${name}` // 用于存储分页名称
	const pageSize = useSessionStorage<number>(data.toUpperCase(), 0) // 用于存储分页显示条数
	return pageSize
}

/**
 * @description 获取Ace编辑器配置信息
 * @param { string } params.readonly 是否只读 默认false
 */
export const getAceConfig = (
	params: { readonly?: boolean; theme?: string } = {
		readonly: false,
		theme: 'chrome',
	}
) => {
	return {
		mode: 'ace/mode/nginx',
		theme: !isDark.value ? `ace/theme/${params.theme || 'chrome'}` : 'ace/theme/clouds_midnight', // 主题
		wrap: true, // 是否自动换行
		showInvisibles: false, // 是否显示空格
		showFoldWidgets: false, // 是否显示代码折叠线
		useSoftTabs: true, // 是否使用空格代替tab
		tabSize: 2, // tab宽度
		showPrintMargin: false, // 是否显示打印边距
		readOnly: params.readonly, // 是否只读
		fontSize: '12px', // 字体大小
	}
}

/**
 * @description 表单行hook - 告警方式 旧版
 * @param { string } label 标签
 * @param { string } key 表单key
 * @param { object } other.rules 自定义规则 { key: [规则] }
 * @param { object } other.attrs 自定义告警下拉属性
 * @param { function } change change事件
 */
export const FormAlarmOldSelect = (label: string, key: string, other?: { rules?: AnyObject; attrs?: AnyObject }, change?: () => void) => {
	return {
		type: 'custom',
		key,
		rules: other?.rules || {},
		render: (formVal: Ref<AnyObject>) => {
			const keys = getFormKey({ key }, formVal)
			return (
				<BtFormItem label={label} prop={keys}>
					<BtAlarmOldSelect v-model={formVal.value[keys]} {...(other?.attrs || {})} onChange={change} />
				</BtFormItem>
			)
		},
	}
}

/**
 * @description 表单行hook - 告警方式 新版
 * @param { string } label 标签
 * @param { string } key 表单key
 * @param { object } other.rules 自定义规则 { key: [规则] }
 * @param { object } other.attrs 自定义告警下拉属性
 * @param { function } change change事件
 */
export const FormAlarmSelect = (label: string, key: string, other?: { rules?: AnyObject; attrs?: AnyObject }, change?: () => void) => {
	return {
		type: 'custom',
		key,
		rules: other?.rules || {},
		render: (formVal: Ref<AnyObject>) => {
			const keys = getFormKey({ key }, formVal)
			return (
				<BtFormItem label={label} prop={keys} label-width={other?.attrs?.labelWidth}>
					<BtAlarmSelect v-model={formVal.value[keys]} {...(other?.attrs || {})} onChange={change} />
				</BtFormItem>
			)
		},
	}
}

/**
 * @description 通用的表单提交方法
 * @param props.$refs 表单实例
 * @param props.loading 加载方式
 * @param props.confirm 提示内容,可选
 * @param props.request 请求方法，执行函数必须返回Promise
 * @param props.complete 请求成功后的回调,可选
 * @param props.fail 请求失败后的回调，可选
 */
export const onDefaultFormSubmit = ({ $refs, loading, confirm, request, message, complete, fail }: PopupFromSubmitProps) => {
	const popupRef: any = $refs.$root // 弹窗组件实例
	// eslint-disable-next-line no-underscore-dangle
	// if (popupRef?._vnode.tag.indexOf('ElTabs') > -1) popupRef = getPopupInstance(popupRef.$parent) // 表单弹窗实例
	$refs.validate(async (valid: boolean) => {
		if (valid) {
			await onDefaultConfirm({
				confirm,
				loading,
				request,
				message,
				complete,
				fail,
				popup: popupRef,
			})
		} else {
			console.log(valid)
		}
	})
}

/**
 * @description 通用的确认框提交方法
 * @param props.confirm 提示内容,可选
 * @param props.loading 加载方式
 * @param props.request 请求方法，执行函数必须返回Promise
 * @param props.complete 请求成功后的回调,可选
 * @param props.fail 请求失败后的回调，可选
 * @param props.from 表单弹窗实例，用于弹窗使用，非弹窗不需要传
 */
export const onDefaultConfirm = async ({ confirm, loading, request, message, complete, fail, popup }: ConfirmSubmitProps) => {
	// 请求方法
	const loadType = type(loading)
	const confirmType = type(confirm)
	let load: any = null
	let confirmConfig: any = {}

	// 请求方法
	try {
		// 提示确认框
		if (confirmType !== 'Undefined') {
			confirmConfig = confirm
			if (confirmType === 'String') confirmConfig = { message: confirm }
			await useConfirm({
				...{ icon: 'warning', title: '提示', message: confirm },
				...confirmConfig,
			})
		}

		// 加载方式，全局和局部
		if (loadType === 'String') load = Message.load(loading)
		if (loadType === 'Object') {
			if (!popup) {
				load = loading
				load.value = true // 局部加载
			} else {
				const config = loading as any
				if ('value' in config) {
					load = popup.loading(config, '提交中...')
				} else {
					const loadText = config.text || '修改中...'
					load = popup.loading(config.disable, loadText)
				}
			}
		}
		const rdata = await request()
		if (typeof message === 'undefined' || message) Message.request(rdata)
		if (rdata.status && complete) await complete(rdata)
		if (rdata.status && popup) popup.close() // 关闭表单弹窗，仅限弹窗
		if (!rdata.status && fail) await fail(rdata)
	} catch (error) {
		if (fail) await fail(error)
		console.log(error)
	} finally {
		if (load) {
			if (loadType === 'String' || popup) load.close()
			if (loadType === 'Object') load.value = false
		}
	}
}

/**
 * @description 组装批量操作参数
 * @param data 选中的数据
 * @param excludeIds 排除的id
 * @param all 是否全选
 * @param other 其他参数
 * @returns {Object}
 */
export const assembBatchParams = (data: any, excludeIds: Array<number>, all: boolean, other?: BatchConfigProps): any => {
	try {
		// xx_list: [{ id, name }, {}] 数据
		// all: 是否全选所有页内容
		// exclude_ids: 排除的id(是否全选所有后，还需要排除某个网站)
		// 查询当前路由名称
		let params: AnyObject = {
			all: Number(all) || 0,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			exclude_ids: [],
		}
		if (excludeIds && isObject(excludeIds[0])) params.exclude_ids = excludeIds.map((item: any) => item.id)
		else params.exclude_ids = excludeIds

		params.exclude_ids = JSON.stringify(params.exclude_ids)
		if (other && other.params) params = { ...params, ...other.params }

		if (all) return params

		// const route = useRoute()
		const route = router.currentRoute.value
		// console.log(route, '34534')
		const path = route.meta.icon
		// const path = route?.fullPath?.replace(route?.name, '').replaceAll('/', '')
		if (data && isArray(data)) {
			data?.forEach((item: any) => {
				const key = `${path}_list`
				if (!params[key]) params[key] = []
				params[key].push({ id: item.id, [other?.key || 'name']: item[other?.key || 'name'] })
			})
			params[`${path}_list`] = JSON.stringify(params[`${path}_list`])
		} else {
		}

		return params
	} catch (error) {
		console.log(error, assembBatchParams)
	}
}

/**
 * @description 组装批量操作结果
 * @param res
 * @returns
 */
export const assembBatchResults = (res: BatchResultsProps) => {
	try {
		const result = {
			data: [] as Array<AnyObject>,
			msg: res?.msg || '操作成功！',
		}

		// 当是直接返回信息时，直接提示
		if ((!has('data', res) || !res.data) && !has('success', res) && !has('error', res)) {
			if (isArray(res)) {
				result.data = res
			} else {
				Message.request(res)
			}
		} else {
			if (!has('data', res) || !res.data) res.data = { error: res.error || [], success: res.success || [] }
			// 存在附加提示
			result.msg = res.msg || '操作完成！'
			if (isObject(res.data?.error)) {
				res.data.error = Object.entries(res.data.error).map((item: AnyObject) => {
					return { name: item[0], msg: item[1], status: false }
				})
			}
			if (isString(res.data?.success[0])) {
				res.data.success = res.data.success.map((item: AnyObject) => {
					return { name: item, msg: '操作成功！', status: true }
				})
			}

			// 判断success与error中是否存在status状态，没有则添加
			if (res.data?.error.length > 0) {
				res.data.error = res.data.error.map((item: AnyObject) => {
					if (!has('status', item)) item.status = false
					return item
				})
			}
			if (res.data?.success.length > 0) {
				res.data.success = res.data.success.map((item: AnyObject) => {
					if (!has('status', item)) item.status = true
					return item
				})
			}
			result.data = res.data?.error.concat(res.data?.success) as Array<AnyObject>
		}
		return result
	} catch (error) {
		console.log(error, 'assembBatchResults')
	}
}
