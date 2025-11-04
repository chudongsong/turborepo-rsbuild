import { useDataHandle } from '@/hooks/tools'
import { getPhpSiteGzip, removePhpSiteGzip, setPhpSiteGzip } from '@/api/site'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()

export const compressFormRef = ref<any>() // 表单ref
export const viewLoading = ref(false) // 表单加载状态
export const formDisabled = ref(false) // 表单禁用状态
export const initStatus = ref(true) // 初始状态
export const compressData: { [key: string]: any } = reactive({
	status: false, // 内容压缩
	gzip_types: '', // 压缩类型
	comp_level: 1, // 压缩级别
	min_length: 1, // 压缩最小长度
	unit: 'k', // 压缩最小长度单位
})
export const lengthUnit = [
	{ label: 'k', value: 'k' },
	{ label: 'm', value: 'm' },
]
export const compressHelpList = [{ content: '用于对 HTTP 响应的内容进行压缩，以减少数据传输量，提高网站性能和加载速度' }, { content: '压缩级别1-9，越高压缩率越高，但也更消耗CPU' }, { content: '如果开启gzip后影响网站正常访问，请关闭此功能 和请求参数组成' }]
export const compressFormRules = {
	gzip_types: [{ required: true, message: '请输入压缩类型', trigger: ['blur', 'change'] }],
	min_length: [
		{
			required: true,
			message: '请输入正确的压缩最小长度',
			trigger: 'blur',
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('压缩最小长度不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else if (Number(value) < 1) {
					callback(new Error('请输入正确数字'))
				} else {
					callback()
				}
			},
		},
		{},
	],
}

export const onConfirmCompress = async () => {
	await compressFormRef.value.validate()
	const { gzip_types, comp_level, min_length, unit } = compressData
	const params = {
		site_name: siteInfo.value.name,
		gzip_types,
		comp_level,
		min_length: `${min_length}${unit}`,
	}
	await useDataHandle({
		loading: formDisabled,
		request: setPhpSiteGzip(params),
		message: true,
	})
}

export const changeCompressStatus = async () => {
	console.log('compressData', compressData.status)
	if (!compressData.status) {
		return await useDataHandle({
			loading: formDisabled,
			request: removePhpSiteGzip({ site_name: siteInfo.value.name }),
		})
	}
	getNginxGzip()
}

export const getNginxGzip = async () => {
	await useDataHandle({
		loading: formDisabled,
		request: getPhpSiteGzip({ site_name: siteInfo.value.name }),
		success: (res: any) => {
			const { gzip_types, comp_level, min_length } = res.data
			Object.assign(compressData, {
				gzip_types,
				comp_level,
				min_length: min_length.slice(0, -1),
				unit: min_length.slice(-1),
			})
			if (initStatus.value) {
				console.log('res.data.status', res.data.status)
				compressData.status = res.data.status
				initStatus.value = false
			}
			console.log('compressData55555', compressData)
		},
	})
}
