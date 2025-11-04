import BtInstallMask from '@/components/business/bt-install-mask/index.vue'
import { useRoute } from 'vue-router'
// 请求参数
interface UseInstallProps {
	name?: string // session存储标识
	request?: AnyFunction
	extension?: AnyObject[]
	options?: SoftInstallOptionProps
}

// 选项参数
export interface SoftInstallOptionProps {
	name: string
	title: string
	status: boolean
	setup: boolean
	version: string
	s_version?: string
}

/**
 * @description 软件安装蒙层
 * @param {useMaskProps} { request, options } 请求参数
 * @returns
 */
export const useSoftInstallMask = (props: UseInstallProps) => {
	if (!props.request && !props.options) {
		throw new Error('请传入request或者options参数')
	}
	const softInfo = ref<SoftInstallOptionProps>({
		name: '',
		version: '',
		setup: false,
		status: false,
		title: props.name || '',
	}) // 软件信息

	const maskLayer = useSessionStorage(`_${props.name}_mask`, false) // 环境检测遮罩层

	// 检测安装状态
	const checkInstallRequest = async () => {
		if (!props.request) return
		const rdata = await props.request() // 检查是否安装
		softInfo.value = rdata
		maskLayer.value = !softInfo.value.setup
	}

	// 扩展参数
	if (props?.extension && props.extension.length) {
		props?.extension.forEach(item => {
			item.install(softInfo.value) // 将表格传入到扩展参数
		})
	}
	if (props?.options) {
		softInfo.value = props.options
		maskLayer.value = !softInfo.value.setup
	}

	return {
		// 注册蒙层
		init: async () => {
			await checkInstallRequest()
			return {
				BtSoftInstallMask: defineComponent(() => {
					return () => (!softInfo.value.setup ? <BtInstallMask options={softInfo.value}></BtInstallMask> : null)
				}),
			}
			// return <>{!softInfo.value.setup ? <BtInstallMask options={softInfo.value}></BtInstallMask> : null}</>
		},
		checkInstallRequest,
		BtSoftInstallMask: () => <>{maskLayer.value ? <BtInstallMask options={softInfo.value}></BtInstallMask> : null}</>,
	}
}
