<template>
	<el-popover placement="top-start" :width="pluginInfoBak.name === 'redis' ? 140 : 200" class="" popper-class="white-tips-popover" trigger="hover">
		<div class="flex items-center justify-center">
			<span class="bt-link" @click="changeSoftStatus(pluginInfoBak.s_status ? 'stop' : 'start')">{{ softStatus }}</span>
			<bt-divider />
			<span class="bt-link" @click="changeSoftStatus('restart')">重启</span>
			<bt-divider />
			<span class="bt-link" @click="changeSoftStatus('reload')">重载</span>
			<bt-divider v-if="pluginInfoBak.name !== 'redis'" />
			<span v-if="pluginInfoBak.name !== 'redis'" class="bt-link" @click="openPluginView({ name: pluginInfoBak.name })">告警设置</span>
		</div>
		<template #reference>
			<div v-bt-loading="btnLoading" v-bt-loading:size="'small'" v-bind="$attrs">
				<el-button v-if="init" :type="pluginInfoBak.s_status ? 'default' : 'danger'" class="plugin-status-btn" plain @click="openPluginViewEvent">
					<div class="h-full inline-block flex items-center" :class="pluginInfoBak.s_status ? 'hover:text-primary' : 'hover:text-danger'">
						<span class="h-[2.2rem] w-[2.2rem] flex overflow-hidden justify-center items-center status-icon <2xl:hidden">
							<bt-image :src="`/static/icons/soft/ico-${pluginInfoBak.name || pluginName || 'defalut'}.svg`" class="inline-block" :all="true" />
						</span>
						<span>
							{{ pluginInfoBak.title }}
						</span>
						<span class="<2xl:hidden">&nbsp;{{ pluginInfoBak.version }}</span>
						<bt-icon :icon="'icon-' + (pluginInfoBak.s_status ? 'start' : 'stop')" class="ml-[4px]" :class="pluginInfoBak.s_status ? '!text-primary' : '!text-danger'" />
					</div>
				</el-button>
			</div>
		</template>
	</el-popover>
</template>

<script setup lang="ts">
import { defineModel } from 'vue'
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { openPluginView } from '@/public'
import { hasOwnProperty } from '@/utils'
import { getPluginInfo, serviceManage, getSoftStatus as getState } from '@api/global'

interface PluginInfoProps {
	title: string // 插件标题
	name: string // 插件名称
	status: boolean // 状态
	version: string // 版本
	admin: boolean // 是否为插件
	s_version: string // 服务版本
	s_status: boolean // 服务状态
	setup: boolean // 是否安装
}

interface Props {
	pluginInfo?: PluginInfoProps
	pluginName?: string
	isRequest?: boolean // 是否请求插件信息
}

type SoftStatusType = 'stop' | 'start' | 'restart' | 'reload'

const props = withDefaults(defineProps<Props>(), {
	isRequest: true,
	pluginName: 'defalut',
	pluginInfo: () => ({
		title: '',
		name: 'defalut',
		status: false,
		version: '',
		admin: false,
		setup: false,
		s_version: '',
		s_status: false,
	}),
})

const init = ref(false) // 初始化
const btnLoading = ref(false) // 按钮加载状态
const screenWidth = ref(0) // 屏幕宽度
const hasLoadedStatus = ref(false) // 是否已加载过状态
const pluginInfoBak = defineModel<AnyObject>('pluginInfo', {
	default: {
		title: '',
		name: '',
		status: true, // 默认显示启动状态，优先展示启动状态
		version: '',
		admin: false,
		s_version: '',
	},
}) // default: 分页显示数量   unknown: 当前页数量

enum SoftOperationType {
	stop = '停止',
	start = '启动',
	restart = '重启',
	reload = '重载',
}

// 软件状态
const softStatus = computed(() => {
	return SoftOperationType[pluginInfoBak.value.s_status ? 'stop' : 'start']
})

// 监听插件信息
watch(
	() => props.pluginInfo,
	(val: any) => {
		init.value = false
		if (props.isRequest) return
		// 判断结构数据是否为 getPluginInfo 请求的数据
		if (hasOwnProperty(val, 's_status')) {
			pluginInfoBak.value = { ...val }
		} else {
			const { title_en, name, version, admin, s_version, status } = val
			pluginInfoBak.value = {
				title: title_en,
				name,
				status, // 默认显示启动状态，优先展示启动状态
				version,
				admin,
				s_version,
				s_status: status,
			}
		}
		init.value = true
		// // console.log(props,'props')
		// init.value = false
		// if (val) {
		// 	// console.log(val, '监听插件信息 bt-soft-state')

		// 	// 如果是第一次加载，优先显示启动状态
		// 	if (!hasLoadedStatus.value) {
		// 		// 第一次加载时，保持启动状态显示
		// 		pluginInfoBak.value = { ...val, status: true } // 优先显示启动状态

		// 		// 如果有真实的状态数据，则更新状态
		// 		if (hasOwnProperty(val, 's_status')) {
		// 			console.log(val, '监听插件信息 bt-soft-state')
		// 			// 延迟更新状态，确保网络请求完成
		// 			setTimeout(() => {
		// 				if (val.setup) {
		// 					pluginInfoBak.value.status = val.s_status
		// 					hasLoadedStatus.value = true
		// 				} else {
		// 					// 如果未安装，显示关闭状态
		// 					pluginInfoBak.value.status = false
		// 					hasLoadedStatus.value = true
		// 				}
		// 			}, 100) // 短暂延迟确保状态稳定
		// 		}
		// 	} else {
		// 		// 已经加载过状态，直接更新
		// 		pluginInfoBak.value = val
		// 		if (hasOwnProperty(val, 's_status')) {
		// 			pluginInfoBak.value.status = val.s_status && val.setup
		// 		}
		// 	}

		// 	init.value = true
		// }
	},
	{
		immediate: true,
		deep: true,
	}
)

/**
 * @description: 获取软件状态
 */
const getSoftStatus = async () => {
	try {
		btnLoading.value = true
		const { data } = await getPluginInfo({ sName: props.pluginInfo.name || props.pluginName })
		console.log(data, 'getSoftStatus')
		// 成功获取状态后更新
		pluginInfoBak.value = data
		hasLoadedStatus.value = true
	} catch (error) {
		// 网络错误时，直接切换到关闭状态
		pluginInfoBak.value.s_status = false
		hasLoadedStatus.value = true
	} finally {
		btnLoading.value = false
		init.value = false
	}
}

const updateSoftStatus = async () => {
	try {
		const name = ['nginx', 'apache', 'openlitespeed'].includes(pluginInfoBak.value.name) ? 'web' : pluginInfoBak.value.name === 'pureftpd' ? 'pure-ftpd' : pluginInfoBak.value.name
		const { data } = await getState({ name })
		// 更新状态
		setTimeout(() => {
			pluginInfoBak.value = data
			hasLoadedStatus.value = true
		}, 100)
	} catch (error) {
		console.log(error)
		// 网络错误时，直接切换到关闭状态
		pluginInfoBak.value.status = false
	}
}

/**
 * @description 打开插件视图
 */
const openPluginViewEvent = () => {
	openPluginView({ name: pluginInfoBak.value.name })
}

/**
 * @description: 改变软件状态
 * @param {string} value 操作类型
 * @return {Promise<void>}
 */
const changeSoftStatus = async (value: SoftStatusType) => {
	try {
		const type = SoftOperationType[value]
		const version = props.pluginInfo.s_version
		// 确认操作
		await useConfirm({
			title: type + version,
			icon: 'warning-filled',
			content: `你确定要${type}${version}服务，是否继续？`,
		})
		// 改变软件状态
		await useDataHandle({
			loading: btnLoading,
			request: serviceManage({
				name: version,
				type: value,
			}),
			message: true,
			success: async () => {
				// 若为database site ftp 则使用该方法更新软件状态
				await updateSoftStatus()
				// 操作成功后，确保状态已加载
				hasLoadedStatus.value = true
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 屏幕宽度
 */
const screenWidthFn = () => {
	screenWidth.value = document.body.clientWidth
}

// 监听屏幕宽度

onMounted(() => {
	console.log(props, 'props')
	if ((props.pluginInfo.title || props.pluginName) && props.isRequest) getSoftStatus() // 如果插件信息存在则获取软件状态
	screenWidthFn() //
	window.onresize = screenWidthFn
})
</script>

<style lang="css" scoped>
.plugin-status-btn.el-button--danger {
	color: var(--el-color-text-secondary);
}
.plugin-status-btn.el-button--danger:hover {
	color: var(--el-color-danger) !important;
	background: rgba(var(--el-color-danger), 0.2) !important;
	border-color: rgba(var(--el-color-danger), 0.3) !important;
}
.plugin-status-btn.el-button--danger:focus {
	color: var(--el-color-danger) !important;
	background: rgba(var(--el-color-danger), 0.2) !important;
	border-color: rgba(var(--el-color-danger), 0.3) !important;
}
:deep(.el-loading-spinner .circular) {
	@apply h-[3rem] w-[3rem];
}
:deep(.el-loading-spinner) {
	@apply mt-[-15px];
}
</style>
