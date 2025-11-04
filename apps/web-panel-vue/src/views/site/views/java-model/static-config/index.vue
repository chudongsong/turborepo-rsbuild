<template>
	<div class="h-full relative" v-bt-loading="viewLoading" v-bt-loading:title="'正在加载配置文件，请稍后...'">
		<div class="bg-darkTertiary flex items-center justify-center h-[72rem]" v-if="!configData?.path">
			<div class="bg-white px-48px py-16px text-default">暂无配置文件</div>
		</div>

		<div v-if="isBindExtranet && configData?.path">
			<span class="inline-block text-secondary items-center flex">
				文件位置：
				<div class="max-w-[55rem] truncate leading-[1.3] inline-block">
					<bt-ellipsis-tooltip :text="configData.path" />
				</div>
				<span class="ml-[2rem] svgtofont-el-document-copy cursor-pointer" @click="copyText({ value: configData.path })"></span
			></span>
			<!-- nginx apache opensite..需要测试 -->
			<div class="my-12px">
				<bt-editor v-bt-loading="textLoading" class="!h-[54rem] !w-[64rem] border border-dark rounded-base" v-model="staticContent" :request="false" @save="saveData" :editorOption="{ readonly: configData.type === 'spring' }" />
			</div>
			<div class="flex" v-if="configData.type !== 'spring'">
				<el-button type="primary" @click="saveData">保存</el-button>
			</div>
		</div>
		<div class="bg-darkTertiary flex items-center justify-center h-[72rem]" v-else>
			<div class="bg-white px-48px py-16px text-default flex items-center">请开启 <bt-link @click="jumpTabEvent('mapping')">外网映射</bt-link> 后查看配置信息</div>
		</div>
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

const configData = ref<any>({}) // 配置文件数据

const staticContent = ref('') // 静态内容\
const textLoading = ref<boolean>(false) // 文本加载

const siteType = ref('') // 站点类型

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
		configData.value = res.data.find((item: any) => item.name === '伪静态配置文件')
		if (configData.value) {
			tabActive.value = configData.value.path
			getConfigData(configData.value)
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
		const { data: res } = await getFileBody({
			path: config.path,
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
 * @description 保存内容
 */
const saveData = async () => {
	let loading = Message.load('正在保存内容，请稍候...')
	try {
		const res: any = await saveFileBody({
			data: staticContent.value,
			encoding: 'utf-8',
			path: configData.value.path,
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
	configData.value = {}
})
</script>
