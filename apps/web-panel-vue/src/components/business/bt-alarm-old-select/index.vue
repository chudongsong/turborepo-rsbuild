<template>
	<BtSelect v-model="modelVal" v-bt-loading="loading" :multiple="multiple" :options="options" placeholder="请选择告警方式" @change="cutSelectType" />
</template>

<script setup lang="tsx">
import { SelectCustomProps } from '@/components/form/bt-select/types'
import { useMessage } from '@/hooks/tools'
import { setAlarmModuleDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { isString } from '@/utils'
import { installAlarmModule } from '@api/global'

const { getOldSenderAlarmListInfo, push } = useGlobalStore()

interface Props {
	version?: string // 版本
	allAlarm?: boolean // 是否显示全部告警
	multiple?: boolean // 是否多选
	limit?: string[] // 限制类型
	options?: any[] // 选项
	isDefault?: boolean // 是否默认选中第一个已配置
	isShowApi?: boolean // 是否显示api告警 用户自己的告警
}

interface OptionsProps {
	title: string
	name: string
	data: AnyObject
	setup: boolean
	isSetAlarm: boolean
}

// 默认值
const props = withDefaults(defineProps<Props>(), {
	multiple: () => true, // 是否多选
	limit: () => [], // 限制类型
	isDefault: false, // 是否默认选中第一个
	allAlarm: false, // 是否显示全部告警
	isShowApi: true, // 是否显示api告警 用户自己的告警
})

const { load: $load, error: $error } = useMessage()
const loading = ref(false)

// 双向绑定值
const modelVal = defineModel()

// 常规告警方式
const routeList = ['dingding', 'feishu', 'mail', 'weixin', 'wx_account', 'sms']

// 监听事件
// const emit = defineEmits<{
//   (event: 'change', val: string[]): void;
// }>();

const emit = defineEmits(['change'])

// 选项
const options = shallowRef<SelectCustomProps[]>([])

/**
 * @description 切换select
 * @param {string[] | string} val
 */
const cutSelectType = (val: string[]) => {
	emit('change', val)
}

/**
 * @description 渲染旧版告警模块
 */
const renderOldAlarmModule = async () => {
	try {
		loading.value = true
		await getOldSenderAlarmListInfo()
		const arry = []
		// eslint-disable-next-line no-restricted-syntax
		for (const key in push.value.old) {
			if (Object.prototype.hasOwnProperty.call(push.value.old, key)) {
				const item = push.value.old[key] as OptionsProps
				if (item.setup && !props.limit.includes(item.name)) {
					const setAlarm = !(JSON.stringify(item.data) === '{}')
					item.isSetAlarm = setAlarm
					arry.push({
						label: item.title,
						value: item.name,
						disabled: !item.setup || !setAlarm,
						isSetAlarm: !setAlarm,
						render: () => {
							const status = !item.setup || !setAlarm
							return (
								<div class="flex justify-between">
									<span>{item.title}</span>
									<span class={`${status ? 'text-danger' : 'hover:text-primary'} cursor-pointer mr-[4px]`}>
										<span
											onClick={e => {
												e.stopPropagation()
												setAlarmModule(item)
											}}>
											{status ? '[未配置]' : '[已配置]'}
										</span>
									</span>
								</div>
							)
						},
					})
				}
			}
		}
		options.value = arry
		if (props.options) {
			options.value = [...props.options, ...arry]
		}

		// 是否显示api告警
		if (!props.isShowApi) {
			options.value = options.value.filter(i => routeList.includes(i.value))
		}

		// 若传入allAlarm为true，则加入 全部 选项
		if (props.allAlarm) {
			options.value.unshift({
				label: '全部',
				value: 'all',
				disabled: false,
				isSetAlarm: false,
				render: () => {
					return (
						<div class="flex justify-between">
							全部
							<span></span>
						</div>
					)
				},
			})
		}

		// 当前选中的值不在options中时，删除
		if (Array.isArray(modelVal.value) && modelVal.value.length) {
			modelVal.value.forEach((item: string) => {
				if (!options.value.find(i => i.value === item)) {
					modelVal.value = modelVal.value.filter((i: string) => i !== item)
				}
			})
		} else if (isString(modelVal.value) && modelVal.value) {
			if (!options.value.find(i => i.value === modelVal.value)) {
				modelVal.value = ''
			}
		}

		if (props.isDefault && !modelVal.value) {
			const disabledArr = arry.filter(i => !i.disabled)
			if (disabledArr.length) modelVal.value = props.multiple ? [disabledArr[0].value] : disabledArr[0].value
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

/**
 * @description 设置告警模块
 * @param {OptionsProps} item 选项
 */
const setAlarmModule = async (item: OptionsProps) => {
	const moduleList = [
		{ title: '钉钉机器人', type: 'dingding' },
		{ title: '飞书机器人', type: 'feishu' },
		{ title: '邮箱', type: 'mail' },
		{ title: '企业微信机器人', type: 'weixin' },
		{ title: '微信公众号', type: 'wx_account' },
	]
	const moduleOptions = moduleList.find(i => i.type === item.name) || {
		title: '',
		type: '',
		data: {},
	}
	if (item.name === 'wx_account' && !item.setup) await installModule(item.name) // 安装微信公众号模块
	setAlarmModuleDialog({ ...moduleOptions, callback: renderOldAlarmModule })
}

/**
 * @description 安装模块
 * @param {string} name 模块名称
 */
const installModule = async (name: string) => {
	const loadInstall = $load('正在安装模块，请稍后...')
	try {
		await installAlarmModule({ name })
	} catch (error) {
		console.log(error)
	} finally {
		loadInstall.close()
	}
}

onMounted(renderOldAlarmModule)

defineExpose({ refresh: renderOldAlarmModule })
</script>
