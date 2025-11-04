import { addWebdav, getWebdavConf, removeAuth, removeWebdav, setClientMaxBodySize, setNginxAuth, setWebdav } from '@/api/site'
import { Message, useConfirm } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { productPaymentDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { getPathQuota, getXfsDisk, setSiteQuota } from '@api/site'
import { useSiteStore } from '@site/useStore'
import CatalugeSetting from '@site/views/php-model/site-cataluge/cataluge-setting.vue'

const { siteInfo } = useSiteStore()
const { payment, enterpriseRec } = useGlobalStore()
const { authType } = payment.value

export const tabConfig = [
	{
		label: '网站目录',
		name: 'catalugeTab',
		lazy: true,
		render: () => <CatalugeSetting></CatalugeSetting>,
	},
	...(enterpriseRec.value
		? [
				{
					label: '网站配额',
					lazy: true,
					name: 'flowQuota',
					render: () => import('@site/views/php-model/site-cataluge/capacity-quota.vue'),
				},
		  ]
		: []),
	{
		label: 'nginx WebDav',
		lazy: true,
		name: 'nginxWebDav',
		render: () => import('@site/views/php-model/site-cataluge/nginx-web-dav.vue'),
	},
]

export const tabActive = computed(() => {
	return siteInfo.value?.tabName || 'catalugeTab'
})

/****************************nginx webdev******************************/

export const addPopup = ref(false) // 添加端口弹窗
export const webDavStatus = ref(false) // webdav开关状态
export const webDavCreated = ref(false) // webdav创建状态
export const nginxForm = ref({
	auth: false,
	site_name: '',
	site_path: '',
	domain: '',
	status: false,
	user: '',
	pass: '',
	client_max_body_size: '',
})

export const addForm = ref({
	domain: '',
})

/**
 * @description: 获取nginx webdav数据
 */
export const getNginxWebData = async () => {
	try {
		const { data } = await getWebdavConf({ site_name: siteInfo.value.name })
		webDavCreated.value = !data.need_create || false
		webDavStatus.value = data.status
		if (data.need_create) return
		nginxForm.value = Object.assign(nginxForm.value, data)
		nginxForm.value.auth = data.auth ? true : false
		if (data.auth) {
			nginxForm.value.user = data.auth.auth_name
			nginxForm.value.pass = data.auth.auth_value
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description: auth状态改变
 */
export const handleChangeAuth = async (val: boolean | string | number) => {
	nginxForm.value.auth = Boolean(val)
	if (!val) {
		nginxForm.value.user = ''
		nginxForm.value.pass = ''
		useDataHandle({
			loading: '正在设置状态，请稍后...',
			request: removeAuth({ site_name: siteInfo.value.name }),
			message: true,
		})
	}
}

/**
 * @description: 保存auth
 */
export const saveNginxAuthEvent = async () => {
	useDataHandle({
		loading: '正在保存,请稍后...',
		request: setNginxAuth({
			site_name: siteInfo.value.name,
			auth_name: nginxForm.value.user,
			auth_value: nginxForm.value.pass,
		}),
		message: true,
	})
}

/**
 * @description: 改变状态
 * @param val
 */
export const handleChangeStatusEvent = async (val: boolean | number | string) => {
	nginxForm.value.status = !Boolean(val)
	const res: AnyObject = await useDataHandle({
		loading: '正在设置状态,请稍后...',
		request: setWebdav({
			site_name: siteInfo.value.name,
			option: val ? 1 : 0,
		}),
		message: true,
	})
	if (res.status) nginxForm.value.status = Boolean(val)
}

/**
 * @description: 删除webdav
 */
export const delWebDev = async () => {
	const { name } = siteInfo.value
	await useConfirm({
		title: `删除【${name}】webdav`,
		content: `是否删除【${name}】webdav，删除后将不再对域名进行限制?`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除webdav，请稍后...',
		request: removeWebdav({ site_name: name }),
		message: true,
	})
	if (res.status) getNginxWebData()
}

/**
 * @description: 添加webdav
 */
export const onConfirmAdd = async () => {
	const res = await useDataHandle({
		loading: '正在添加,请稍后...',
		request: addWebdav({
			domain: addForm.value.domain,
			site_id: siteInfo.value.id,
		}),
		message: true,
	})
	handleCancelAdd()
	getNginxWebData()
}

export const handleCancelAdd = () => {
	addPopup.value = false
	addForm.value.domain = ''
}

/****************************quota******************************/

export const capsiteInfo = ref() // 表单实例
export const viewLoading = ref(false) // 表单加载状态
export const maskLayer = ref(false) // 遮罩层
export const maskTips = ref([]) // 显示提示

// 校验
export const rules = {
	size: [
		{
			required: true,
			message: '容量不能为空',
			trigger: ['blur'],
		},
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!Number.isInteger(capacityData.size * 1)) {
					callback(new Error('容量必须为整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	alarmSize: [
		{
			required: true,
			message: '触发告警大小不能为空',
			trigger: ['blur'],
		},
		{
			validator: (rule: any, value: any, callback: any) => {
				if (capacityData.status) {
					if (!Number.isInteger(capacityData.alarmNum * 1)) {
						callback(new Error('触发告警大小必须为整数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	alarmNum: [
		{
			required: true,
			message: '告警次数不能为空',
			trigger: ['blur'],
		},
		{
			validator: (rule: any, value: any, callback: any) => {
				if (capacityData.status) {
					if (!Number.isInteger(capacityData.alarmNum * 1)) {
						callback(new Error('告警次数必须为整数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	module: [
		{
			required: true,
			validator: (rule: any, value: any, callback: any) => {
				if (capacityData.status) {
					if (capacityData.module.length === 0) {
						callback(new Error('请选择告警方式'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
}

// 容量参数
export const capacityData = reactive({
	used: 0,
	size: 0,
	status: false,
	alarmSize: 0,
	alarmNum: 0,
	alarmModel: [],
	module: [],
	option: {} as any,
})
export const useSize = ref<number | string>()
export const formDisabled = ref(false) // 表单禁用

/**
 * @description 获取转换单位后的已使用容量
 */
export const useSizeFun = () => {
	if (capacityData.size === 0) {
		useSize.value = '未配置'
		return
	}
	const size = capacityData.size * 1024 * 1024
	if (capacityData.size > 0 && capacityData.used >= size) {
		useSize.value = '当前容量已用完'
		return
	}
	useSize.value = (capacityData.used / 1024 / 1024).toFixed(2) || 0
}

/**
 * @description 初始化数据
 */
export const init = async (data?: any) => {
	viewLoading.value = true
	try {
		maskLayer.value = false
		maskTips.value = []
		let { quota } = data ? data : siteInfo.value
		if (!data) {
			try {
				let { data: res1 }: any = await getXfsDisk({ path: siteInfo.value.path })
				if (!res1.status) {
					maskLayer.value = true
					maskTips.value = res1.msg?.split('\n')
					return
				}

				const res = await getPathQuota({ path: siteInfo.value.path })
				quota = res.data
			} catch (error) {
				useHandleError(error)
			}
		}
		let { quota_storage: quotaStorage, quota_push: quotaPush } = quota
		if (quotaStorage) {
			capacityData.used = quotaStorage.used
			capacityData.size = quotaStorage.size
		}
		if (quotaPush) {
			// 存在module字段时代码配置过告警
			if (typeof quotaPush.module != 'undefined') {
				capacityData.status = quotaPush.status
				capacityData.alarmSize = quotaPush.size
				capacityData.alarmNum = quotaPush.push_count
				capacityData.module = quotaPush.module === '' ? [] : quotaPush.module.split(',')
			}
		}

		useSizeFun() //获取转换单位后的已使用容量
		viewLoading.value = false
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description 提交表单
 */
export const onConfirm = async () => {
	const { path } = siteInfo.value
	if (authType !== 'ltd') {
		// 打开购买弹窗
		productPaymentDialog({
			sourceId: 183,
			disablePro: true,
		})
		return
	}
	let params = {
		path,
		quota_type: 'site',
		quota_push: {
			status: capacityData.status,
			size: Number(capacityData.alarmSize),
			push_count: Number(capacityData.alarmNum),
			module: capacityData.module.join(','),
		},
		quota_storage: {
			size: Number(capacityData.size),
		},
	}
	if (capacityData.status && params.quota_push.module.length === 0) {
		return Message.error('请选择至少一种告警方式')
	}
	// 判定容量配额必须大于触发告警大小
	if (params.quota_storage.size < params.quota_push.size) {
		return Message.error('容量配额必须大于触发告警大小')
	}
	await capsiteInfo.value.validate()
	try {
		formDisabled.value = true
		const res = await setSiteQuota({ data: JSON.stringify(params) })
		if (!res.status) {
			Message.msg({
				dangerouslyUseHTMLString: true,
				message: res.msg,
				type: 'error',
				duration: 0,
				showClose: true,
			}) // 提示错误信息
		} else {
			Message.request(res)
			// refreshActiveList();
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		formDisabled.value = false
	}
}

/**
 * @description: 设置最大上传文件大小
 */
export const saveSize = async () => {
	const load = Message.load('正在设置,请稍后...')
	try {
		const res = await setClientMaxBodySize({
			site_name: siteInfo.value.name,
			client_max_body_size: nginxForm.value.client_max_body_size,
		})
		Message.request(res)
		getNginxWebData()
	} catch (error) {
		console.log(error)
	} finally {
		load.close()
	}
}
