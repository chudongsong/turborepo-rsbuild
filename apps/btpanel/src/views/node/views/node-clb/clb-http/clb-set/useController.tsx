import { useDataHandle } from '@/hooks/tools'
import { setClbCache } from '@/api/node'
import { useClbHttpStore } from '../useStore'

export const tabActive = ref('errorCode')
export const formLoading = ref(false)
export const formDisabled = ref(false)

/*********  设置缓存   ************/
export const cacheFormRef = ref<any>() // 表单ref
export const cacheData = reactive({
	status: false, // 静态资源缓存
	time: '1', // 缓存时间
	unit: 'd', // 缓存时间单位
	cache_suffix: 'css,js,jpe,jpeg,gif,png,webp,woff,eot,ttf,svg,ico,css.map,js.map', // 缓存的文件后缀
})
export const timeUnit = [
	{ label: '分钟', value: 'm' },
	{
		label: '小时',
		value: 'h',
	},
	{
		label: '天',
		value: 'd',
	},
] // 缓存时间单位
export const cacheHelpList = [
	{ content: '缓存是一种用于加速网站性能和提高用户体验的技术' },
	{
		content: '开启后资源会被缓存，如果影响网站访问请关闭',
	},
	{
		content: '缓存键由主机名、URI 和请求参数组成',
	},
	{
		content: '默认忽略的响应头有：Set-Cookie|Cache-Control|expires|X-Accel-Expires',
	},
	{
		content: '默认缓存的静态资源有：css|js|jpg|jpeg|gif|png|webp|woff|eot|ttf|svg|ico|css.map|js.map',
	},
]

export const cacheFormRules = {
	time: [
		{
			required: true,
			message: '请输入正确的缓存时间',
			trigger: 'blur',
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('目标URL不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else if (Number(value) < 1) {
					callback(new Error('请输入正确数字'))
				} else {
					callback()
				}
			},
		},
	],
} // 表单验证规则

/**
 * @description 设置缓存
 * @param status 缓存状态
 */
export const setCacheEvent = (status: string | number | boolean) => {
	onConfirmCache()
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCache = async () => {
	const { httpRowData } = useClbHttpStore()
	const params = {
		load_id: httpRowData.value.load_id,
		proxy_cache_status: cacheData.status ? 1 : 0,
		cache_time: `${cacheData.time}${cacheData.unit}`,
		cache_suffix: cacheData.cache_suffix.replace(/，/g, ','),
	}
	await cacheFormRef.value.validate()
	const res: any = await useDataHandle({
		loading: formDisabled,
		request: setClbCache(params),
		message: true,
	})
	return res.status
}
/*********  设置缓存 end  ************/
