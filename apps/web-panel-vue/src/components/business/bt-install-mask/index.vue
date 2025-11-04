<template>
	<div>
		<!-- 主体遮罩 -->
		<div class="software-mask"></div>
		<div class="software-install">
			<div class="software-view">
				<div v-if="!$slots.content" class="flex items-center">
					<i class="svgtofont-el-warning text-warning mr-[4px] !text-extraLarge"></i>
					<!-- <bt-icon icon="el-warning" :size="30" class="mr-[8px]" color="orange" /> -->
					<template v-for="(item, index) in pluginOptions" :key="index">
						<div class="flex text-base font-black">
							<span class="mr-[1rem]">未安装 {{ item.title }}</span>
							<span class="bt-link text-base" @click="pluginInstall"> 立即安装 </span>
						</div>
						<bt-divider v-if="pluginOptions.length < index" />
					</template>
				</div>
				<!-- 安装插件 -->
				<slot name="content"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getPluginInfo } from '@/api/global'
import { pluginInstallDialog } from '@/public'
import { isArray } from '@/utils'

interface PluginInfo {
	name: string // 插件名称
	title: string // 插件标题
}

interface Props {
	options?: PluginInfo | PluginInfo[]
	icon?: boolean
	width?: string
	height?: string
}

// 声明组件传参
const props = withDefaults(defineProps<Props>(), {
	options: () => ({
		name: '',
		title: '',
	}),
})

const { options } = toRefs(props)

// 插件选项
const pluginOptions = computed(() => {
	if (isArray(options.value)) return options.value
	return [options.value]
})

const pluginInstall = async () => {
	const { data } = await getPluginInfo({ sName: options.value.name })
	// 打开安装介绍弹窗
	pluginInstallDialog({
		name: options.value.name,
		type: 'i',
		pluginInfo: data,
	})
}

// const pluginData = ref<AnyObject>({}) // 插件数据
// const errorStatus = ref(false) // 错误状态 - 默认不显示
// const errorData = ref({
// 	// 错误数据 -后期使用store中的数据
// 	msg: 'database is read only!',
// 	desc: '系统根目录磁盘已满，面板数据库已更改为只读模式，面板部分功能无法正常使用，请立即前往文件管理清理磁盘空间',
// 	status: false,
// })

// 宽度
// const width = computed(() => {
// 	if (errorData.value.status && errorStatus.value) return '64rem'
// 	return props.showConfig.width || '40rem'
// })

// 高度
// const height = computed(() => {
// 	if (errorData.value.status && errorStatus.value) return '20rem'
// 	return props.showConfig.height || '6rem'
// })

// 是否显示图标
// const icon = computed(() => {
// 	// 当有错误信息时不显示
// 	if (errorData.value.status && errorStatus.value) return false
// 	if (isBoolean(props.showConfig.showIcon)) return props.showConfig.showIcon
// 	return true
// })

/**
 * @description 检查软件状态
 * @description 若存在软件判定，则发送请求判断是否安装
 */
// const checkSoftStatus = async () => {
// 	try {
// 		// 单换
// 		if (isString(props.soft)) {
// 			const { data } = await getPluginInfo({ sName: props.soft })
// 			pluginData.value = data // 设置插件数据
// 			modelVal.value = !data.setup // 设置显示状态
// 			if (modelVal.value) errorStatus.value = false // 若显示则不显示错误信息
// 		}
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// /**
//  * @description 安装插件
//  * @param {string} sName 插件名称
//  */
// const installPlugin = async (sName?: string) => {
// 	if (sName) {
// 		const { data } = await getPluginInfo({ sName })
// 		pluginData.value = data
// 	}
// 	// 打开安装介绍弹窗
// 	pluginInstallDialog({
// 		name: pluginData.value?.name,
// 		type: 'i',
// 		pluginInfo: pluginData.value,
// 	})
// }

/**
 * @description 初始化
 */
// const init = () => {
// 若存在软件传入，则判断是否安装显示遮罩
// if (props.soft) checkSoftStatus()
// 若存在定义传入，优先显示自定义传入内容-即使有错误信息
// if (!modelVal.value && errorData.value.status) errorStatus.value = true
// 若有请求方法,则执行方法获取visible - 看情况是否需要
// if (props.requestVisible && isFunction(props.requestVisible))
// 	modelVal.value = props.requestVisible()
// }

onMounted(() => {
	// init()
})

// left: 50%;
// top: 50%;
// margin-left: -20rem;
// margin-top: -2.5rem;
</script>

<style lang="css" scoped>
.software-mask {
	position: absolute;
	left: 0;
	top: 0;
	background-color: rgba(var(--el-color-white-rgb), 1);
	opacity: 0.7;
	height: 100%;
	width: 100%;
	z-index: 99;
	border-radius: var(--el-border-radius-medium);
	/* // Assuming 'rounded-base' maps to 0.5rem */
}

.software-install {
	display: flex;
	justify-content: center;
}

.software-view {
	box-shadow: 0 0 10px 1px var(--el-fill-color);
	border: 1px solid var(--el-color-border-extra-light);
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	padding-left: 24px;
	padding-right: 24px;
	border-radius: var(--el-border-radius-small);
	position: absolute;
	z-index: 100;
	background-color: rgba(var(--el-color-white-rgb), 1);
	margin: auto;
	width: fit-content;
	height: fit-content;
	right: 0;
	left: 0;
	top: 0;
	bottom: 0;
}
</style>
