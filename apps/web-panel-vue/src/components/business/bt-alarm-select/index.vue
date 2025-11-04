<template>
	<BtSelect v-model="modelVal" v-bt-loading="loading" :multiple="multiple" :options="filteredOptions" @change="cutSelectType" placeholder="请选择告警方式" />
</template>

<script setup lang="tsx">
import type { SelectCustomProps } from '@/components/form/bt-select/types'
import { installAlarmModule } from '@api/global'
import { useMessage } from '@/hooks/tools'
import { setAlarmModuleDialog } from '@/public'
import { useGlobalStore } from '@/store/global'

const { getSenderAlarmListInfo, push } = useGlobalStore()

interface Props {
	multiple?: boolean // 是否多选
	limit?: string[] // 限制类型
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
})

const { load: $load, error: $error } = useMessage()

const loading = ref(false)

// 双向绑定值
const modelVal = defineModel()

// 监听事件
const emit = defineEmits<{
	(event: 'change', val: string[]): void
}>()

// 选项
const options = shallowRef<SelectCustomProps[]>([])

/**
 * @description 切换select
 * @param {string[] | string} val
 */
const cutSelectType = (val: string[]) => {
	emit('change', val)
}

// 类型模型
const typeModel = [
	{ title: '钉钉', type: 'dingding' },
	{ title: '飞书', type: 'feishu' },
	{ title: '邮箱', type: 'mail' },
	{ title: '企业微信', type: 'weixin' },
	{ title: '微信公众号', type: 'wx_account' },
	{ title: '短信通知', type: 'sms' },
	{ title: '自定义消息通道', type: 'webhook' },
]

/**
 * @description 渲染旧版告警模块
 */
const renderOldAlarmModule = async () => {
	try {
		const list: { title: string; type: string }[] = [...typeModel]
		loading.value = true
		await getSenderAlarmListInfo(false)
		options.value = []
		const configuredItems: AnyObject[] = push.value.config.filter((item: any) => item.used && !props.limit.includes(item.sender_type))
		const unconfiguredItems = list.filter(item => !configuredItems.some(config => config.sender_type === item.type) && !props.limit.includes(item.type))

		configuredItems.forEach(item => {
			const data = typeModel.find(i => i.type === item.sender_type) as { title: string; type: string }
			let title = item.data?.title ? item.data.title + (item.data.title ? ` (${data?.title || ''})` : '') : data.title
			if (item.sender_type === 'sms') {
				if (!item.data.total) return false
				title = `短信通知 (${item.data.count}条)`
			}

			options.value.push({
				label: title || data.title,
				value: item.id,
				disabled: false,
				render: () => (
					<div class="flex justify-between">
						<span class="mr-[10px]">{title}</span>
						<span class="hover:text-primary cursor-pointer mr-[4px]">
							<span
								onClick={e => {
									e.stopPropagation()
									setAlarmModule({ ...data, data: item, name: item.sender_type, setup: true, isSetAlarm: true })
								}}>
								{item.sender_type !== 'sms' ? '[已配置]' : ''}
							</span>
						</span>
					</div>
				),
			})
		})

		unconfiguredItems.forEach(item => {
			options.value.push({
				label: item.title,
				value: '',
				disabled: true,
				render: () => (
					<div class="flex justify-between">
						<span>{item.title}</span>
						<span
							class="text-danger cursor-pointer mr-[4px]"
							onClick={e => {
								e.stopPropagation()
								setAlarmModule({ ...item, setup: false, name: item.type, data: {}, isSetAlarm: false })
							}}>
							{item.type !== 'sms' ? '[未配置]' : ''}
						</span>
					</div>
				),
			})
		})
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
		{ title: '自定义消息通道', type: 'webhook' },
		{ title: '短信通知', type: 'sms' },
	]
	const moduleOptions = moduleList.find(i => i.type === item.name) || { title: '', type: '', data: {} }
	setAlarmModuleDialog({ ...moduleOptions, data: item })
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

defineExpose({
	refresh: renderOldAlarmModule,
})

onMounted(renderOldAlarmModule)

// 计算属性来过滤选项
const filteredOptions = computed(() => {
	if (!props.limit?.length) return options.value

	return options.value.filter(option => {
		// 从选项的label或render中提取类型
		const type = typeModel.find(t => option.label?.includes(t.title) || (typeof option.render === 'function' && option.render().toString().includes(t.title)))?.type

		return !props.limit.includes(type)
	})
})

// 监听 limit 变化，清除被限制的选项
watch(
	[() => props.limit, () => options.value],
	([newLimit, newOptions]) => {
		if (!newLimit?.length || !modelVal.value || !newOptions?.length) return

		// 如果是多选
		if (Array.isArray(modelVal.value)) {
			const validOptions = filteredOptions.value.map(opt => opt.value)
			// 只有当有效选项加载完成后才过滤
			if (validOptions.length > 0) {
				modelVal.value = modelVal.value.filter(val => validOptions.includes(val))
			}
		}
		// 如果是单选
		else if (!filteredOptions.value.some(opt => opt.value === modelVal.value)) {
			modelVal.value = undefined
		}
	},
	{ deep: true, immediate: true }
)

// 添加一个新的监听器来处理初始值
watch(
	() => options.value,
	newOptions => {
		if (!newOptions?.length || !modelVal.value) return

		// 确保选项加载完成后再进行过滤
		nextTick(() => {
			const validOptions = filteredOptions.value.map(opt => opt.value)
			if (Array.isArray(modelVal.value)) {
				modelVal.value = modelVal.value.filter(val => validOptions.includes(val))
			} else if (!validOptions.includes(modelVal.value)) {
				modelVal.value = undefined
			}
		})
	},
	{ immediate: true }
)
</script>

<style lang="css" scoped></style>
