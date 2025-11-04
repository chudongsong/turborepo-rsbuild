<template>
	<div class="h-full relative" v-bt-loading="viewLoading" v-bt-loading:title="'正在加载配置文件，请稍后...'">
		<div class="bg-darkTertiary flex items-center justify-center h-[72rem]" v-if="!configList.length">
			<div class="bg-white px-48px py-16px text-default">暂无配置文件</div>
		</div>

		<bt-tabs type="card" v-model="tabActive" @change="handleClickTab" v-if="configList.length">
			<template v-for="config in configList">
				<el-tab-pane v-if="config.status" :key="config.path" :label="config.name" :lazy="true" :name="config.path">
					<div v-if="isBindExtranet">
						<span class="inline-block text-secondary items-center flex">
							文件位置：
							<div v-show="config.type !== 'spring'" class="max-w-[55rem] truncate leading-[1.3] inline-block">
								<bt-ellipsis-tooltip :text="config.path" />
							</div>
							<el-select v-show="config.type === 'spring'" class="!w-[26rem]" v-model="springConfig" @change="getConfigData(config)">
								<el-option v-for="item in config.options" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
							<span class="ml-[2rem] svgtofont-el-document-copy cursor-pointer" @click="copyText({ value: config.type === 'spring' ? springConfig : config.path })"></span
						></span>
						<!-- nginx apache opensite..需要测试 -->
						<div class="my-12px">
							<bt-editor v-bt-loading="textLoading" class="!h-[54rem] !w-[64rem] border border-dark rounded-base" v-model="staticContent" :request="false" @save="saveData" :editorOption="editorOption" />
						</div>
						<div class="flex" v-if="config.type !== 'spring' || allowEdit">
							<el-button type="primary" @click="saveData">保存</el-button>
						</div>
						<div v-else class="text-secondary">此文件为jar内部文件，不允许编辑</div>
					</div>
					<div class="bg-darkTertiary flex items-center justify-center h-full" v-else>
						<div class="bg-white px-48px py-16px text-default flex items-center">请开启 <bt-link @click="jumpTabEvent('mapping')">外网映射</bt-link> 后查看配置信息</div>
					</div>
				</el-tab-pane>
			</template>
		</bt-tabs>
	</div>
</template>

<script setup lang="tsx">
import BtEllipsisTooltip from '@/components/extension/bt-ellipsis-tooltip/index.vue'
import { useHandleError } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { copyText } from '@/utils'
import { getFileBody, getJavaProjectConfigList, getRewriteTel, saveFileBody } from '@api/site'
import { SITE_STORE, useSiteStore } from '@site/useStore'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { siteInfo } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

const Message = useMessage() // 消息提示

const viewLoading = ref<boolean>(false) // 页面加载
const tabActive = ref('') // 当前激活的tab
const isBindExtranet = ref<boolean>(false) // 外网映射

const configList = ref<any[]>([]) // 配置文件列表

const staticContent = ref('') // 静态内容\
const textLoading = ref<boolean>(false) // 文本加载

const springConfig = ref('') // Spring配置
const allowEdit = ref(false) // 是否允许编辑
let allowEditPath: Array<string> = [] // 允许编辑的配置文件路径
let staticConfigData: any = {} // 静态配置文件数据

const siteType = ref('') // 站点类型

const editorOption = computed(() => {
	return { readOnly: configList.value.find(config => config.path === tabActive.value)?.type === 'spring' }
})

/**
 * @description 获取配置文件列表
 * @param path
 */
const getFilesList = async () => {
	try {
		viewLoading.value = true
		const { data: res } = await getJavaProjectConfigList({
			project_name: siteInfo.value.name,
		})
		if (!res.status) {
			Message.error(res.msg)
			return
		}
		allowEditPath = []
		staticConfigData = {}
		const tabList = res.data.filter((item: any) => item.name !== '伪静态配置文件' && !item.type.includes('spring'))
		const springList = res.data.filter((item: any) => item.name !== '伪静态配置文件' && item.type.includes('spring') && item.status)
		configList.value = [
			...tabList,
			...(springList.length
				? [
						{
							name: 'Spring配置',
							path: 'spring',
							type: 'spring',
							options: springList.map((item: any) => {
								if (item.type === 'local_spring') {
									allowEditPath.push(item.path)
								} else {
									staticConfigData[item.path] = item.data
								}
								return {
									label: item.path,
									value: item.path,
									type: item.type,
								}
							}),
							status: true,
						},
				  ]
				: []),
		]
		if (configList.value.length > 0) {
			const config = configList.value.find((config: any) => config.status === true)
			if (config) {
				tabActive.value = config.path
				if (springList.length > 0) {
					springConfig.value = springList[0].path
				}
			}
			getConfigData(config)
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}
/**
 * @description 获取配置文件
 * @param path
 */
const getConfigData = async (config: { path: string; type: string; data?: string }) => {
	if (!isBindExtranet.value) {
		return
	}
	try {
		if (config.data) return (staticContent.value = config.data)
		textLoading.value = true
		let path = config.path
		if (config.type === 'spring') {
			path = springConfig.value
			allowEdit.value = allowEditPath.includes(path)
			// 如果存在静态配置文件数据，则直接赋值
			if (staticConfigData[path]) {
				staticContent.value = staticConfigData[path]
				return
			}
		}
		const { data: res } = await getFileBody({
			path,
		})
		staticContent.value = res.data
		textLoading.value = false
	} catch (error) {
		useHandleError(error)
		staticContent.value = ''
	} finally {
		textLoading.value = false
	}
}
/**
 * @description tab切换
 * @param tab  tab切换
 */
const handleClickTab = async (tab: any) => {
	getConfigData(configList.value.find(config => config.path === tab))
}

/**
 * @description 保存内容
 */
const saveData = async () => {
	let loading = Message.load('正在保存内容，请稍候...')
	try {
		let path = tabActive.value.includes('spring') ? springConfig.value : configList.value.find(config => config.path === tabActive.value).path
		const res: any = await saveFileBody({
			data: staticContent.value,
			encoding: 'utf-8',
			path,
		})
		Message.msg({
			dangerouslyUseHTMLString: true,
			message: `<div>${res.msg}</div>`,
			type: res.status ? 'success' : 'error',
			duration: res.status ? 2000 : 0,
			showClose: !res.status,
			customClass: '!max-w-[70rem]',
		}) // 提示错误信息
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

watch(
	() => siteInfo.value,
	val => {
		if (siteInfo.value.project_config?.bind_extranet) {
			isBindExtranet.value = siteInfo.value.project_config.bind_extranet ? true : false
		}
	},
	{ immediate: true }
)
const init = async () => {
	let type: any = siteInfo.value.project_type.toLowerCase()
	siteType.value = type
	isBindExtranet.value = true
	getFilesList()
}

onMounted(init)
defineExpose({ init })

onUnmounted(() => {
	configList.value = []
})
</script>
